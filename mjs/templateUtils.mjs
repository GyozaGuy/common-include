export function css(css) {
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  return styleEl;
}

export function html(htmlArr, ...strings) {
  const template = document.createElement('template');

  htmlArr.forEach((a, i) => {
    template.innerHTML += `${a}${strings[i] || ''}`;
  });

  return template.content;
}

export default {
  css,
  html
};
