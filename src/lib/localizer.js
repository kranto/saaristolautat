import store from '../store';
import * as settings from '../actions/settingsActions';
import messages from '../data/messages';

export var currentLang;
export const L = (lang, args) => {
    if (args === "" || args === null) return "";
    if (!(args instanceof Array)) args = [args];

    var message = deepGet(messages[lang], args[0].split("."));
    for (var i = 0; i < 5; i++) {
        var arg = i < args.length - 1 ? args[i + 1] : "";
        var str = "{" + i + "}";
        message = message.replace(str, arg);
    }
    return message;
};

export const L2 = (msg) => L(currentLang, msg);

export function setLanguage(lang) {
    if (typeof Storage !== 'undefined') {
        localStorage.setItem('language', lang);
    }
    if (lang !== 'fi' && lang !== 'sv') lang = 'en';
    currentLang = lang;
    store.dispatch(settings.localeSet(currentLang));
}

function deepGet(obj, properties) {
    if (obj === undefined || obj === null || properties.length === 0) {
        return obj;
    } else {
        return deepGet(obj[properties[0]], properties.slice(1));
    }
}

function initLanguage() {
    var lang;
    if (typeof Storage !== 'undefined') {
        lang = localStorage.getItem('language');
    }
    lang = lang || window.navigator.language.split("-")[0] || "fi";
    setLanguage(lang);
}

initLanguage();
