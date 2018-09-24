let cachedLocales;

const search = {};

if (location.search) {
  location.search.split('?')[1].split('&').forEach(entry => {
    const [key, value] = entry.split('=');
    search[key] = value;
  });
}

const currentLocale = search.lang || document.body.lang || 'en-US';

export function lang(key) {
  if (key && cachedLocales) {
    return cachedLocales[currentLocale][key] || cachedLocales['en-US'][key] || key;
  }

  return 'No key provided or no locales set!';
}

export function setLocales(locales) {
  if (locales) {
    cachedLocales = locales;
  } else {
    console.warn('No locales provided!');
  }
}

export default {
  lang,
  setLocales
};
