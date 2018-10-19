import { currentLang } from './localizer';

export function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

export function shortName(props, lang=currentLang) {
    return props["sname_" + lang] || props.sname || props["name_" + lang] || props.name;
}

export function longName(props, lang=currentLang) {
    var localName = props.sname || props.name;
    var currLocaleName = props["sname_" + lang] || props["name_" + lang];
    var firstName = currLocaleName ? currLocaleName : localName;
    var otherNames = ["", "_fi", "_sv", "_en"].map(function (l) {
        return props["sname" + l] || props["name" + l];
    }).filter(function (name) { return typeof name !== 'undefined' && name !== firstName; }).filter(onlyUnique);
    return firstName + ((otherNames.length > 0) ? "/" + otherNames.join("/") : "");
}

export function description(props, lang=currentLang) {
    return props["description_" + lang] || props.description;
}
