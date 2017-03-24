"use strict";

const Promise = require("bluebird");

const CmsRouterEngine = require("../..").CmsRouterEngine;

const expect = require("chai").expect;
const sinon = require("sinon");

require("babel-register");

const Home = require("../routes.jsx").Home;
const createStore = require("redux").createStore;

const createReduxStore = () => Promise.resolve(createStore((state) => state, ["Use Redux"]));

describe("redux-router-engine", function () {
  let testReq;
  let cmsClient;

  beforeEach(() => {
    cmsClient = {};
    testReq = {
      method: "get",
      log: () => {
      },
      app: {},
      url: {}
    };
  });

  // it("should return 404 for unknown index route", () => {
  //   cmsClient.
  //   const engine = new CmsRouterEngine({cmsClient, createReduxStore});
  //   testReq.url.path = "/test/blah";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.status).to.equal(404);
  //   });
  // });

  // it("should return string error", () => {
  //   const engine = new CmsRouterEngine({routes: getIndexRoutes, createReduxStore});
  //   testReq.url.path = "/test";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.status).to.equal(500);
  //     expect(result._err).to.equal("failed");
  //   });
  // });


  // it("should return Error error", () => {
  //   const engine = new CmsRouterEngine({routes: ErrorRoute, createReduxStore});
  //   testReq.url.path = "/test";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.status).to.equal(500);
  //     expect(result._err.message).to.equal("failed error");
  //   });
  // });

  it("should resolve index route", () => {
    cmsClient.matchRoute = sinon.stub().returns(Promise.resolve({
      renderProps: {
        componentTree: {
          key: "Home",
          props: {
            "checked": false
          }
        }
      }
    }));

    const engine = new CmsRouterEngine({cmsClient, createReduxStore, componentMap: {
      "Home": Home
    }});
    testReq.url.path = "/test";

    return engine.render(testReq).then((result) => {
      expect(result.status).to.equal(200);
      expect(result.html).to.contain("div");
      expect(result.html).to.contain("Home");
    });
  });

  // it("should bootstrap a redux store if redux option is passed in", () => {
  //   const engine = new CmsRouterEngine({routes, createReduxStore});
  //   testReq.url.path = "/test";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.prefetch).to.contain(`window.__PRELOADED_STATE__ = ["Use Redux"];`);
  //   });
  // });

  // it("should redirect redirect route", () => {
  //   const engine = new CmsRouterEngine({routes, createReduxStore});
  //   testReq.url.path = "/test/source";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.status).to.equal(302);
  //     expect(result.path).to.equal("/test/target");
  //   });
  // });

  // it("should return 500 for invalid component", () => {
  //   const engine = new CmsRouterEngine({routes: badRoutes, createReduxStore});
  //   testReq.url.path = "/test";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.status).to.equal(500);
  //     expect(result._err.message)
  //       .to.contain("Page.render(): A valid React element (or null) must be returned");
  //   });
  // });

  // it("should return 404 if component throws 404", () => {
  //   const engine = new CmsRouterEngine({routes: errorRoutes, createReduxStore});
  //   testReq.url.path = "/";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.status).to.equal(404);
  //     expect(result._err).to.be.ok;
  //   });
  // });

  // it("should return 302 and redirect path if component throws related error", () => {
  //   const engine = new CmsRouterEngine({routes: RedirectRoute, createReduxStore});
  //   testReq.url.path = "/redirect";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.status).to.equal(302);
  //     expect(result.path).to.equal("/new/location");
  //     expect(result._err).to.be.ok;
  //   });
  // });

  // it("should populate react-id when requested", () => {
  //   const engine = new CmsRouterEngine({routes, createReduxStore, withIds: true});
  //   testReq.url.path = "/test";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.html).to.contain("data-reactid");
  //   });
  // });

  // it("should not populate react-id by default", () => {
  //   const engine = new CmsRouterEngine({routes, createReduxStore});
  //   testReq.url.path = "/test";

  //   return engine.render(testReq).then((result) => {
  //     expect(result.html).to.not.contain("data-reactid");
  //   });
  // });

  // it("should use optional callbacks", () => {
  //   let error;
  //   const engine = new CmsRouterEngine({
  //     routes,
  //     createReduxStore,
  //     stringifyPreloadedState: () => `window.__TEST_STATE__`,
  //     renderToString: () => "test"
  //   });
  //   testReq.url.path = "/test";

  //   return engine.render(testReq)
  //     .then((result) => {
  //       expect(result.prefetch).to.equal(`window.__TEST_STATE__`);
  //       expect(result.html).to.equal("test");
  //       return new CmsRouterEngine({
  //         routes: badRoutes,
  //         createReduxStore,
  //         logError: (req, err) => {
  //           error = err;
  //         }
  //       }).render(testReq);
  //     })
  //     .then((result) => {
  //       expect(result.status).to.equal(500);
  //       expect(error).to.not.equal(undefined);
  //     });
  // });

  // it("should override constructor prop with render prop", () => {
  //   const engine = new CmsRouterEngine({routes, createReduxStore, withIds: true});
  //   testReq.url.path = "/test";

  //   return engine.render(testReq, {withIds: false}).then((result) => {
  //     expect(result.html).to.not.contain("data-reactid");
  //   });
  // });

  // it("should return 500 for method not allowed", () => {
  //   const req = {
  //     path: "/test",
  //     method: "post",
  //     log: () => {
  //     },
  //     app: {},
  //     url: {}
  //   };

  //   const engine = new CmsRouterEngine({routes, createReduxStore});

  //   return engine.render(req).then((result) => {
  //     expect(result.status).to.equal(500);
  //     expect(result.message).to.include(`doesn't allow request method post`);
  //   });
  // });
});
