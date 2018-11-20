import store from '../store';

export function toggleMenu() {
  store.dispatch({type: "MENU_TOGGLED"});
}

export function toggleSettings() {
  store.dispatch({type: "SETTINGS_TOGGLED"});
}

export function hideMenuAndSettings() {
  const wasOpen = store.getState().uiState.menuOpen || store.getState().uiState.settingsOpen;
  if (wasOpen) store.dispatch({type: "MENU_AND_SETTINGS_HIDDEN"});
  return wasOpen;
}
