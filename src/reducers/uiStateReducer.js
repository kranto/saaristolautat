export default function reducer(state = {
  menuOpen: false,
  settingsOpen: false,
  bannerOpen: false,
  bannerClosed: false
}, action) {
  switch (action.type) {
    case "MENU_TOGGLED":
      return { ...state, menuOpen: !state.menuOpen, settingsOpen: false };
    case "SETTINGS_TOGGLED":
      return { ...state, settingsOpen: !state.settingsOpen, menuOpen: false };
    case "MENU_AND_SETTINGS_HIDDEN":
      return { ...state, menuOpen: false, settingsOpen: false };
    case "BANNER_OPENED":
      return { ...state, bannerOpen: true };
      case "BANNER_CLOSED":
      return { ...state, bannerOpen: false, bannerClosed: true };
    default:
      return state;
  }
}