export function css(css) {
  const styleEl = document.createElement('style');
  styleEl.textContent = css.join();
  return styleEl;
}

export function dom(htmlString, context) {
  const template = document.createElement('template');
  template.innerHTML = htmlString;
  const elements = template.content;

  if (context) {
    [...elements.children].forEach(child => {
      convertAttributes(child, context);
    });
  }

  return elements;
}

const domFunctions = {};

export function html(htmlArr, ...strings) {
  return htmlArr.reduce((acc, cur, i) => {
    let currentString = strings[i] || '';

    if (typeof currentString === 'object') {
      if (Array.isArray(currentString)) {
        currentString = currentString.join('');
      } else {
        currentString = JSON.stringify(currentString);
      }
    } else if (typeof currentString === 'function') {
      const id = Math.random().toString(36).substr(2, 9);

      domFunctions[id] = currentString;
      currentString = id;
    }

    return `${acc}${cur}${currentString}`;
  }, '');
}

function convertAttributes(element, context) {
  [...element.attributes].forEach(attr => {
    if (attr.name === '@name') {
      context[attr.value] = element;
      element.removeAttribute(attr.name);
    } else if (/^#/.test(attr.name)) {
      element.addEventListener(attr.name.substr(1), domFunctions[attr.value]);
      element.removeAttribute(attr.name);
      delete domFunctions[attr.value];
    }
  });

  [...element.children].forEach(child => {
    convertAttributes(child, context);
  });
}

export default {
  css,
  dom,
  html
};
