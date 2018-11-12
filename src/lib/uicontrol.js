const $ = window.$;

var scrollLimit = 22;

export function toggleScrollIndicator() {
  var elem = $("#wrapper2");
  var isBottom = (elem[0].scrollHeight - elem.scrollTop() - scrollLimit <= elem.outerHeight());
  $('#scrollIndicator').toggleClass('can-scroll', !isBottom);
}

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

export function initInfoEvents() {
  $(".info").on("mouseleave", () => {
    $("#wrapper2").css({ pointerEvents: "none" });
    $(".mapoverlay").css({ pointerEvents: "none" });
  });

  $(".info").on("mouseenter mousedown touchstart", (e) => {
    $("#wrapper2").css({ pointerEvents: "auto" });
    $(".mapoverlay").css({ pointerEvents: "auto" });
    $("#wrapper2").trigger(e.type, e);
  });
}

export function initMapOverlayEvents() {
  function getAllEvents(element) {
    var result = [];
    for (var key in element) {
      if (key.indexOf('on') === 0) {
        result.push(key.slice(2));
      }
    }
    return result.join(' ');
  }

  var el = $(".mapoverlay");
  el.bind(getAllEvents(el[0]), e => {
    $("#wrapper2").css({ pointerEvents: "none" });
    $(".mapoverlay").css({ pointerEvents: "none" });
    $("#mapcontainer").trigger(e.type, e);
  });
}
