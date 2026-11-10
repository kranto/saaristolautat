FROM python:3.13-alpine

WORKDIR /app
COPY scripts/liveupdate.py ./liveupdate.py

RUN addgroup -S liveupdate && adduser -S -G liveupdate liveupdate \
    && mkdir -p /var/lib/saaristolautat/live \
    && chown -R liveupdate:liveupdate /var/lib/saaristolautat

USER liveupdate

CMD ["python", "-u", "liveupdate.py"]

