function optimizeImages (site, page) {
  for (const match of page.content.matchAll(/<img\s+[^>]*src="([^"]*)"[^>]*>/gi)) {
    const [tag, path] = match;

    const url = new URL('https://example.com' + path);

    const [, ...dirPathArr] = url.pathname.split('/').slice(0, -1);
    const dirPath = dirPathArr.join('/');

    const [, rawWidth] = tag.match(/width="(\d+)"/i);
    const width = parseInt(rawWidth, 10);

    const sizes = [width, width * 1.5, width * 2];

    const avifSrcset = sizes.map(size => `${path.replace('.jpg', `.${size}.avif`)} ${size}w`).join(', ');
    const webpSrcset = sizes.map(size => `${path.replace('.jpg', `.${size}.webp`)} ${size}w`).join(', ');
    const jpgSrcset = sizes.map(size => `${path.replace('.jpg', `.${size}.jpg`)} ${size}w`).join(', ');

    page.content = page.content.replace(tag, `
      <picture>
        <source srcset="${avifSrcset}" type="image/avif">
        <source srcset="${webpSrcset}" type="image/webp">
        <source srcset="${jpgSrcset}" type="image/jpg">
        <img src="${path}" loading="lazy" decoding="async" sizes="${width}w">
      </picture>
    `);

    for (let size of sizes) {
      site.addEventListener('afterBuild', `npx @squoosh/cli --resize "{width: ${size}}" --mozjpeg auto --avif auto --webp auto --output-dir _site/${dirPath} -s '.${size}' _site${path}`);
    }
  }
}

export default function (site) {
  site.process(['.html'], page => optimizeImages(site, page));
}