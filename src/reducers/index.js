import { combineReducers } from "redux";
import vessels from "./vesselReducer";
import settings from "./settingsReducer";

export default combineReducers({
	vessels,
	settings
})