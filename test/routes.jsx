import React from "react";
import { Route, IndexRoute, Redirect } from "react-router";

class Home extends React.Component {
  render () {
    return <div>Home</div>;
  }
}

class Page extends React.Component {
  render () {
    return <div>Page</div>;
  }
}

export {Home, Page};
