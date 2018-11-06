import { combineReducers } from "redux";
import settings from "./settingsReducer";
import live from "./liveReducer";
import selection from "./selectionReducer";
import data from "./dataReducer";

export default combineReducers({
	settings,
	live,
	selection,
	data
})