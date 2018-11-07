import store from '../store';
import messages from '../data/messages';

export let currentLang;

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

function deepGet(obj, properties) {
  if (obj === undefined || obj === null || properties.length === 0) {
    return obj;
  } else {
    return deepGet(obj[properties[0]], properties.slice(1));
  }
}

let unsubscribe;
function onStateChange() {
  if (!unsubscribe) unsubscribe = store.subscribe(onStateChange);
  currentLang = store.getState().settings.locale;
}
onStateChange();
