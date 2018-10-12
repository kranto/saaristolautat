function sanitizePhone(num) {
    return num.replace(/\(.*\)/g, "").replace(/[-]/g, " ");
}

function phoneUri(num) {
    return "tel:" + num.replace(/\(.*\)/g, "").replace(/[ -]/g, "");
}

function getPhones(item) {
    if (item.phones) {
        var phones = Array.isArray(item.phones)? item.phones: [item.phones];
        return phones.map(function(phone) {
            if (typeof phone === 'object') {
                return { class: "phone", specifier: " - " + phone.name, text: sanitizePhone(phone.tel), uri: phoneUri(phone.tel) };
            } else {
                return { class: "phone", specifier: "", text: sanitizePhone(phone), uri: phoneUri(phone) };
            }
        });
    } else {
        return [];
    }
}

function getLocalizedItem(item, lang) {
    
    if (!(item instanceof Object)) {
        if (typeof item === 'string' && item.indexOf("ref_") == 0) {
            var parts = item.split("_");
            var sub = ferrydata[parts[1]][parts[2]];
            sub.id = parts[2];
            return getLocalizedItem(deepCopy(sub), lang);
        } else {
            return item;
        }
    }

    if (item instanceof Array) {
        return item.map(function(i) { return getLocalizedItem(i, lang); });
    }

    var result = {};
    var keys = Object.keys(item);
    for (let index in keys) {
        var key = keys[index];
        if (ew(key, "_L")) {
            var key1 = key.substring(0, key.length - 2);
            result[key1] = L(lang, item[key]);
        } else if (ew(key, "_" + lang)) {
            var key1 = key.substring(0, key.length - 3);
            if (result[key1]) result[key1 + "_local"] = result[key1];
            result[key1] = item[key];
        } else if (!RegExp('_..$').test(key)) {
            if (result[key]) {
                result[key + "_local"] = item[key];
            } else {
                result[key] = getLocalizedItem(item[key], lang);
            }
        }
    }
    return result;
}

function ew(target, needle) {
    if (target.endsWith) return target.endsWith(needle);
    return target.length >= needle.length && target.lastIndexOf(needle) == target.length - needle.length;
}

function getWww(item) {
    return item.www? [{ class: "www", text: item.www.replace(/^http(s?):\/\//,"").replace(/\/$/, ""), specifier: "", uri: item.www, target: "info"}]: [];
}

function getEmail(item) {
    return item.email? [{ class: "email", text: item.email, specifier: "", uri: "mailto:" + item.email}]: [];
}

function getFb(item) {
    fb = item.fb;
    if (typeof fb === 'object') {
        return [{ class: "facebook", text: fb.name || item.name, specifier: "", uri: fb.uri, target: "facebook"}];
    } else if (fb) {
        return [{ class: "facebook", text: item.name,  specifier: "", uri: item.fb, target:"facebook" }];
    } else {
        return [];
    }

}

function deepCopy(object) {
    return JSON.parse(JSON.stringify(object));
}

function renderDate(date, lang) {
    if (!date) return "";
    var parts = date.split("-");
    // var currentYear = new Date().getFullYear();
    return parts[2]+"."+parts[1]+"."; //+(parts[0] != currentYear? parts[0]: "");
}

function renderDates(fromD, toD, lang) {
    return renderDate(fromD, lang) + " - " + renderDate(toD, lang);
}

function flatten(array) {
    return array.reduce(function(a, b) { return a.concat(b); }, []);
}

function filterTimetables(tables) {
    if (!tables) return null;
    var today = new Date().toISOString().substring(0,10);
    tables = tables.filter(function(table) { return !table.validTo || table.validTo >= today; });
    return tables.length? tables: null;
}

routeInfo = function(route, lang) {
    route = getLocalizedItem(deepCopy(route), lang);
    var info = {};
    var contacts = [];
    info.id = route.id;
    info.name = route.name;
    info.specifier = route.specifier? route.specifier: "";
    
    info.vessels = route.vessels;
    info.vessels.forEach(function(vessel) {
        if (vessel.contact && Object.keys(vessel.contact).length > 0) {
            vessel.contact.name = vessel.name;
            contacts.push(vessel.contact);
        }
        var features = [];
        if (vessel.capacity.bikes) features.push({icon: "bicycle", value: vessel.capacity.bikes});
        if (vessel.capacity.cars) features.push({icon: "car", value: vessel.capacity.cars});
        if (vessel.capacity.persons) features.push({icon: "user", value: vessel.capacity.persons});
        if (vessel.features.cafe) features.push({icon: "coffee"});
        if (vessel.features.access) features.push({icon: "wheelchair"});
        vessel.features = features;
    });

    info.features =
    ["interval", "duration", "order", "booking", "cost", "seasonal", "limit", "seealso"]
        .filter(function(type) { return route.features[type]; })
        .map(function(type) { return { class: type, value: route.features[type]}; });

    var piers = route.piers;
    piers.forEach(function(pier) {
        pier.class = pier.type == 1? "mainpier": "";
        pier.specifier = pier.type == 1 && pier.mun.name != pier.name ? "(" + pier.mun.name  + ")": "";
    });
    piers[piers.length - 1].last = true;
    info.piers = piers;

    info.notes = route.notes;

    route.operator.forEach(function(op) {
        op.contact.name = op.name;
        contacts.push(op.contact);
    });

    var timetables = route.timetables;

    var index = 0;
    timetables.forEach(function(timetable) {
        timetable.buttonspecifier = timetables.length > 1? timetable.name? timetable.name: timetable.specifier: "";
        timetable.name = timetable.name? timetable.name: route.name;
        timetable.specifier= timetable.specifier? timetable.specifier: route.specifier;
        timetable.tables = filterTimetables(timetable.tables);
        timetable.exttimetables = timetable.tables? false: "external";
        var first = true;
        var id = 1;
        if (timetable.tables) timetable.tables.forEach(function(table) {
            table.dates = renderDates(table.validFrom, table.validTo, lang);
            table.active = first? "active": "";
            table.show = first? "show": "";
            table.tabid = "tab" + id++;
            first = false;
        });
    });

    info.timetables = timetables;
    
    info.pricelists = route.pricelists;

    contacts = contacts.map(function(contact) {

        var contactItems = flatten([getPhones, getEmail, getWww, getFb].map(function(f) { return f(contact); }));

        return {
            name: contact.name,
            items: contactItems
        };
    });

    info.contacts = contacts;

    info.L = function () {
        return function(val, render) {
            return L(lang, render(val));
        };
    }

    return info;
}
