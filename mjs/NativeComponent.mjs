import {attrChangedCB, getObservedAttrs, setUpProps} from './propHandler.mjs';

export default class extends HTMLElement {
  constructor() {
    super();
    this._rendered = false;
    this.properties = {};
    this.shadowDOM = true;
    this.styles = '';
    this.template = '';
  }

  attributeChangedCallback(...args) {
    if (this._rendered) {
      attrChangedCB(this, args);
    }
  }

  connectedCallback() {
    if (!this._rendered) {
      if (this.shadowDOM) {
        this.attachShadow({mode: 'open'});

        ['styles', 'template'].forEach(el => {
          if (this._isDOM(this[el])) {
            this.shadowRoot.appendChild(this[el].cloneNode(true));
          } else {
            this.shadowRoot.innerHTML += this[el];
          }
        });
      } else {
        if (this._isDOM(this.styles)) {
          document.head.appendChild(this.styles.cloneNode(true));
        } else {
          document.head.innerHTML += this.styles;
        }

        if (this._isDOM(this.template)) {
          this.appendChild(this.template.cloneNode(true));
        } else {
          this.innerHTML += this.template;
        }
      }

      setUpProps(this, this.properties);
      this._rendered = true;
    }
  }

  static get observedAttributes() {
    if (this.properties && typeof this.properties === 'object') {
      return getObservedAttrs(this, this.properties);
    }
  }

  get properties() {
    return this._properties;
  }

  set properties(properties) {
    this._properties = properties;
  }

  get shadowDOM() {
    return this._shadowDOM;
  }

  set shadowDOM(shadowDOM) {
    this._shadowDOM = shadowDOM === true;
  }

  get styles() {
    return this._styles;
  }

  set styles(styles) {
    this._styles = styles;
  }

  get template() {
    return this._template;
  }

  set template(template) {
    this._template = template;
  }

  _isDOM(el) {
    return el && (el instanceof DocumentFragment || el instanceof HTMLElement);
  }
}
