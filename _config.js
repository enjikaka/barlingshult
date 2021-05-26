import lume from "https://deno.land/x/lume@v0.20.0/mod.js";
import date from "https://deno.land/x/lume@v0.20.0/plugins/date.js";
import postcss from "https://deno.land/x/lume@v0.20.0/plugins/postcss.js";
import terser from "https://deno.land/x/lume@v0.20.0/plugins/terser.js";

import squoosh from './squoosh-2.js';

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

site.filter('baseHref', () => site.options.location.toString());
site.filter('min', (...numbers) => Math.min.apply(null, numbers));
site.filter('toISODate', date => new Date(date).toISOString().split('T')[0]);

site.filter(
  'stringify',
  x => JSON.stringify(x, null, 4),
);

export default site;
