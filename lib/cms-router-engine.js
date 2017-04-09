"use strict";

const assert = require("assert");
const optionalRequire = require("optional-require")(require);
const React = optionalRequire("react");
const ReactDomServer = optionalRequire("react-dom/server");
const Provider = require("react-redux").Provider;
const CmsRoot = require("./cms-root");

class CmsRouterEngine {
  constructor(options) {
    assert(options.cmsClient, "Must provide a CMS client for cms-router-engine");
    assert(options.componentMap, "Must provide a component mapping");
    assert(options.createReduxStore, "Must provide createReduxStore for redux-router-engine");

    this.options = options;

    this.options.withIds = !!options.withIds;

    if (!options.stringifyPreloadedState) {
      this.options.stringifyPreloadedState =
        (state) => `window.__PRELOADED_STATE__ = ${JSON.stringify(state)};`;
    }

    if (!this.options.logError) {
      this.options.logError = (req, err) =>
        console.log("Electrode CmsRouterEngine Error:", err); //eslint-disable-line
    }

    if (this.options.renderToString) {
      this._renderToString = this.options.renderToString;
    }
  }

  render(req, options) {
    const location = req.path || (req.url && req.url.path);

    return this._matchRoute({ cmsClient: this.options.cmsClient, location })
      .then((match) => {
        if (match.redirectLocation) {
          return {
            status: 302,
            path: `${match.redirectLocation.pathname}${match.redirectLocation.search}`
          };
        }

        if (!match.renderProps) {
          return {
            status: 404,
            message: `redux-router-engine: Path ${location} not found`
          };
        }

        return this._handleRender(req, match, options || {});
      })
      .catch((err) => {
        this.options.logError.call(this, req, err);
        return {
          status: err.status || 500, // eslint-disable-line
          message: err.message,
          path: err.path,
          _err: err
        };
      });
  }

  //
  // options: { routes, location: url_path }
  //
  _matchRoute(options) {
    return options.cmsClient.matchRoute(options.location);
  }

  _handleRender(req, match, options) {
    const withIds = options.withIds !== undefined ? options.withIds : this.options.withIds;
    const stringifyPreloadedState =
      options.stringifyPreloadedState || this.options.stringifyPreloadedState;

    return (options.createReduxStore || this.options.createReduxStore).call(this, req, match)
      .then((store) => {
        return {
          status: 200,
          html: this._renderToString(req, store, match, withIds),
          prefetch: stringifyPreloadedState(store.getState())
        };
      });

  }

  _renderToString(req, store, match, withIds) { // eslint-disable-line
    if (req.app && req.app.disableSSR) {
      return "";
    } else {
      assert(React, "Can't do SSR because React module is not available");
      assert(ReactDomServer, "Can't do SSR because ReactDomServer module is not available");

      return (withIds ? ReactDomServer.renderToString : ReactDomServer.renderToStaticMarkup)(
        React.createElement(
          Provider, { store },
          React.createElement(CmsRoot,
          { map: this.options.componentMap, tree: match.renderProps.componentTree })
        )
      );
    }
  }
}

module.exports = CmsRouterEngine;
