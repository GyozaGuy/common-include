// Component class

export class Component extends HTMLElement {
  _bindListeners = {};
  _defaultGet = propName => () => {
    const currentProp = this.constructor.properties[propName];
    const dashName = toAttrName(propName);
    let value;

    if (this.constructor.reflectedAttributes.includes(dashName)) {
      if (currentProp.hasOwnProperty('type')) {
        if (currentProp.type.name === 'boolean' && currentProp.toggle) {
          value = currentProp.type.cast(this.hasAttribute(dashName));
        } else {
          value = currentProp.type.cast(this.getAttribute(dashName));
        }
      } else {
        value = this.getAttribute(dashName);
      }
    } else {
      value = this[`_${propName}`];
    }

    if (typeof currentProp.getCallback === 'function' && this._rendered) {
      currentProp.getCallback(value, this);
    }

    return value;
  };
  _defaultSet = propName => value => {
    const currentProp = this.constructor.properties[propName];

    if ((currentProp.hasOwnProperty('type') && currentProp.type.check({propName, value})) ||
        !currentProp.hasOwnProperty('type')) {
      this[`_${propName}`] = value;

      const dashName = toAttrName(propName);

      if (this.constructor.reflectedAttributes.includes(dashName)) {
        if (!currentProp.hasOwnProperty('type') ||
            (currentProp.type.name === 'boolean' && !currentProp.toggle) ||
            currentProp.type.name !== 'boolean') {
          this.setAttribute(dashName, value);
        } else if (currentProp.type.name === 'boolean' && currentProp.toggle) {
          if (value) {
            this.setAttribute(dashName, '');
          } else {
            this.removeAttribute(dashName);
          }
        }

        if (currentProp.cssProperty) {
          this.style.setProperty(`--${dashName}`, value);
        }
      }

      if (typeof currentProp.setCallback === 'function' && this._rendered) {
        currentProp.setCallback(value, this);
      }

      if (Array.isArray(this._bindListeners[propName])) {
        this._bindListeners[propName].forEach(method => method(value));
      }
    }
  };
  _rendered = false;
  _root = this;

  constructor() {
    super();
    this.useShadow = true;
  }

  connected() {}

  connectedCallback() {
    if (!this._rendered) {
      if (this.useShadow) {
        this.attachShadow({mode: 'open'});
        this._root = this.shadowRoot;
      }

      [this.styles, this.template].forEach(content => {
        if (content) {
          if (this._isDOM(content)) {
            this._root.appendChild(content);
          } else {
            this._root.innerHTML += content;
          }
        }
      });

      const initialValues = {};

      Object.entries(this.constructor.properties).forEach(([propName, propObj]) => {
        const initialValue = this._upgradeProperty(propName, propObj.default);

        if (propObj.hasOwnProperty('type') && (initialValue || propObj.type.isRequired)) {
          try {
            if (propObj.type.check({propName, value: initialValue})) {
              initialValues[propName] = initialValue;
            }
          } catch (err) {
            console.error(err);
            this.remove();
          }
        } else if (initialValue) {
          initialValues[propName] = initialValue;
        }

        Object.defineProperty(this, propName, {
          get: this._defaultGet(propName),
          set: this._defaultSet(propName)
        });
      });

      this._rendered = true;

      Object.entries(initialValues).forEach(([propName, value]) => {
        this[propName] = value;
      });

      this.connected();
    }
  }

  disconnected() {}

  disconnectedCallback() {
    this.clearEvents();
    this.disconnected();
  }

  static get observedAttributes() {
    return Object.keys(this.properties).map(p => toAttrName(p));
  }

  static get reflectedAttributes() {
    return Object.entries(this.properties).filter(([propName, propObj]) => {
      if (propObj.hasOwnProperty('type')) {
        return ['boolean', 'number', 'string'].includes(propObj.type.name);
      } else {
        return [propName, propObj];
      }
    }).map(p => toAttrName(p[0]));
  }

  get properties() {
    return this.constructor.properties;
  }

  bindTo(property, target) {
    if (!this._bindListeners[property]) {
      this._bindListeners[property] = [];
    }

    const callback = typeof target === 'function' ? target : () => {
      target.textContent = this[property];
    };

    this._bindListeners[property].push(callback);
    callback(this[property]);
  }

  clearEvents(target = this) {
    clearEvents(target);
  }

