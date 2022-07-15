import { phases } from '../lib/constants';

export default function reducer(state = {
  menuOpen: false,
  settingsOpen: false,
  searchOpen: false,
  phase: phases.INIT
}, action) {
  switch (action.type) {
    case "MENU_TOGGLED":
      return { ...state, menuOpen: !state.menuOpen, settingsOpen: false, searchOpen: false };
    case "SETTINGS_TOGGLED":
      return { ...state, settingsOpen: !state.settingsOpen, menuOpen: false, searchOpen: false };
    case "SEARCH_TOGGLED":
        return { ...state, searchOpen: !state.searchOpen, menuOpen: false, settingsOpen: false };
     case "MENU_AND_SETTINGS_HIDDEN":
      return { ...state, menuOpen: false, settingsOpen: false, searchOpen: false };
    case "PHASE_CHANGED":
      return { ...state, phase: Math.max(state.phase, action.payload)}; 
    default:
      return state;
  }
}