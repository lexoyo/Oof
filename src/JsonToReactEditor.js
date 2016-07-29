import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as MaterialUi from 'material-ui/';


export default class Editor extends React.Component {
  state = {
    data: {},
    path: [],
    currentData: {},
  }
  setData(data) {
    this.setState({
      data: data,
      currentData: Editor.getDataFromPath(this.state.path, data),
    });
  }
  setPropAt(name, value) {
    Editor.getDataFromPath(this.state.path, this.state.data).props[name] = value;
    if(this.onChange) this.onChange();
    this.forceUpdate();
  }
  // idx here is index in this.state.path
  editChildAt(idx) {
    let newPath = this.state.path.slice(0, idx);
    this.setState({
      path: newPath,
      currentData: Editor.getDataFromPath(newPath, this.state.data),
    });
  }
  // idx here is index in this.state.currentData.children
  editChild(idx) {
    let newPath = this.state.path.concat([idx]);
    this.setState({
      path: newPath,
      currentData: Editor.getDataFromPath(newPath, this.state.data),
    });
  }
  static getDataFromPath(path, data) {
    let tmpData = data;
    return path.reduce((prev, cur) => tmpData = tmpData.children[cur], data);
  }
  getData() {
    return this.state.data;
  }
  getEditorRow(data) {
    if(data.type) {
      var props = this.getPropsForComponent(data.type, data.props);
      var current = props.map((prop) => {
        return <li
          key={prop.name}><PropertyEditor
          data={prop}
          onChange={value => this.setPropAt(prop.name, value)}
          /></li>;
        //"{prop.name}" is set to "{prop.value}" defaults to "{prop.defaultValue}" and is a "{prop.type}" (required: {prop.isRequired ? 'true' : 'false'})
      });
      var childs = [];
      if(data.children) {
        childs = data.children.map((child, idx) => {
          if(child.type) {
            return <li key={idx} onClick={() => this.editChild(idx)}>{child.type} ({child.children ? child.children.length : 0})</li>;
          }
          console.error('this child is a value', child, data);
          return <p key={idx}>This child is a value</p>;
        });
      }
      return <section>
          <h3>Component {data.type}</h3>
          <ul>{current}</ul>
          <h3>Children</h3>
          <ul>{childs}</ul>
        </section>;
    }
    console.error('how can we end up here?', data);
    return null;
  }
  getEditor(data) {
    if(data.type) {
      var editor = this.getEditorRow(data);
      return <MuiThemeProvider>
          <section>{editor}</section>
        </MuiThemeProvider>;
    }
    return <p>nothing selected</p>;
  }
  getPropsForComponent(type, props) {
    let res = [];
    for(let prop in MaterialUi[type].propTypes) {
      try {
        let propType = this.getPropType(MaterialUi[type].propTypes[prop]);
        let defaultValue = MaterialUi[type].defaultProps ? MaterialUi[type].defaultProps[prop] : null;
        let value = props[prop] || defaultValue;
        res.push({
          'name': prop,
          'isRequired': propType.isRequired,
          'type': propType.type,
          'defaultValue': defaultValue,
          'value': value,
        });
      }
      catch(e) {
        console.error('error in getPropsForComponent:', e, prop, props, type);
      }
    }
    return res;
  }
  /**
   * @return {{isRequired, type}}
   */
  getPropType(prop) {
    for (var type in React.PropTypes) {
      if(prop == React.PropTypes[type]) return {isRequired: false, type: type};
      if(prop == React.PropTypes[type].isRequired) return {isRequired: true, type: type};
    }
    throw 'unknown type';
  }
  render() {
    return <div>
      <BreadCrumbs data={this.state.data} path={this.state.path} onChange={(idx) => this.editChildAt(idx)} />
      <section>{this.getEditor(this.state.currentData)}</section>
      </div>;
  }
}

const BreadCrumbs = (props) => {
  let first = <li key={'___'}><BreadCrumbsItem key={first} data={props.data} onClick={() => props.onChange(0)} /></li>
  let other = props.path.map((value, idx) => <li key={idx}>
      <BreadCrumbsItem data={Editor.getDataFromPath(props.path.slice(0, idx + 1), props.data)} onClick={() => props.onChange(idx - 1)} />
    </li>);
  return <ul>
    {first}
    {other}
  </ul>
};

const BreadCrumbsItem = (props) => (<li onClick={props.onClick}>
    {props.data.type} ({props.data.children ? props.data.children.length : 0})
  </li>)

const PropertyEditor = (props) => {
  if(props.data.name === 'children') {
    if(typeof(props.data.value) === 'string') {
      console.info('this child is a value', props.data, props.data);
      return <section><p>child is value:</p><MaterialUi.TextField
        floatingLabelText={props.data.name + '(' + props.data.type + ')'}
        value={props.data}
        onChange={(e) => props.onChange(e.target.value)}
        /></section>;
    }
    return <p>See children bellow</p>;
  }
  else switch(props.data.type) {
    case 'bool':
      return <MaterialUi.Checkbox
        label={props.data.name}
        checked={props.data.value || props.data.defaultValue || false}
        onCheck={(e) => props.onChange(e.target.checked)} />;
    break;
    case 'string':
      return <MaterialUi.TextField
        floatingLabelText={props.data.name + '(' + props.data.type + ')'}
        value={props.data.value || props.data.defaultValue || ''}
        onChange={(e) => props.onChange(e.target.value)} />;
    break;
    case 'object':
      return <MaterialUi.TextField
        multiLine={true}
        floatingLabelText={props.data.name + '(' + props.data.type + ')'}
        value={ JSON.stringify(props.data.value || JSON.stringify(props.data.defaultValue) || {})}
        onChange={(e) => props.onChange(JSON.parse(e.target.value))} />;
    break;
    default:
      return <p>{props.data.name + '(' + props.data.type + ')'} = { props.data.value || props.data.defaultValue }</p>;
  }
}
class JsonToReactEditor {
  static createEditor(container) {
    return ReactDOM.render(<Editor />, container);
  }
}


window.JsonToReactEditor = JsonToReactEditor;
