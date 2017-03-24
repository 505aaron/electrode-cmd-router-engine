"use strict";

const rp = require("request-promise");
const assert = require("assert");
const url = require("url");
const errors = require("request-promise/errors");

class CmsClient {
  constructor(options) {
    assert(options.cmsHost, "Must provide a CMS host.");
    this.host = options.cmsHost;
  }

  // Checks for the existence of a route.
  // location: url_path
  //
  routeExists(location) {
    const route = new url.URL(location, this.host);
    return rp.head(route.href).promise().then(() => {
      return {renderProps: {}};
    }).catch(errors.StatusCodeError, (reason) => {
/* eslint-disable no-magic-numbers */
      switch (reason.statusCode) {
      case 301:
      case 307:
      case 308:
        return {
          redirectLocation: reason.headers.location
        };
      default:
        throw reason;
      }
/* eslint-enable no-magic-numbers */
    });
  }

}
module.exports = CmsClient;
