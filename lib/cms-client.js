"use strict";

const rp = require("request-promise");
const assert = require("assert");

class CmsClient {
  constructor(options) {
    assert(options.cmsHost, "Must provide a CMS host.");
    this.host = options.cmsHost;
  }

  // Checks for the existence of a route.
  // location: url_path
  //
  matchRoute(location) {
    return rp.get(`${this.host}/routes`, {
      qs: {
        location
      }
    });
  }
}
module.exports = CmsClient;
