import { phases } from '../lib/constants';

export default function reducer(state = {
  menuOpen: false,
  settingsOpen: false,
  searchOpen: false,
  mapOffline: false,
  mapFallbackAvailable: false,
  mapFallbackDismissed: false,
  phase: phases.LOADER_OPEN
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
    case "MAP_OFFLINE_CHANGED":
      return state.mapOffline === action.payload && !state.mapFallbackAvailable
        ? state : { ...state, mapOffline: action.payload, mapFallbackAvailable: false };
    case "MAP_BASE_LOAD_FAILED":
      return state.mapFallbackAvailable || state.mapFallbackDismissed
        ? state : { ...state, mapFallbackAvailable: true };
    case "MAP_FALLBACK_DISMISSED":
      return { ...state, mapFallbackAvailable: false, mapFallbackDismissed: true };
    case "MAP_FALLBACK_REARM":
      return state.mapFallbackDismissed ? { ...state, mapFallbackDismissed: false } : state;
    case "MAP_FALLBACK_RESET":
      return state.mapFallbackAvailable || state.mapFallbackDismissed
        ? { ...state, mapFallbackAvailable: false, mapFallbackDismissed: false } : state;
    default:
      return state;
  }
}
