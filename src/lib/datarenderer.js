import { L, currentLang } from './localizer';

const locales = ["fi", "sv", "en"];

function sanitizePhone(num) {
    return num.replace(/\(.*\)/g, "").replace(/[-]/g, " ");
}

function phoneUri(num) {
    return "tel:" + num.replace(/\(.*\)/g, "").replace(/[ -]/g, "");
}

function getPhones(item) {
    return [item.phones || []].flat().map(phone => {
        let tel = phone.tel || phone;
        return {
            class: "phone",
            specifier: phone.name ? " - " + phone.name : "",
            text: sanitizePhone(tel),
            uri: phoneUri(tel)
        };
    });
}

function endsWithAnyLocale(key) {
    for (let locale of locales.concat("L")) {
        if (ew(key, "_" + locale)) return true;
    }
    return false;
}

function getI18dItem(item) {
    if (!(item instanceof Object)) return item;

    if (item instanceof Array) return item.map(getI18dItem);

    var result = {};
    var keys = Object.keys(item).filter(key => !endsWithAnyLocale(key));

    for (let key of keys) {
        if (item[key + "_L"]) {
            result[key + "_I"] = locales.reduce((acc, cur) => { return {
                ...acc,
                [cur]: L(cur, item[key + "_L"])};}, {});
        } else if (item[key] instanceof Object) {
            result[key] = getI18dItem(item[key]);
        } else {
            result[key + "_I"] = locales.reduce((acc, cur) => { return {
                ...acc,
                [cur]: item[key + "_" + cur] || item[key]
            }; }, {local: item[key]});
        }
    }
    return result;
}

function getLocalizedItem2(item, lang) {
    if (!(item instanceof Object)) return item;

    if (item instanceof Array) return item.map(i => getLocalizedItem2(i, lang));

    const result = {};
    const keys = Object.keys(item);
    for (let key of keys) {
        if (ew(key, "_I")) {
            const key1 = key.substring(0, key.length - 2);
            result[key1] = item[key][lang];
            result[key1 + "_local"] = item[key].local;
            result[key] = item[key];
        } else {
            result[key] = getLocalizedItem2(item[key], lang);
        }
    }
    return result;
}

function getLocalizedItem(item, lang) {
    if (!(item instanceof Object)) return item;

    if (item instanceof Array) return item.map(i => getLocalizedItem(i, lang));

    var result = {};
    var keys = Object.keys(item);
    var localizeToLang = (acc, lang1) => { return {...acc, [lang1]: L(lang1, item[key])};}
    var hasNoImplicitLocalization = l => !result[key + "_I"][l];
    var addDefaultLocalization = (l) => result[key + "_I"][l] = item[key];
    for (let index in keys) {
        var key = keys[index];
        if (ew(key, "_L")) {
            let key1 = key.substring(0, key.length - 2);
            result[key1 + "_I"] = locales.reduce(localizeToLang, {});
            result[key1] = result[key1 + "_I"][lang];
        } else if (RegExp('_..$').test(key)) {
            let key1 = key.substring(0, key.length - 3);
            const locale = key.substring(key.length - 2, key.length);
            result[key1 + "_I"] = result[key1 + "_I"] || {};
            result[key1 + "_I"][locale] = item[key];
            if (locale === lang) {
                if (result[key1]) result[key1 + "_local"] = result[key1];
                result[key1] = item[key];
            }
        } else if (item[key] instanceof Object) {
            result[key] = getLocalizedItem(item[key], lang);
        } else {
            result[key + "_I"] = result[key + "_I"] || {};
            locales.filter(hasNoImplicitLocalization).forEach(addDefaultLocalization);
            if (result[key]) {
                result[key + "_local"] = item[key];
            } else {
                result[key] = item[key];
            }
        }
    }
    return result;
}

function ew(target, needle) {
    if (target.endsWith) return target.endsWith(needle);
    return target.length >= needle.length && target.lastIndexOf(needle) === target.length - needle.length;
}

function getWww(item) {
    return item.www ? [{ class: "www", text: item.www.replace(/^http(s?):\/\//, "").replace(/\/$/, ""), specifier: "", uri: item.www, target: "info" }] : [];
}

function getEmail(item) {
    return item.email ? [{ class: "email", text: item.email, specifier: "", uri: "mailto:" + item.email }] : [];
}

function getFb(item) {
    const fb = item.fb;
    if (typeof fb === 'object') {
        return [{ class: "facebook", text: fb.name || item.name, specifier: "", uri: fb.uri, target: "facebook" }];
    } else if (fb) {
        return [{ class: "facebook", text: item.name, specifier: "", uri: item.fb, target: "facebook" }];
    } else {
        return [];
    }

}

function deepCopy(object) {
    return JSON.parse(JSON.stringify(object));
}

export function filterTimetables(tables) {
    if (!tables) return null;
    var today = new Date().toISOString().substring(0, 10);
    tables = tables.filter(table => !table.validTo || table.validTo >= today);
    return tables.length ? tables : null;
}

export function routeData(route, lang=currentLang) {
    return getLocalizedItem2(getI18dItem(deepCopy(route)), lang);
}

export function routeInfo(route, lang = currentLang) {
    route = getLocalizedItem(deepCopy(route), lang);
    var info = {};
    var contacts = [];
    info.id = route.id;
    info.name = route.name;
    info.specifier = route.specifier ? route.specifier : "";

    info.vessels = route.vessels;
    info.vessels.forEach(function (vessel) {
        if (vessel.contact && Object.keys(vessel.contact).length > 0) {
            vessel.contact.name = vessel.name;
            contacts.push(vessel.contact);
        }
        var features = [];
        if (vessel.capacity.bikes) features.push({ icon: "bicycle", value: vessel.capacity.bikes });
        if (vessel.capacity.cars) features.push({ icon: "car", value: vessel.capacity.cars });
        if (vessel.capacity.persons) features.push({ icon: "user", value: vessel.capacity.persons });
        if (vessel.features.cafe) features.push({ icon: "coffee" });
        if (vessel.features.access) features.push({ icon: "wheelchair" });
        vessel.features = features;
    });

    info.features =
        ["interval", "duration", "order", "booking", "cost", "seasonal", "limit", "seealso"]
            .filter(type => route.features[type])
            .map(type => { return { class: type, value: route.features[type] }; });

    var piers = route.piers;
    piers.forEach(pier => {
        pier.class = pier.type === "1" ? "mainpier" : "";
        pier.specifier = pier.type === "1" && pier.mun.name !== pier.name ? "(" + pier.mun.name + ")" : "";
        pier.nname = pier.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    });
    piers[piers.length - 1].last = true;
    info.piers = piers;

    info.notes = route.notes;

    contacts = contacts.concat(route.operator.map(op => { return { ...op.contact, name: op.name }; }));

    info.timetables = route.timetables.map(timetable => {
        return {
            ...timetable,
            buttonspecifier: route.timetables.length > 1 ? timetable.name ? timetable.name : timetable.specifier : "",
            exttimetables: filterTimetables(timetable.tables) ? false : "external"
        };
    });

    info.pricelists = route.pricelists;

    info.contacts = contacts.map(contact => {
        return {
            name: contact.name,
            items: [getPhones, getEmail, getWww, getFb].map(f => f(contact)).flat()
        };
    });

    return info;
}
