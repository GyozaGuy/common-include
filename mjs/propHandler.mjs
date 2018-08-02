import {camelToDash} from './camelDash.mjs';

export function attrChangedCB(el, args) {
  const [attrName, oldVal, newVal] = args;

  if (oldVal !== newVal && el._propNames) {
    const propKey = Object.entries(el._propNames).find(([key, value]) => value === attrName)[0]; // eslint-disable-line no-unused-vars
    const currentPropVal = typeof el[propKey] === 'object' ? JSON.stringify(el[propKey]) : el[propKey];

    if (currentPropVal !== newVal && !(typeof currentPropVal === 'number' && currentPropVal === +newVal)) {
      el[propKey] = newVal;
    }
  }
}

export function getObservedAttrs(propArr) {
  if (Array.isArray(propArr)) {
    return propArr.filter(prop => prop.observed !== false).map(prop => camelToDash(getName(prop)));
  }

  console.error('propArr should be an array of objects!');
}

export function setUpProps(el, propArr) {
  if (el && Array.isArray(propArr)) {
    el._propNames = {};

    propArr.forEach(prop => { // eslint-disable-line complexity
      const name = getName(prop);

      el._propNames[name] = camelToDash(name);

      const props = {
        get: () => {
          let returnValue = el[`_${name}`];

          if (returnValue === 'true') {
            returnValue = true;
          } else if (returnValue === 'false') {
            returnValue = false;
          }

          return returnValue;
        },
        set: val => {
          if (val || val === false || val === 0) {
            el[`_${name}`] = val;

            if (!(prop.hasOwnProperty('setAttr') && prop.setAttr === false)) {
              el.setAttribute(el._propNames[name], typeof val === 'object' ? JSON.stringify(val) : val);
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
              const newVal = el[name]; // Get value in case there are custom getters or setters
              if (!(prop.hasOwnProperty('setAttr') && prop.setAttr === false)) {
                el.setAttribute(el._propNames[name], typeof newVal === 'object' ? JSON.stringify(newVal) : newVal);
              }
            } else if (lastVal && el.hasAttribute(el._propNames[name])) {
              el.setAttribute(el._propNames[name], typeof lastVal === 'object' ? JSON.stringify(lastVal) : lastVal);
            }
          };
        }
      }

      Object.defineProperty(el, name, props);

      let defaultValue;

      if (prop.default || prop.default === false || prop.default === 0) {
        defaultValue = prop.default;
      }

      el[name] = el.getAttribute(el._propNames[name]) || defaultValue;
    });
  } else {
    console.error('propArr should be an array of objects!');
  }
}

function getName(val) {
  return typeof val === 'object' && !Array.isArray(val) ? val.name : val;
}

export default {
  attrChangedCB,
  getObservedAttrs,
  setUpProps
};
