import {currentLang} from './localizer';

const $ = window.$;

var scrollLimit = 22;

$(document).ready(function () {
    $('#wrapper2').bind('scroll', toggleScrollIndicator);
    $("#timetables").click(function (event) { if (event.target === this) { window.history.back(); } });
});

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

export function closeInfoPage() {
    $('#infopage').fadeOut();
}
