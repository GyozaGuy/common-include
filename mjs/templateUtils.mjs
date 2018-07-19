export function css(css) {
  const wrapper = document.createElement('style');
  wrapper.textContent = css;
  return wrapper;
}

export function html(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper.firstElementChild;
}

export default {
  css,
  html
};
