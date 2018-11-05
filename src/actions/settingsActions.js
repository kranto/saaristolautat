
export function localeSet(locale) {
  return {type: "LOCALE_SET", payload: locale};
}

export function setLayer(layer, isActive) {
  const change = {};
  change[layer] = isActive;
  return {type: "LAYER_SET", payload: change};
}
