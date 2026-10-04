import { applyMiddleware, createStore } from "redux";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";
import dataReducer from "./reducers/dataReducer";

const middlewareList = [promise(), thunk];

if (import.meta.env.DEV) {
  middlewareList.push(createLogger());
}

const middleware = applyMiddleware(...middlewareList);

const reducer = (state = {}, action) => ({ data: dataReducer(state.data, action) });

export default createStore(reducer, middleware);
