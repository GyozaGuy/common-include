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

export function getObservedAttrs(propObj) {
  if (propObj && typeof propObj === 'object') {
    if (Array.isArray(propObj)) {
      return propObj.filter(prop => prop.observed !== false).map(prop => camelToDash(getName(prop)));
    }

    return Object.keys(propObj).filter(prop => propObj[prop] === null || (propObj[prop] && propObj[prop].observed !== false)).map(prop => camelToDash(prop));
  }

  console.error('propObj should be an object or array of objects!');
}

export function setUpProps(el, propObj) {
  if (el && propObj && typeof propObj === 'object') {
    let propArr;

    // Attempt to format propObj in a way that can be processed, allowing either an array or an object
    if (Array.isArray(propObj)) {
      propArr = propObj;
    } else {
      propArr = Object.keys(propObj).map(prop => {
        const currentValue = propObj[prop];

        if (currentValue !== null) {
          let obj;

          if (typeof currentValue !== 'object' || Array.isArray(currentValue)) {
            obj = {
              default: currentValue,
              name: prop
            };
          } else if (typeof currentValue === 'object') {
            obj = Object.assign({}, currentValue, {name: prop});
          }

          return obj || {};
        }

        return prop;
      });
    }

    el._propNames = {};

    // Configure getters and setters for each property
    propArr.forEach(prop => { // eslint-disable-line complexity
      const name = getName(prop);

      el._propNames[name] = camelToDash(name);

      const props = {
        get: () => {
          let returnVal = el[`_${name}`];

          if (typeof returnVal === 'string') {
            if (returnVal.toLowerCase() === 'true') {
              returnVal = true;
            } else if (returnVal.toLowerCase() === 'false') {
              returnVal = false;
            }
          }

          return returnVal;
        },
        set: val => {
          let setVal = val;

          if (typeof setVal === 'string') {
            if (setVal.toLowerCase() === 'true') {
              setVal = true;
            } else if (setVal.toLowerCase() === 'false') {
              setVal = false;
            }
          }

          if ((setVal || setVal === false || setVal === 0 || setVal === '') &&
              (!prop.hasOwnProperty('default') || typeof setVal === typeof prop.default)) {
            el[`_${name}`] = setVal;

            if (!(prop.hasOwnProperty('setAttr') && prop.setAttr === false)) {
              el.setAttribute(el._propNames[name], typeof setVal === 'object' ? JSON.stringify(setVal) : setVal);
            }
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

      if (prop.default || prop.default === false || prop.default === 0 || prop.default === '') {
        defaultValue = prop.default;
      }

      el[name] = el.getAttribute(el._propNames[name]) || defaultValue;
    });
  } else {
    console.error('propObj should be an object or array of objects!');
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
