import { combineReducers } from "redux";
import settings from "./settingsReducer";
import live from "./liveReducer";
import selection from "./selectionReducer";

export default combineReducers({
	settings,
	live,
	selection
})