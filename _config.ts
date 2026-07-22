import lume from "lume/mod.ts";

import date from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";
import feed from "lume/plugins/feed.ts";
import metas from "lume/plugins/metas.ts";
import sitemap from "lume/plugins/sitemap.ts";

import slugifyUrls from "lume/plugins/slugify_urls.ts";

import picture from "lume/plugins/picture.ts";
import transformImages from "lume/plugins/transform_images.ts";

import { DOMParser } from 'lume/deps/dom.ts';
import { Page } from "lume/core/file.ts";

const site = lume({
  location: new URL('https://barlingshult.se/')
});

site.ignore('README.md');

site.use(feed({
  output: ["/posts.rss", "/posts.json"],
  query: "type=post",
  info: {
    title: "=site.title",
    description: "=site.description",
  },
  items: {
    title: "=title",
    description: "=excerpt",
  },
}));

site.use(metas());

// Växter och djur saknar layout och visas bara inbäddade i arkivsidorna,
// så deras fragmentsidor ska inte med i sitemapen.
site.use(sitemap({
  query: "type!=plants type!=animals",
}));

// Produkter och växter har name/sort i stället för title.
// Ge dem en riktig titel i sina metataggar.
site.preprocess([".md"], (pages) => {
  for (const page of pages) {
    if (page.data.name && !page.data.title) {
      page.data.metas = {
        ...page.data.metas,
        title: `${page.data.name}${page.data.sort ? ` '${page.data.sort}'` : ''}`,
      };
    }
  }
});

site.use(terser());
site.add([".js"]);

site.use(postcss());
site.add([".css"]);

site.use(date());

site.use(slugifyUrls());

site.use(picture());
site.use(transformImages());
site.add("/img");

site.copy('/img/svg');
site.copy('/fonts');
site.copy('/.well-known');

site.filter(
  'head',
  (array, n) => (n < 0) ? array.slice(n) : array.slice(0, n),
);

site.filter("truncate", (value, length) => value.length > length ? `${value.substring(0, length).trimEnd()}…` : value);

const svDateFormat = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'long' });
site.filter('humanDate', value => svDateFormat.format(new Date(value)));

site.filter('latinPlantLogo', text => `/img/logo/${text.toLocaleLowerCase().split(' ').join('-')}.png`);

site.filter("groupByFamily", value => {
  const families: Record<string, any[]>  = {};

  for (const plant of value) {
    const family = plant.latin.split(' ')[0];
    families[family] = [...(families[family] || []), plant];
  }

  return families;
});

const familyToSwedish: Record<string, string> = {
  'Actinidia': 'Aktinidiasläktet',
  'Amelanchier': 'Häggmispelsläktet',
  'Aronia': 'Aroniasläktet',
  'Caragana': 'Karagansläktet',
  'Chaenomeles': 'Rosenkvittensläktet',
  'Cornus': 'Kornellsläktet',
  'Corylus': 'Hasselsläktet',
  'Fragaria': 'Smultronsläktet',
  'Hippophae': 'Havtornssläktet',
  'Lonicera': 'Tryar',
  'Malus': 'Aplar',
  'Morus': 'Mullbärssläktet',
  'Prunus': 'Plommonsläktet',
  'Pyrus': 'Päronsläktet',
  'Ribes': 'Ripsar',
  'Rubus': 'Rubusar',
  'Vaccinium': 'Blåbärssläktet',
  'Vitis': 'Vinsläktet'
};

site.filter("getFamilies", value => {
  const families: Record<string, any[]>  = {};

  for (const plant of value) {
    if (!plant.disabled && !plant.dead) {
      const family = plant.latin.split(' ')[0];
      families[family] = [...(families[family] || []), plant];
    }
  }

  return Object.entries(families)
    .map(([family, plants]) => ({
      name: family,
      slug: family.toLocaleLowerCase().split(' ').join('-'),
      count: plants.length,
      swedishName: familyToSwedish[family] ?? '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

site.filter('firstPicture', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');

  console.log(text);

  if (document) {
    const pictureElement = document.querySelector('picture');

    if (pictureElement) {
      return pictureElement.outerHTML;
    }
  }

  return '';
});

function addImgSizes (page: Page) {
  if (page.document) {
    const img = page.document.querySelector('img');

    if (img) {
      const width = img.getAttribute('width');
      const srcset = img.getAttribute('srcset');

      if (srcset && width && !img.hasAttribute('sizes')) {
        img.setAttribute('sizes', `${width}px`);
      }
    }
  }
}

site.process([".html"], async (pages) => {
  await Promise.all(pages.map(addImgSizes));
});

site.filter('findImgTag', (text, size) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');

  if (document) {
    const img = document.querySelector('img');

    if (img) {
      img.setAttribute('width', size);

      const transformImages = img.getAttribute('transform-images');
      const width = img.getAttribute('width');

      if (transformImages && width) {
        img.setAttribute('transform-images', transformImages.replace(`${parseInt(width, 10)}`, size));
      }

      return img.outerHTML;
    }
  }

  return '';
});

site.filter('findImgSrc', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');

  if (document) {
    const img = document.querySelector('img');

    if (img) {
      return img.getAttribute('src') ?? '';
    }
  }

  return '';
});

site.filter('findTextContent', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');

  return document?.textContent ?? '';
});

site.filter('productJsonLd', (data) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data.content, 'text/html');
  const src = document?.querySelector('img')?.getAttribute('src');

  const availability = data.in_stock === true
    ? 'InStock'
    : data.in_stock === 'soon' ? 'PreOrder' : 'OutOfStock';

  return JSON.stringify({
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: `${data.name}${data.sort ? ` '${data.sort}'` : ''}`,
    description: (document?.textContent ?? '').trim(),
    image: src ? [site.url(src, true)] : undefined,
    offers: {
      '@type': 'Offer',
      url: site.url(data.url, true),
      availability: `https://schema.org/${availability}`,
      priceCurrency: 'SEK',
      price: data.price,
      priceValidUntil: `${new Date().getFullYear()}-12-31`,
    },
  }, null, 2);
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
