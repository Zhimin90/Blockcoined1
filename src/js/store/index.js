// src/js/store/index.js
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers/index';
import { funcMiddleware } from '../middleware/middleware';

const middleware = applyMiddleware(
  createLogger({ collapsed: true }),
  funcMiddleware,
);
const store = createStore(rootReducer, middleware);
export default store;
