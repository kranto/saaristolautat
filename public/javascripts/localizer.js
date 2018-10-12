
function initLocalizer(messages) {
  function deepGet (obj, properties) {
    if (obj === undefined || obj === null || properties.length === 0) {
      return obj;
    } else {
      return deepGet(obj[properties[0]], properties.slice(1));
    }
  }

  var localize_languages = ["fi", "sv", "en"];

  function localize(lang, args) {
    if (!(args instanceof Array)) args = [args];

    var message = deepGet(messages, args[0].split("."))[localize_languages.indexOf(lang)];
    for (var i = 0; i < 5; i++) {
      var arg = i < args.length - 1? args[i+1]: "";
      var str = "{" + i + "}";
      message = message.replace(str, arg);
    }
    return message;
  }

  return localize;
}
