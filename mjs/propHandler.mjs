import {camelToDash} from './camelDash.mjs';

export function attrChangedCB(el, args) {
  const [attrName, oldVal, newVal] = args;

  if (oldVal !== newVal && el._propNames) {
    el[Object.entries(el._propNames).find(([key, value]) => value === attrName)[0]] = newVal;
  }
}

export function getAttrNames(props) {
  return props.map(prop => camelToDash(getName(prop)));
}

export function setUpProps(el, props) {
  if (el && Array.isArray(props)) {
    el._propNames = {};

    props.forEach(prop => {
      const name = getName(prop);

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

      if (typeof prop === 'object' && !Array.isArray(prop)) {
        if (prop.hasOwnProperty('get')) {
          props.get = prop.get;
        }

        if (prop.hasOwnProperty('set')) {
          props.set = val => {
            const setAttr = prop.set.call(el, val);

            if (!(setAttr === false || (prop.hasOwnProperty('prop') && prop.attr === false))) {
              el.setAttribute(el._propNames[name], typeof val === 'object' ? JSON.stringify(val) : val);
            }
          };
        }
      }

      Object.defineProperty(el, name, props);

      el[name] = el.getAttribute(el._propNames[name]) || prop.default || null;
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