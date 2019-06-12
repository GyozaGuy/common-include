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

export function checkFunction({value}) {
  if (typeof value === 'function') {
    return true;
  }

  throw new TypeError(`Expected type "function" for value \`${value}\`, got "${typeof value}"!`);
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
  {class: Function, method: checkFunction},
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
