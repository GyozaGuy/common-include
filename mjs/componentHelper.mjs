import {camelToDash} from './camelDash.mjs';

export function Component(componentName) {
  return class extends HTMLElement {
    constructor() {
      super();
      this._rendered = false;
    }

    connected() {}

    connectedCallback() {
      if (!this._rendered) {
        this._rendered = true;

        this.connected();
      }
    }

    static get componentName() {
      return componentName;
    }

    static get observedAttributes() {
      return Object.keys(this.properties).map(p => camelToDash(p));
    }

    static get properties() {
      return {};
    }

    static get reflectedAttributes() {
      return Object.entries(this.properties).filter(([propName, propObj]) => {
        if (propObj.hasOwnProperty('type')) {
          return ['boolean', 'number', 'string'].includes(propObj.type.name);
        }

        return [propName, propObj]; // TODO: remove this?
      }).map(p => camelToDash(p[0]));
    }

    get properties() {
      return this.constructor.properties;
    }
  };
}

export function defineElement(elementClass) {
  if (customElements && !customElements.get(elementClass.componentName)) {
    customElements.define(elementClass.componentName, elementClass);
  }
}

export default {
  Component,
  defineElement
};
