import { posix, dirname} from "https://deno.land/x/lume@v0.20.0/deps/path.js";
import { DOMParser } from "https://deno.land/x/lume@v0.20.0/deps/dom.js";
import { exists } from 'https://deno.land/x/lume@v0.20.0/deps/fs.js';

import { documentToString } from "https://deno.land/x/lume@v0.20.0/utils.js";

const squooshTasks = [];

const formats = [
  'avif',
  'webp',
  'jpg'
];

const mimeTypes = {
  'avif': 'image/avif',
  'webp': 'image/webp',
  'jpg': 'image/jpeg'
};

/**
 * @param {HTMLImageElement} image
 * @returns
 */
async function generatePictureElement (site, document, image) {
  const url = posix.relative(site.options.location.pathname, image.getAttribute('src'));

  const width = parseInt(image.getAttribute('width'), 10);
  const srcset = image.getAttribute('data-srcset');

  const sizes = srcset
    ? srcset
      .split(',')
      .map(s => s.trim())
      .map(s => {
        if (s.includes('w')) return parseInt(s);
        if (s.includes('x')) return parseFloat(s) * width;

        return s;
      })
    : [width, width * 1.5, width * 2];

  const isMacOS = Deno.env.get('_system_type') === 'Darwin';

  const targetPath = posix.relative(
    site.options.location.pathname,
    `/_site/${url}`
  );
  const targetExists = await exists(targetPath);


  const cachedEntryPath = posix.relative(
    site.options.location.pathname,
    `/_img-build-cache/${url}`
  );
  const cachedEntryExists = await exists(cachedEntryPath);

  if (!targetExists && !cachedEntryExists) {
    squooshTasks.push(
      ...sizes.map(size => isMacOS ?
        // macOS needs double wrapping around object.
        `npx @squoosh/cli --resize '"{width: ${size}}"' --mozjpeg auto --avif auto --webp auto --output-dir _site/${dirname(url)}/ -s '_${size}w' ${url}` :
        // Linux fails on double wrapping, do single.
        `npx @squoosh/cli --resize '{width: ${size}}' --mozjpeg auto --avif auto --webp auto --output-dir _site/${dirname(url)}/ -s '_${size}w' ${url}`
      )
    );
  }

  const picture = document.createElement('picture');

  formats.forEach(format => {
    const srcset = sizes
      .map(size => `/${url.replace('.jpg', `_${size}w.${format}`)} ${size}w`)
      .join(', ');

    const source = document.createElement('source');

    source.setAttribute('srcset', srcset);
    source.setAttribute('type', mimeTypes[format]);

    picture.appendChild(source);
  });

  const img = document.createElement('img');

  img.setAttribute('src', '/' + url.replace('.jpg', `_${sizes[0]}w.jpg`));
  img.setAttribute('alt', image.getAttribute('alt'));
  img.setAttribute('width', image.getAttribute('width'));
  img.setAttribute('sizes', width + 'w');
  img.setAttribute('loading', 'lazy');
  img.setAttribute('decoding', 'async');

  picture.setAttribute('title', image.getAttribute('alt'));
  picture.appendChild(img);

  return picture;
}

async function findAndOptimizeImages (site, page) {
  const parser = new DOMParser();
  const document = parser.parseFromString(page.content, 'text/html');

  for (const image of document.querySelectorAll('img')) {
    const picture = await generatePictureElement(site, document, image);

    image.parentNode.replaceChild(picture, image);

    page.content = documentToString(document);
  }
}

export default function () {
  return site => {
    site.process(['.html'], page => findAndOptimizeImages(site, page));

    site.addEventListener('afterBuild', () => {
      // Spread so they run in series, parallel will freeze your computer. :)
      site.script('image-optimizer', ...squooshTasks);
      site.run("image-optimizer");
    });
  };
}
