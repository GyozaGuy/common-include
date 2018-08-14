import {attrChangedCB, getObservedAttrs, setUpProps} from './propHandler.mjs';

export function createComponent(name, opts = {}) {
  if (name && typeof name === 'string' && /^[a-z]/i.test(name)) {
    const options = Object.assign({}, {
      attributeChangedCallback: null, // called after the built in attributeChangedCallback()
      connectedCallback: null, // called after the built in connectedCallback()
      disconnectedCallback: null, // called after the built in disconnectedCallback()
      methods: [], // array of instance methods
      properties: [], // array of property objects for propHandler to use to set up properties
      setup: null, // used to set up any variables needed for custom property methods
      shadowDOM: true, // whether or not to use shadow DOM
      styles: '', // CSS styles, can be either a string or a DocumentFragment
      template: '' // HTML template, can be either a string or a DocumentFragment
    }, opts);

    const componentClass = class extends HTMLElement {
      constructor() {
        super();
        this._rendered = false;

        if (options.shadowDOM) {
          this.attachShadow({mode: 'open'});

          ['styles', 'template'].forEach(el => {
            if (isDOM(options[el])) {
              this.shadowRoot.appendChild(options[el].cloneNode(true));
            } else {
              this.shadowRoot.innerHTML += options[el];
            }
          });
        }
      }

      attributeChangedCallback(...args) {
        attrChangedCB(this, args);

        if (typeof options.attributeChangedCallback === 'function') {
          options.attributeChangedCallback.call(this, ...args);
        }
      }

      connectedCallback() { // eslint-disable-line complexity
        // Pull content out of template element if present
        const template = this.querySelector('template');

        if (template) {
          this.templateHTML = template.content.innerHTML;
          this.templateText = template.content.textContent;
        }

        if (!this._rendered) {
          if (!options.shadowDOM) {
            this._rendered = true;

            if (!document.head.querySelector(`style[component="${name}"]`)) {
              if (isDOM(options.styles)) {
                document.head.appendChild(options.styles.cloneNode(true));
              } else {
                document.head.innerHTML += options.styles;
              }
            }

            if (isDOM(options.template)) {
              this.appendChild(options.template.cloneNode(true));
            } else {
              this.innerHTML += options.template;
            }
          }

          if (typeof options.setup === 'function') {
            options.setup.call(this);
          }

          setUpProps(this, options.properties);
        }

        Object.keys(options.methods).forEach(method => {
          this[method] = options.methods[method];
        });

        if (typeof options.connectedCallback === 'function') {
          options.connectedCallback.call(this);
        }
      }

      disconnectedCallback() {
        if (typeof options.disconnectedCallback === 'function') {
          options.disconnectedCallback.call(this);
        }
      }
    };

    componentClass.observedAttributes = getObservedAttrs(options.properties);
    customElements.define(name, componentClass);

    return componentClass;
  }

  throw new Error(`Invalid component name: ${name}`);
}

function isDOM(el) {
  return el instanceof DocumentFragment || el instanceof HTMLElement;
}

export default {
  createComponent
};
