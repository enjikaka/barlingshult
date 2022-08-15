import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";

import squoosh from "https://deno.land/x/lume_plugin_squoosh@v0.0.12/index.ts";

import { DOMParser } from 'lume/deps/dom.ts';

const site = lume({
  location: new URL('https://barlingshult.se/'),
  slugifyUrls: false
});

site.ignore('README.md');

site.use(postcss());
site.use(terser());
site.use(date());
site.use(squoosh());

/*
site.loadAssets([".js"], textLoader);
site.process([".js"], page => {
  console.log(page.src.path + page.src.ext + ' -> ' + page.dest.path + page.dest.ext);
});
*/

site.filter(
  'head',
  (array = [], n) => (n < 0) ? array.slice(n) : array.slice(0, n),
);

site.filter('findImgTag', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');
  const img = document.querySelector('img');

  return img ? img.outerHTML : '';
});

site.filter('findImgSrc', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');
  const img = document.querySelector('img');

  return img ? img.getAttribute('src').replace('.jpg', '_60w.webp') : '';
});


site.filter('findParagraphTag', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');
  const img = document.querySelector('p');

  return img ? img.outerHTML : '';
});

site.filter('findTextContent', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');
  const p = document.querySelector('p');

  return p ? p.textContent : '';
});

site.filter('baseHref', () => site.options.location.toString());
site.filter('min', (...numbers) => Math.min.apply(null, numbers));
site.filter('toISODate', date => new Date(date).toISOString().split('T')[0]);
site.filter('tagName', tag => {
  switch (tag) {
    case 'nöt':
      return 'Nötter';
    case 'frukt':
      return 'Frukt';
    case 'träd':
      return 'Övriga träd';
    case 'buske':
      return 'Buskar';
    case 'grönsak':
      return 'Grönsaker';
    case 'bär':
      return 'Bär';
    case 'perenn_grönsak':
      return 'Perenna grönsaker';
    default:
      return tag;
  }
});

site.filter(
  'stringify',
  x => JSON.stringify(x, null, 4),
);

export default site;
