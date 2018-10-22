
export function localeSet(locale) {
  console.log('locale set', locale)
  return {type: "LOCALE_SET", payload: locale};
}
