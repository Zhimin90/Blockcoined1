import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./js/store/index";
import ReduxApp from "./Stats";
import "semantic-ui-css/semantic.min.css";
import "./index.css";

const AppWrap = () => {
  return (
    <Provider store={store}>
      <ReduxApp />
    </Provider>
  );
};

ReactDOM.render(
  <AppWrap width="5" height="5" />,
  document.getElementById("root")
);
