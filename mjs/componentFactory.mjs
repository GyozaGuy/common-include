import {attrChangedCB, getAttrNames, setUpProps} from './propHandler.mjs';

export function createComponent(opts = {}) {
  const options = Object.assign({}, {
    attributeChangedCallback: () => {},
    connectedCallback: () => {},
    disconnectedCallback: () => {},
    properties: [],
    shadowDOM: false,
    styles: '',
    template: ''
  }, opts);

  const componentClass = class extends HTMLElement {
    constructor() {
      super();
      this._rendered = false;

      if (options.shadowDOM) {
        this.attachShadow({mode: 'open'});

        ['styles', 'template'].forEach(el => {
          if (options[el] instanceof DocumentFragment) {
            this.shadowRoot.appendChild(options[el]);
          } else {
            this.shadowRoot.innerHTML += options[el];
          }
        });
      }
    }

    attributeChangedCallback(...args) {
      attrChangedCB(this, args);
      options.attributeChangedCallback.call(this, ...args);
    }

    connectedCallback() {
      if (!this._rendered && !options.shadowDOM) {
        this._rendered = true;

        if (options.styles instanceof DocumentFragment) {
          document.head.appendChild(options.styles);
        } else {
          document.head.innerHTML += options.styles;
        }

        if (options.template instanceof DocumentFragment) {
          this.appendChild(options.template);
        } else {
          this.innerHTML += options.template;
        }
      }

      setUpProps(this, options.properties);
      options.connectedCallback.call(this);
    }

    disconnectedCallback() {
      options.disconnectedCallback.call(this);
    }
  };
  componentClass.observedAttributes = getAttrNames(options.properties);

  return componentClass;
}

export default {
  createComponent
};
