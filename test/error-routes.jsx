import React from "react";
import { Route } from "react-router";

class Error extends React.Component {
  render () {
    throw {
      status: 404
    };
  }
}

class RedirectError extends React.Component {
  render () {
    const error = new Error();
    error.status = 302;
    error.path = "/new/location";
    throw error;
  }
}

class ServerError extends React.Component {
  render () {
    throw {
      status: 500
    };
  }
}


export {RedirectError, Error, ServerError};