  emitEvent(eventName, detail, options) {
    emitEvent(this, eventName, detail, options);
  }

  onEvent(target, eventName, callback, options) {
    onEvent(this, target, eventName, callback, options);
  }

  select(selector) {
    return this._root.querySelector(selector);
  }

  selectAll(selector) {
    return this._root.querySelectorAll(selector);
  }

  _isDOM(el) {
    return el && (el instanceof DocumentFragment || el instanceof HTMLElement);
  }

  _upgradeProperty(propName, defaultValue) {
    const dashName = toAttrName(propName);
    const currentProp = this.constructor.properties[propName];
    let value;

    if (this.hasOwnProperty(propName)) {
      value = this[propName];
      delete this[propName];
    } else if (this.hasAttribute(dashName) && (this.getAttribute(dashName) || currentProp.toggle)) {
      if (currentProp.hasOwnProperty('type')) {
        value = currentProp.type.cast(this.getAttribute(dashName));
      } else {
        value = this.getAttribute(dashName);
      }
    } else {
      value = defaultValue;
    }

    return value;
  }
}

// Name conversions

export function toAttrName(str) {
  return str.replace(/([A-Z])/g, val => `-${val.toLowerCase()}`);
}

export function toPropName(str) {
  return str.replace(/(-[a-z])/g, val => val.toUpperCase().replace('-', ''));
}

// Events

const listeners = {};

export function clearEvents(context) {
  if (Array.isArray(listeners[context])) {
    listeners[context].forEach(remover => {
      remover();
    });
  }

  delete listeners[context];
}

export function emitEvent(context, eventName, detail, options = {bubbles: true, composed: true}) {
  context.dispatchEvent(new CustomEvent(eventName, {...options, detail}));
}

export function onEvent(context, target, eventName, callback, options = {}) {
  if (!listeners[context]) {
    listeners[context] = [];
  }

  target.addEventListener(eventName, event => callback(event), options);

  listeners[context].push(() => target.removeEventListener(eventName, callback, options));
}

// PropTypes

export function checkArray({value}) {
  if (Array.isArray(value)) {
    return true;
  }

  throw new TypeError(`Expected type "array" for value \`${value}\`, got "${typeof value}"!`);
}

export function checkBoolean({value}) {
  if (typeof value === 'boolean') {
    return true;
  }

  throw new TypeError(`Expected type "boolean" for value \`${value}\`, got "${typeof value}"!`);
}

export function checkNumber({value}) {
  if (typeof value === 'number' && !isNaN(value)) {
    return true;
  }

  throw new TypeError(`Expected type "number" for value \`${value}\`, got "${typeof value}"!`);
}

export function checkObject({value}) {
  if (typeof value === 'object' && !Array.isArray(value)) {
    return true;
  }

  throw new TypeError(`Expected type "object" for value \`${value}\`, got "${typeof value}"!`);
}

export function checkString({value}) {
  if (typeof value === 'string') {
    return true;
  }

  throw new TypeError(`Expected type "string" for value \`${value}\`, got "${typeof value}"!`);
}

function getRequired(method, name, castClass) {
  return {
    cast: castClass,
    check: ({propName, value}) => {
      if (value == undefined) {
        throw new TypeError(`Default value of type "${name}" required for property "${propName}"`);
      }

      return method({value});
    },
    isRequired: true,
    name
  }
}

const types = [
  {class: Array, method: checkArray},
  {class: Boolean, method: checkBoolean},
  {class: Number, method: checkNumber},
  {class: Object, method: checkObject},
  {class: String, method: checkString}
];

export const propTypes = {};

types.forEach(type => {
  const name = type.class.name.toLowerCase();

  propTypes[name] = {
    cast: type.class,
    check: type.method,
    name: name,
    required: getRequired(type.method, name, type.class)
  };
});

// Template Utils

export function dom(template, data = {}) {
  const templateEl = document.createElement('template');
  templateEl.innerHTML = insertData(template, data);
  return templateEl.content;
}

export function str(template, data = {}) {
  return insertData(template, data);
}

function insertData(template, data) {
  let completedTemplate = template;

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    completedTemplate = completedTemplate.replace(regex, value);
  });

  return completedTemplate;
}

export const templateUtils = {dom, str};

// Exports

export default {
  Component,
  toAttrName,
  toPropName,
  clearEvents,
  emitEvent,
  onEvent,
  propTypes,
  dom,
  str,
  templateUtils
};