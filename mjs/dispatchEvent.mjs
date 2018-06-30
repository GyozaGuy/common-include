export default function(el, name, detail = '', bubbles = false) {
  el.dispatchEvent(new CustomEvent(name, {bubbles, detail}));
}
