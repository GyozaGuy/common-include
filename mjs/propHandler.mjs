import {camelToDash} from './camelDash.mjs';

export function attrChangedCB(el, args) {
  const [attrName, oldVal, newVal] = args;

  if (oldVal !== newVal && el._propNames) {
    el[Object.entries(el._propNames).find(([key, value]) => value === attrName)[0]] = newVal;
  }
}

export function getAttrNames(attrs) {
  return attrs.map(attr => camelToDash(getName(attr)));
}

export function setUpProps(el, attrs) {
  if (el && Array.isArray(attrs)) {
    el._propNames = {};

    attrs.forEach(attr => {
      const name = getName(attr);

      el._propNames[name] = camelToDash(name);

      const props = {
        get: () => el[`_${name}`],
        set: val => {
          if (val) {
            el[`_${name}`] = val;
            el.setAttribute(el._propNames[name], val);
          } else {
            delete el[`_${name}`];
            el.removeAttribute(el._propNames[name]);
          }
        }
      };

      if (typeof attr === 'object' && !Array.isArray(attr)) {
        if (attr.hasOwnProperty('get')) {
          props.get = attr.get;
        }

        if (attr.hasOwnProperty('set')) {
          props.set = val => {
            const setAttr = attr.set.call(el, val);

            if (!(setAttr === false || (attr.hasOwnProperty('attr') && attr.attr === false))) {
              el.setAttribute(el._propNames[name], typeof val === 'object' ? JSON.stringify(val) : val);
            }
          };
        }
      }

      Object.defineProperty(el, name, props);

      if (attr.hasOwnProperty('default')) {
        el[name] = el.getAttribute(el._propNames[name]) || attr.default;
      }
    });
  }
}

function getName(val) {
  return typeof val === 'object' && !Array.isArray(val) ? val.name : val;
}

export default {
  attrChangedCB,
  getAttrNames,
  setUpProps
};
