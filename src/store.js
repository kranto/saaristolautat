import { applyMiddleware, createStore } from "redux";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";

import reducer from "./reducers";

const middlewareList = [promise(), thunk];

if (import.meta.env.DEV) {
  middlewareList.push(createLogger());
}

const middleware = applyMiddleware(...middlewareList);

export default createStore(reducer, middleware);
