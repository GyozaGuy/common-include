const types = {
  array: {
    name: 'array',
    validate: value => checkValue('array', () => Array.isArray(value))
  },
  boolean: {
    name: 'boolean',
    validate: value => checkValue('boolean', () => typeof value === 'boolean')
  },
  func: {
    name: 'func',
    validate: value => checkValue('func', () => typeof value === 'function')
  },
  number: {
    name: 'number',
    validate: value => checkValue('number', () => typeof value === 'number' && !isNaN(value))
  },
  object: {
    name: 'object',
    validate: value => checkValue('object', () => typeof value === 'object' && !Array.isArray(value))
  },
  string: {
    name: 'string',
    validate: value => checkValue('string', () => typeof value === 'string')
  }
};

function checkValue(type, cb) {
  if (cb()) {
    return true;
  }

  throw new TypeError(`Invalid value found for type "${type}"!`);
}

Object.values(types).forEach(value => {
  value.required = {...value};
});

const {array, boolean, func, number, object, string} = types;

export default {
  array,
  boolean,
  func,
  number,
  object,
  string
};
