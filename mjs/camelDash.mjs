export function camelToDash(str) { return str.replace(/([A-Z])/g, val => `-${val.toLowerCase()}`); }
export function dashToCamel(str) { return str.replace(/(-[a-z])/g, val => val.toUpperCase().replace('-', '')); }
export function switchCaseMode(str) { return (/-/).test(str) ? dashToCamel(str) : camelToDash(str); }
export default {camelToDash, dashToCamel, switchCaseMode};
