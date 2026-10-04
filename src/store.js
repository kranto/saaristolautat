import { applyMiddleware, createStore } from "redux";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";
import reducer from "./reducers";
import { setCurrentLang } from "./lib/localizer";

const middlewareList = [promise(), thunk];

if (import.meta.env.DEV) {
  middlewareList.push(createLogger());
}

const middleware = applyMiddleware(...middlewareList);

const store = createStore(reducer, middleware);
setCurrentLang(store.getState().settings.locale);
store.subscribe(() => setCurrentLang(store.getState().settings.locale));

export default store;
