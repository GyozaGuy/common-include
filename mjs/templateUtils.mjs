export function css(css) {
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  return styleEl;
}

export function html(htmlArr, ...strings) {
  const template = document.createElement('template');
  let htmlString = '';

  htmlArr.forEach((a, i) => {
    htmlString += `${a}${strings[i] || ''}`;
  });

  template.innerHTML = htmlString;

  return template.content;
}

export default {
  css,
  html
};
