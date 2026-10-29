"""Continuously publish Saaristolautat AIS snapshots and three-hour tracks."""

from __future__ import annotations

import json
import gzip
import os
import sqlite3
import tempfile
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API_BASE_URL = os.environ.get(
    "DIGITRAFFIC_AIS_URL", "https://meri.digitraffic.fi/api/ais/v1"
)
OUTPUT_DIR = Path(os.environ.get("LIVE_OUTPUT_DIR", "."))
DATABASE = Path(os.environ.get("LIVE_DATABASE", OUTPUT_DIR / "lauttalive.db"))
POLL_SECONDS = max(10, int(os.environ.get("LIVE_POLL_SECONDS", "30")))
HISTORY_SECONDS = 3 * 60 * 60
LOCATION_LOOKBACK_SECONDS = 5 * 60 * 60
KNOWN_PASSENGER_VESSELS = {230129940, 230167360, 230181340, 230987550}
USER_AGENT = "SaaristolautatLive/13.0 (saaristolautat.fi)"


def fetch_json(path: str, query: dict[str, object] | None = None):
    url = f"{API_BASE_URL}/{path}"
    if query:
        url = f"{url}?{urlencode(query)}"
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "Digitraffic-User": "Saaristolautat.fi",
            "User-Agent": USER_AGENT,
        },
    )
    with urlopen(request, timeout=25) as response:
        payload = response.read()
        if response.headers.get("Content-Encoding", "").lower() == "gzip":
            payload = gzip.decompress(payload)
        return json.loads(payload)


def atomic_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        dir=path.parent, prefix=f".{path.name}.", suffix=".tmp"
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as output:
            os.fchmod(output.fileno(), 0o644)
            json.dump(value, output, ensure_ascii=False, separators=(",", ":"))
            output.write("\n")
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary_name, path)
    except BaseException:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass
        raise


def initialize_database(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS snapshots (
            mmsi INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            sog REAL NOT NULL,
            heading REAL NOT NULL,
            PRIMARY KEY (mmsi, timestamp)
        )
        """
    )
    connection.execute(
        "CREATE INDEX IF NOT EXISTS snapshots_timestamp ON snapshots(timestamp)"
    )
    connection.commit()


def passenger_vessels(metadata: list[dict]) -> dict[int, dict]:
    return {
        int(vessel["mmsi"]): vessel
        for vessel in metadata
        if vessel.get("shipType") in (0, 60)
        or int(vessel.get("mmsi", 0)) in KNOWN_PASSENGER_VESSELS
    }


def current_locations(vessels: dict[int, dict]) -> dict:
    now_ms = int(time.time() * 1000)
    locations = fetch_json(
        "locations",
        {
            "latitude": 60,
            "longitude": 20.5,
            "radius": 200,
            "from": now_ms - LOCATION_LOOKBACK_SECONDS * 1000,
        },
    )
    features = []
    for feature in locations.get("features", []):
        mmsi = int(feature.get("mmsi", 0))
        if mmsi not in vessels:
            continue
        properties = feature.setdefault("properties", {})
        properties["vessel"] = vessels[mmsi]
        properties["mmsi"] = mmsi
        features.append(feature)
    locations["features"] = features
    locations.setdefault("type", "FeatureCollection")
    return locations


def store_snapshots(connection: sqlite3.Connection, features: list[dict]) -> None:
    rows = []
    for feature in features:
        properties = feature["properties"]
        longitude, latitude = feature["geometry"]["coordinates"][:2]
        rows.append(
            (
                int(feature["mmsi"]),
                int(properties["timestampExternal"]),
                round(float(latitude), 6),
                round(float(longitude), 6),
                float(properties.get("sog", 0)),
                float(properties.get("heading", 0)),
            )
        )
    connection.executemany(
        "INSERT OR REPLACE INTO snapshots VALUES (?, ?, ?, ?, ?, ?)", rows
    )
    cutoff = int((time.time() - HISTORY_SECONDS - 3600) * 1000)
    connection.execute("DELETE FROM snapshots WHERE timestamp < ?", (cutoff,))
    connection.commit()


def jumped(previous: tuple | None, row: tuple) -> bool:
    if previous is None:
        return False
    return (
        abs(row[1] - previous[1]) > 300_000
        or abs(row[2] - previous[2]) > 0.1
        or abs(row[3] - previous[3]) > 0.1
    )


def history_geojson(connection: sqlite3.Connection) -> dict:
    cutoff = int((time.time() - HISTORY_SECONDS) * 1000)
    rows = connection.execute(
        """
        SELECT mmsi, timestamp, latitude, longitude, sog, heading
        FROM snapshots
        WHERE timestamp > ? AND sog > 0.1
        ORDER BY mmsi, timestamp DESC
        """,
        (cutoff,),
    )

    features = []
    feature = None
    previous = None
    current_mmsi = None
    for row in rows:
        mmsi = row[0]
        if mmsi != current_mmsi:
            feature = {
                "type": "Feature",
                "mmsi": mmsi,
                "id": f"h{mmsi}",
                "properties": {},
                "geometry": {"type": "MultiLineString", "coordinates": [[]]},
            }
            features.append(feature)
            current_mmsi = mmsi
            previous = None
        elif jumped(previous, row):
            feature["geometry"]["coordinates"].append([])

        feature["geometry"]["coordinates"][-1].append(
            [round(row[3], 6), round(row[2], 6)]
        )
        previous = row

    return {"type": "FeatureCollection", "features": features}


def update(connection: sqlite3.Connection, write_history: bool) -> None:
    vessels = passenger_vessels(fetch_json("vessels"))
    locations = current_locations(vessels)
    atomic_json(OUTPUT_DIR / "livedata.json", locations)
    if write_history:
        store_snapshots(connection, locations["features"])
        atomic_json(OUTPUT_DIR / "livehistory.json", history_geojson(connection))
    print(
        f"Published {len(locations['features'])} vessels"
        + (" and history" if write_history else ""),
        flush=True,
    )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    DATABASE.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE)
    initialize_database(connection)
    publish_history = True

    while True:
        started = time.monotonic()
        try:
            update(connection, publish_history)
            publish_history = not publish_history
        except Exception as error:
            print(f"Live update failed: {error!r}", flush=True)
        delay = max(1, POLL_SECONDS - (time.monotonic() - started))
        time.sleep(delay)


if __name__ == "__main__":
    main()
