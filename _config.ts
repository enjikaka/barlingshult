import lume from "lume/mod.ts";

import date from "lume/plugins/date.ts";
import postcss from "lume/plugins/postcss.ts";
import terser from "lume/plugins/terser.ts";
import feed from "lume/plugins/feed.ts";

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


site.use(postcss());
site.use(terser());
site.use(date());

site.use(slugifyUrls());

site.use(picture());
site.use(transformImages());

site.copy('/img/svg');
site.copy('/fonts');

site.filter(
  'head',
  (array, n) => (n < 0) ? array.slice(n) : array.slice(0, n),
);

site.filter("truncate", (value, length) => `${value.substring(0, length)}…`);

site.filter('latinPlantLogo', text => `/img/logo/${text.toLocaleLowerCase().split(' ').join('-')}.png`);

site.filter("groupByFamily", value => {
  const families: Record<string, any[]>  = {};

  for (const plant of value) {
    const family = plant.latin.split(' ')[0];
    families[family] = [...(families[family] || []), plant];
  }

  return families;
});

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
      count: plants.length
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
      return img.getAttribute('src')?.replace('.jpg', '_60w.webp') ?? '';
    }
  }

  return '';
});

site.filter('findTextContent', text => {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, 'text/html');

  return document?.textContent ?? '';
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
