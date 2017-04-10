"use strict";

const Promise = require("bluebird");

const CmsRouterEngine = require("../..").CmsRouterEngine;

const expect = require("chai").expect;
const sinon = require("sinon");

require("babel-register");

const Home = require("../routes.jsx").Home;
const RedirectError = require("../error-routes").RedirectError;
const Error = require("../error-routes").Error;
const ServerError = require("../error-routes").ServerError;


const createStore = require("redux").createStore;

const createReduxStore = () => Promise.resolve(createStore((state) => state, ["Use Redux"]));

describe("cms-router-engine", function () {
  let testReq;
  let cmsClient;
  let rootComponent;
  let engine;

  beforeEach(() => {
    cmsClient = {};

    testReq = {
      method: "get",
      log: () => {
      },
      app: {},
      url: {}
    };

    rootComponent = Home;
  });

  function stubCmsResponse(componentTree) {
    cmsClient.matchRoute = sinon.stub().returns(Promise.resolve({
      renderProps: {
        componentTree
      }
    }));
  }

  function stubCmsResponseAndEngine(componentTree, root) {
    stubCmsResponse(componentTree);

    engine = new CmsRouterEngine({cmsClient, createReduxStore, rootComponent: root || rootComponent});
    testReq.url.path = "/test";
  }

  describe("json rendering", () => {
    it("should resolve a react component", () => {
      stubCmsResponseAndEngine({
        name: "Home",
        type: "component",
        props: {
          "checked": false
        }
      });

      return engine.render(testReq).then((result) => {
        expect(result.status).to.equal(200);
        expect(result.html).to.contain("div");
        expect(result.html).to.contain("Home");
      });
    });

    it("should resolve html", () => {
      stubCmsResponseAndEngine({
        name: "div",
        type: "html",
        props: {
          "className": "foo"
        }
      });

      return engine.render(testReq).then((result) => {
        expect(result.status).to.equal(200);
        expect(result.html).to.contain("div");
      });
    });

    it("should render the root component", () => {
      stubCmsResponseAndEngine({});

      return engine.render(testReq).then((result) => {
        expect(result.status).to.equal(200);
        expect(result.html).to.equal(
          "<div><h1>Home</h1></div>");
      });
    });
  });

  it("should bootstrap a redux store if redux option is passed in", () => {
    stubCmsResponse({
      name: "div",
      type: "html",
      props: {
        "className": "foo",
        "data-test": "my-test"
      }
    });

    engine = new CmsRouterEngine({cmsClient, createReduxStore, rootComponent });
    testReq.url.path = "/test";

    return engine.render(testReq).then((result) => {
      expect(result.prefetch).to.contain(`window.__PRELOADED_STATE__ = ["Use Redux"];`);
    });
  });

  it("should redirect redirect route", () => {
    cmsClient.matchRoute = sinon.stub().returns(Promise.resolve({
      redirectLocation: {
        pathname: "/test/target",
        search: "?foobar=test"
      }
    }));

    engine = new CmsRouterEngine({cmsClient, createReduxStore, rootComponent });
    testReq.url.path = "/test";

    return engine.render(testReq).then((result) => {
      expect(result.status).to.equal(302);
      expect(result.path).to.equal("/test/target?foobar=test");
    });
  });

  it("should return 500 for invalid component", () => {
    cmsClient.matchRoute = sinon.stub().returns(Promise.reject({
      status: 500,
      message: "No route",
      path: "/test"
    }));

    engine = new CmsRouterEngine({cmsClient, createReduxStore, rootComponent});
    testReq.url.path = "/test";

    return engine.render(testReq).then((result) => {
      expect(result.status).to.equal(500);
      expect(result._err.message)
        .to.contain("No route");
    });
  });

  it("should return 404 if component throws 404", () => {
    stubCmsResponseAndEngine({
      name: "Home",
      type: "component"
    }, Error);

    return engine.render(testReq).then((result) => {
      expect(result.status).to.equal(404);
      expect(result._err).to.be.ok;
    });
  });

  it("should return 302 and redirect path if component throws related error", () => {
    stubCmsResponseAndEngine({}, RedirectError);

    return engine.render(testReq).then((result) => {
      expect(result.status).to.equal(302);
      expect(result.path).to.equal("/new/location");
      expect(result._err).to.be.ok;
    });
  });

  it("should populate react-id when requested", () => {
    stubCmsResponse({
      name: "div",
      type: "html"
    });

    engine = new CmsRouterEngine({cmsClient, rootComponent, createReduxStore, withIds: true});
    testReq.url.path = "/test";

    return engine.render(testReq).then((result) => {
      expect(result.html).to.contain("data-reactid");
    });
  });

  it("should not populate react-id by default", () => {
    stubCmsResponseAndEngine({
      name: "div",
      type: "html"
    });

    return engine.render(testReq).then((result) => {
      expect(result.html).to.not.contain("data-reactid");
    });
  });

  it("should use optional callbacks", () => {
    let error;
    stubCmsResponse({
      "name": "Home",
      "type": "component"
    });

    engine = new CmsRouterEngine({
      cmsClient,
      rootComponent,
      createReduxStore,
      stringifyPreloadedState: () => `window.__TEST_STATE__`,
      renderToString: () => "test"
    });
    testReq.url.path = "/test";

    return engine.render(testReq)
      .then((result) => {
        expect(result.prefetch).to.equal(`window.__TEST_STATE__`);
        expect(result.html).to.equal("test");

        const newClient = {
          matchRoute: sinon.stub().returns(Promise.resolve({
            renderProps: {
            }
          }))
        };

        return new CmsRouterEngine({
          cmsClient: newClient,
          rootComponent: ServerError,
          createReduxStore,
          logError: (req, err) => {
            error = err;
          }
        }).render(testReq);
      })
      .then((result) => {
        expect(result.status).to.equal(500);
        expect(error).to.not.equal(undefined);
      });
  });

  it("should override constructor prop with render prop", () => {
    stubCmsResponse({
      "type": "html",
      name: "div",
      props: {
        styleName: "foo-bar"
      }
    });

    engine = new CmsRouterEngine({cmsClient, rootComponent, createReduxStore, withIds: true});
    testReq.url.path = "/test";

    return engine.render(testReq, {withIds: false}).then((result) => {
      expect(result.html).to.not.contain("data-reactid");
    });
  });

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
