import {camelToDash} from './camelDash.mjs';

export function attrChangedCB(el, args) {
  const [attrName, oldVal, newVal] = args;

  if (oldVal !== newVal && el._propNames) {
    el[Object.entries(el._propNames).find(([key, value]) => value === attrName)[0]] = newVal;
  }
}

export function getAttrNames(propObj) {
  return propObj.map(prop => camelToDash(getName(prop)));
}

export function setUpProps(el, propObj) {
  setTimeout(() => {
    if (el && Array.isArray(propObj)) {
      el._propNames = {};

      propObj.forEach(prop => {
        const name = getName(prop);

        el._propNames[name] = camelToDash(name);

        const props = {
          get: () => el[`_${name}`] === 'true' ? true : el[`_${name}`] === 'false' ? false : el[`_${name}`] || null,
          set: val => {
            if (val || val === false || val === 0) {
              el[`_${name}`] = val;
              if (!(prop.hasOwnProperty('setAttr') && prop.setAttr === false)) {
                el.setAttribute(el._propNames[name], val);
              }
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
              let lastVal = el[name];
              const setPropSuccess = prop.set.call(el, val);

              if (setPropSuccess) {
                lastVal = val;

                if (!(prop.hasOwnProperty('setAttr') && prop.setAttr === false)) {
                  el.setAttribute(el._propNames[name], typeof val === 'object' ? JSON.stringify(val) : val);
                }
              } else if (lastVal && el.hasAttribute(el._propNames[name])) {
                el.setAttribute(el._propNames[name], typeof lastVal === 'object' ? JSON.stringify(lastVal) : lastVal);
              }
            };
          }
        }

        Object.defineProperty(el, name, props);

        el[name] = el.getAttribute(el._propNames[name]) || (prop.default || prop.default === false || prop.default === 0 ? typeof prop.default === 'object' ? JSON.stringify(prop.default) : prop.default : null);
      });
    }
  });
}

function getName(val) {
  return typeof val === 'object' && !Array.isArray(val) ? val.name : val;
}

export default {
  attrChangedCB,
  getAttrNames,
  setUpProps
};
