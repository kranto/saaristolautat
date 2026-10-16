
const messagesRaw = { // FI SV EN
    duration: {
        minutes: ["{1} {0} minuuttia", "{1} {0} minuter", "{1} {0} minutes"],
        hours: ["{1} {0} tuntia", "{1} {0} timmar", "{1} {0} hours"],
        hoursminutes: ["{2} {0} tuntia {1} minuuttia", "{2} {0} timmar {1} minuter", "{2} {0} hours {1} minutes"],
        hourminutes: ["{1} 1 tunti {0} minuuttia", "{1} 1 timme {0} minuter", "{1} 1 hour {0} minutes"],
    },
    times: {
        aday: ["{0} kertaa päivässä", "{0} gånger om dagen", "{0} times a day"],
        adaytworoutes: ["{0} {1} kertaa päivässä, {2} lisäksi {3} kertaa päivässä", "{0} {1} gånger om dagen, {2} ytterligare {3} gånger om dagen", "{0} {1} times a day, plus {2} {3} times a day"],
        aweek: ["{0} kertaa viikossa", "{0} gånger i veckan", "{0} times a week"],
        onceaday: ["kerran päivässä", "en gång om dagen", "once a day"],
        twiceaweek: ["kahdesti viikossa", "två gånger i veckan", "twice a week"],
        anhour: ["{0} kertaa tunnissa", "{0} gånger i timmen", "{0} times an hour"],
        adayaweek: ["{0} kertaa päivässä, {1} {2} kertaa viikossa",
            "{0} gånger om dagen, {1} {2} gånger i veckan", "{0} times a day, {1} {2} times a week"],
        dayminutesnightondemand: ["päivällä aikataulun mukaan {0} minuutin välein, yöllä tarvittaessa",
            "dagtid enligt tidtabellen varje {0} minuter, nattetid vid behov",
            "every {0} minutes according to the daytime timetable, on demand at night"],
        dayminutesnightonorder: ["päivällä aikataulun mukaan {0} minuutin välein",
            "dagtid enligt tidtabellen varje {0} minuter",
            "every {0} minutes according to the daytime timetable"],
        ondemandwithpauses: ["Liikennöi tarvittaessa, tauot: {0} {1} {2} {3}", "Trafikerar vid behov, pauser: {0} {1} {2} {3}", "Operates on demand; breaks: {0} {1} {2} {3}"],
        ondemandcheckpauses: ["Liikennöi tarvittaessa, tarkista tauot aikataulusta", "Trafikerar vid behov, kontrollera pauserna i tidtabellen", "Operates on demand; check the timetable for breaks"],
    },
    booking: {
        cannot: ["ei voi varata", "kan inte bokas", "booking not possible"],
        required: ["kaikki matkat varattava etukäteen", "alla resor måste bokas i förväg", "all trips must be booked in advance"],
    },
    order: {
        pieronly: ["{0} vain tilauksesta", "{0} bara på beställning", "{0} only on request"],
        only: ["vain tilauksesta", "bara på beställning", "on request only"],
        partly: ["osa vuoroista vain tilauksesta", "några turer bara på beställning", "some departures are on request only"],
        nighttime: ["Yöllä vain tilauksesta", "Nattetid bara på beställning", "on request only at night"],
        extra: ["Lisävuoroja sopimuksen mukaan", "Extra turer enligt överenskommelse", "Additional departures by arrangement"],
    },
    cost: {
        applies: ["Maksullinen", "Avgiftsbelagd", "Fare applies"],
    },
    seasonal: {
        summers: ["Vain kesäisin", "Bara på sommaren", "Only in summer"],
        summerspier: ["{0} vain kesäisin", "{0} bara på sommaren", "{0} only in summer"]
    },
    limit: {
        mc_bikes_only: ["Vain moottoripyöriä ja polkupyöriä", "Bara motorcyklar och cyklar", "Only motorcycles and bicycles"],
    },
    infocontent: {
        contactinfo: ["Yhteystiedot", "Kontaktuppgifter", "Contact information"],
        timetables: ["Aikataulut", "Tidtabeller", "Schedules"],
    },
    unofficialcopy: ["Tämä on epävirallinen kopio. Tarkista muutokset, poikkeukset ja lisätiedot",
        "Detta är en inofficiell kopia. Kontrollera ändringar, undantag och ytterligare information",
        "This is an unofficial copy. Check for changes, exceptions, and additional information"],
    fromoriginal: ["alkuperäisestä aikataulusta", "från den ursprungliga tidtabellen", "in the original schedule"],
    openzoomable: ["Avaa zoomattava aikataulu uuteen ikkunaan klikkaamalla", "Klicka för att öppna tidtabellen i ett nytt fönster", "Click a timetable image to open it in a new window"],
    seealso: ['Katso myös <a href="{0}">{1}</a>', 'Se också <a href="{0}">{1}</a>', 'See also <a href="{0}">{1}</a>'],
    live: {
        loading: ['Ladataan...', 'Laddas...', 'Loading...'],
        notavailable: ['Livedata ei saatavilla', 'Liveuppgifter är inte tillgängliga', 'Live data not available'],
        notvisible: ['Ei aluksia kartan alueella', 'Inga fartyg på kartan', 'No vessels within the map bounds'],
        zoomin: ['Lähennä nähdäksesi alusten sijainnit', 'Zooma in för att se fartygens lägen', "Zoom in to see vessel positions"],
        delay1: ['Viive ~ {0} min', 'Försening ~ {0} min', "Delay ~ {0} min"],
        delay2: ['Viive {0} - {1} min', 'Försening {0} - {1} min', "Delay {0} - {1} min"],
        closing: ['Suljetaan live-näkymä', 'Live-vyn stängs', 'Closing live view']
    },
    application: {
        title: ["Saaristolautat.fi", "Saaristolautat.fi", "Saaristolautat.fi"]
    },
    loader: {
        main: ["Turun saariston ja Ahvenanmaan lauttareitit", "Skärgårdsfärjorna i Skärgårdshavet", "Ferry routes in the Finnish archipelago"],
        islands: ["40000 saarta<br/>50 lauttaa<br/>200 laituria", "40000 öar<br/>50 färjor<br/>200 bryggor", "40000 islands<br/>50 ferries<br/>200 ferry landings"],
        loading: ["Ladataan...", "Laddas...", "Loading..."]
    },
    banner: {
        clickRoute: ["Klikkaa reittiä kartalla nähdäksesi reitin tiedot", "Klicka på en rutt på kartan för information", "Click a route on the map to see its details"],
        routes: ["Reitit", "Rutter", "Routes"],
        timetables: ["Aikataulut", "Tidtabeller", "Schedules"],
        contactInfo: ["Yhteystiedot", "Kontaktuppgifter", "Contact information"],
        dontshowagain: ["Älä näytä uudestaan", "Visa inte igen", "Don't show again"],
        close: ["Sulje", "Stäng", "Close"]
    },
    topbar: {
        info: ["Info", "Info", "Info"],
        search: ["Haku", "Sök", "Search"],
        settings: ["Asetukset", "Inställningar", "Settings"],
    },
    settings: {
        backgroundmap: ["Taustakartta", "Bakgrundskarta", "Background map"],
        fullscreen: ["Koko ruutu", "Helskärm", "Full screen"]
    },
    menu: {
        gettingthere: ["Miten sinne pääsee", "Så tar du dig dit", "Getting there"],
        alandferriesinfo: ["Ahvenanmaan lautat", "Ålands färjor", "Ferries in Åland"],
        finlandferriesinfo: ["Manner-Suomen lautat", "Färjor i Fastlandsfinland", "Ferries in mainland Finland"],
        live: ["Live-näkymä", "Live-vy", "Live view"],
        linksinfo: ["Linkkejä", "Länkar", "Links"],
        appinfo: ["Tietoja sovelluksesta", "Om appen", "About the app"]
    },
    infopage: {
        ferries: ["Lautat", "Färjor", "Ferries"],
        touristinfo: ["Matkailutietoa", "Turistinformation", "Tourist information"],
        localinfo: ["Paikallista tietoa", "Lokal information", "Local information"],
        mapdata: ["Karttatiedot", "Kartdata", "Map data"],
        icons: ["Ikonit", "Ikoner av", "Icons by"],
        appicon: ["Sovellusikoni", "Appikon", "Application icon"],
        trafficinfo: ["Liikennetietojen lähde", "Trafikuppgifternas källa", "Source of traffic information"],
    },
    mapTypes: {
        openfreemap: ["OpenFreeMap", "OpenFreeMap", "OpenFreeMap"],
        OSM: ["OpenStreetMap", "OpenStreetMap", "OpenStreetMap"],
    },
    mapLayers: {
        title: ["Karttatasot", "Kartlager", "Map layers"],
        longdistanceferries: ["Suuret autolautat", "Stora bilfärjor", "Large car ferries"],
        roadferries: ["Maantielautat", "Landsvägsfärjor", "Road ferries"],
        conn4: ["Yhteysalukset", "Förbindelsefartyg", "Commuter ferries"],
        conn5: ["Risteilyreitit", "Kryssningsrutter", "Cruise routes"],
        ringroads: ["Rengastiet", "Ringvägar", "Ring roads"],
        distances: ["Välimatkat", "Avstånd", "Distances"],
        live: ["Live", "Live", "Live"],
    },
    search: {
        placeholder: ["Hae reittejä, laitureita ja aluksia", "Sök rutter, bryggor och fartyg", "Search routes, ferry landings and vessels"]
    }
};

function replaceArrayLeafs(node, replace) {
    if (typeof node !== "object") return; // this node is not an object
    for (let key in node) {
        if (Array.isArray(node[key])) {
            node[key] = replace(node[key]);
        } else if (typeof node[key] === 'object') {
            replaceArrayLeafs(node[key], replace);
        }
    }
}

function pickLocale(raw, index) {
    const msgsTemp = JSON.parse(JSON.stringify(raw));
    replaceArrayLeafs(msgsTemp, leafArray => leafArray[index]);
    return msgsTemp;
}

const locales = ["fi", "sv", "en"];
const messages = {};

function initMessages() {
    locales.forEach(locale => {
        let index = locales.indexOf(locale);
        messages[locale] = pickLocale(messagesRaw, index);
    });
}

initMessages();

export default messages;
