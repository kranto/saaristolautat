const $ = window.$;

var scrollLimit = 22;

export function toggleScrollIndicator() {
  var elem = $("#wrapper2");
  var isBottom = (elem[0].scrollHeight - elem.scrollTop() - scrollLimit <= elem.outerHeight());
  $('#scrollIndicator').toggleClass('can-scroll', !isBottom);
}

export function showMenu() {
  hideSettings(function () {
    $("#menu").slideDown("fast");
    $("#menu").scrollTop(0);
  });
}

export function hideMenu(cb) {
  $("#menu").slideUp("fast", cb);
}

export function showSettings() {
  hideMenu(function () {
    $("#settings").slideDown("fast");
    $("#settings").scrollTop(0);
  });
}

export function hideSettings(cb) {
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

function doToggleHeaderbar(callback) {
  if (!$("#menu").is(":hidden") || !$("#settings").is(":hidden")) {
    hideMenu();
    hideSettings();
  } else if (callback) {
    callback();
  }
}

var headerBarTimeout = null;
export function toggleHeaderbar(callback) {
  headerBarTimeout = setTimeout(function () { doToggleHeaderbar(callback); }, 200);
}

export function cancelHeaderBarToggle() {
  if (headerBarTimeout) clearTimeout(headerBarTimeout);
  headerBarTimeout = null;
}

export function hideInfoPage() {
  $('#infopage').fadeOut();
}

export function openInfoPanel() {
  $(function () {
    $("#wrapper2").toggleClass("info-open", true);
    if ($("body").outerWidth() >= 768) {
    //   $(".info").css({ left: -400 });
    //   $(".info").animate({ left: 0 }, 'fast', () => $(".info").css({ left: "" }));
    } else {
      $(".info").css({ top: '100%' });
      $(".info").animate({ top: '80%' }, 'fast', () => { $(".info").css({ top: "" }); toggleScrollIndicator() });
    }
  });
}

export function closeInfoPanel(callback) {
  $(function () {
    if ($("body").outerWidth() >= 768) {
      // $(".info").animate({ left: -400 }, 'fast', () => {
      //   $(".info").css({ left: "" });
        $("#wrapper2").toggleClass("info-open", false);
        if (callback) callback();
      // });
    } else {
      $("#wrapper2").animate({ scrollTop: 0 }, 'fast', () => {
        $(".info").animate({ top: '100%' }, 200, () => $(".info").css({ top: "" }));
        $("#wrapper2").toggleClass("info-open", false);
        if (callback) callback();
      });
    }
  });
}

export function initMapOverlayEvents() { 
  $(".info").on("mouseleave", () => {
    $("#wrapper2").css({ pointerEvents: "none" });
    $(".mapoverlay").css({ pointerEvents: "none" });
  });

  $(".info").on("mouseenter mousedown touchstart", (e) => {
    $("#wrapper2").css({ pointerEvents: "auto" });
    $(".mapoverlay").css({ pointerEvents: "auto" });
    $("#wrapper2").trigger(e.type, e);
  });

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
