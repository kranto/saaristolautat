
const $ = window.$;

var scrollLimit = 22;

$(document).ready(function(){
    $('#wrapper2').bind('scroll',toggleScrollIndicator);
    $("#timetables").click(function(event) { if (event.target === this) {window.history.back(); }});
});

function toggleScrollIndicator() {
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

function hideMenuAndSettings() {
    hideMenu();
    hideSettings();
    return $("#menu").is(":visible") || $("#settings").is(":visible");
}

function toggleMenu() {
    if ($("#menu").is(":hidden")) {
        showMenu();
    } else {
        hideMenu();
    }
}

function toggleSettings() {
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
function toggleHeaderbar(callback) {
    headerBarTimeout = setTimeout(function() { doToggleHeaderbar(callback); }, 200);
}

function cancelHeaderBarToggle() {
    if (headerBarTimeout) clearTimeout(headerBarTimeout);
    headerBarTimeout = null;
}

function closeInfoPage() {
    $('#infopage').fadeOut();
}

window.toggleScrollIndicator = toggleScrollIndicator;
window.showMenu = showMenu;
window.hideMenu = hideMenu;
window.showSettings = showSettings;
window.hideSettings = hideSettings;
window.hideMenuAndSettings = hideMenuAndSettings;
window.toggleMenu = toggleMenu;
window.toggleSettings = toggleSettings;
window.toggleHeaderbar = toggleHeaderbar;
window.cancelHeaderBarToggle = cancelHeaderBarToggle;
window.closeInfoPage = closeInfoPage;