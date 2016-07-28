import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


export default class JsonToReact {
  /**
   * list of all components from the material-ui framework
   */
  static components = require('material-ui/')
  constructor(el) {
    this.container = el;
  }
  createElement(type, props, children) {
    return React.createElement(JsonToReact.components[type], props, children);
  }
  getData() {
    return this.data;
  }
  setData(json, cbk) {
    this.data = json;
    this.elements = [];
    var element = this.createElement(json.type, json.props, json.children ? json.children.map((child) => this.decorateChildren(child)) : null);
    ReactDOM.render(
      <MuiThemeProvider>
        {element}
      </MuiThemeProvider>,
      this.container, cbk);
  }
  decorateChildren(json) {
    if(json.type) {
      return this.createElement(
        json.type,
        json.props,
        json.children ? json.children.map((child) => this.decorateChildren(child)) : null
      );
    }
    else return json; // case of a string
  }
  cleanup() {
    ReactDOM.unmountComponentAtNode(this.container);
  }
}

window.JsonToReact = JsonToReact;
