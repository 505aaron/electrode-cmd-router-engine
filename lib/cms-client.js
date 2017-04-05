"use strict";

const assert = require("assert");
const optionalRequire = require("optional-require")(require);
const fetch = optionalRequire("isomorphic-fetch");

class CmsClient {
  constructor(options) {
    assert(options.cmsHost, "Must provide a CMS host.");
    this.host = options.cmsHost;
  }

  // Checks for the existence of a route.
  // location: url_path
  //
  matchRoute(location) {
    return fetch(`${this.host}/routes?location=${encodeURI(location)}`);
  }
}
module.exports = CmsClient;
