import { combineReducers } from "redux";
import settings from "./settingsReducer";
import live from "./liveReducer";

export default combineReducers({
	settings,
	live
})