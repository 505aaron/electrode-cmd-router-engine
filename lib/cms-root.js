"use strict";

const optionalRequire = require("optional-require")(require);
const createReactClass = optionalRequire("create-react-class");
const React = optionalRequire("react");

const CmsRoot = createReactClass({
  render: function () {
    return this.renderComponent(this.props.map, this.props.tree);
  },
  fetchComponent: function (componentMap, node) {
    let component;
    switch (node.type) {
    case "component":
      component = componentMap[node.name];
      break;
    case "html":
      component = node.name;
      break;
    }

    return component;
  },

  renderComponent: function (componentMap, node) {
    let childComponents = [];
    if (typeof node === "string") {
      return node;
    } else if (node.children instanceof Array) {
      childComponents = node.children.map((n) => this.renderComponent(componentMap, n));
    }

    const componentType = this.fetchComponent(componentMap, node);

    let result;
    if (childComponents.length > 0) {
      result = React.createElement(componentType, node.props, childComponents);
    } else {
      result = React.createElement(componentType, node.props);
    }

    return result;
  }
});

module.exports = CmsRoot;
