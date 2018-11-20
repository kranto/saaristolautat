
const $ = window.$;

export function toggleMenu() {
  $("#menu").toggleClass("open");
  $("#settings").toggleClass("open", false);
}

export function toggleSettings() {
  $("#settings").toggleClass("open");
  $("#menu").toggleClass("open", false);
}

export function hideMenuAndSettings() {
  const wasOpen = $("#menu").hasClass("open") || $("#settings").hasClass("open");
  $("#menu").toggleClass("open", false);
  $("#settings").toggleClass("open", false);
  return wasOpen;
}
