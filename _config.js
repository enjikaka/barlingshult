import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";

import squoosh from "https://deno.land/x/lume_plugin_squoosh@v0.0.8/index.js";

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

site.filter('findParagraphTag', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');
  const img = document.querySelector('p');

  return img ? img.outerHTML : '';
});

site.filter('baseHref', () => site.options.location.toString());
site.filter('min', (...numbers) => Math.min.apply(null, numbers));
site.filter('toISODate', date => new Date(date).toISOString().split('T')[0]);
site.filter('tagName', tag => {
  switch (tag) {
    case 'buske':
      return 'Buskar';
    case 'träd':
      return 'Träd';
    default:
      return tag;
  }
});

site.filter(
  'stringify',
  x => JSON.stringify(x, null, 4),
);

export default site;
