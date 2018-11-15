const $ = window.$;

var scrollLimit = 22;

function showMenu() {
  hideSettings(function () {
    $("#menu").slideDown("fast");
    $("#menu").scrollTop(0);
  });
}

function hideMenu(cb) {
  $("#menu").slideUp("fast", cb);
}

function showSettings() {
  hideMenu(function () {
    $("#settings").slideDown("fast");
    $("#settings").scrollTop(0);
  });
}

function hideSettings(cb) {
  $("#settings").slideUp("fast", cb);
}

export function hideMenuAndSettings() {
  hideMenu();
  hideSettings();
  return $("#menu").is(":visible") || $("#settings").is(":visible");
}

export function toggleMenu() {
  if ($("#menu").is(":hidden")) {
    showMenu();
  } else {
    hideMenu();
  }
}

export function toggleSettings() {
  if ($("#settings").is(":hidden")) {
    showSettings();
  } else {
    hideSettings();
  }
}

export function toggleHeaderbar(callback) {
  if (!$("#menu").is(":hidden") || !$("#settings").is(":hidden")) {
    hideMenu();
    hideSettings();
  } else if (callback) {
    callback();
  }
}
