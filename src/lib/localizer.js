const localize_languages = ["fi", "sv", "en"];
let messages;

export var currentLang;
export const L = (lang, args) => {
  if (!(args instanceof Array)) args = [args];
  if (!messages) return args;

  var message = deepGet(messages, args[0].split("."))[localize_languages.indexOf(lang)];
  for (var i = 0; i < 5; i++) {
    var arg = i < args.length - 1? args[i+1]: "";
    var str = "{" + i + "}";
    message = message.replace(str, arg);
  }
  return message;
};

export const L2 = (msg) => L(currentLang, msg);

export function initLocalizer(msgs) {
  messages = msgs;
}

export function setLanguage(lang) {
  if (typeof Storage !== 'undefined') {
    localStorage.setItem('language', lang);
  }
  if (lang !== 'fi' && lang !== 'sv') lang = 'en';
  currentLang = lang;
  window.dispatchEvent(new Event('localeChanged'));
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
