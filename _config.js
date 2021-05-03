import lume from "https://deno.land/x/lume@v0.18.1/mod.js";
import date from "https://deno.land/x/lume@v0.18.1/plugins/date.js";
import postcss from "https://deno.land/x/lume@v0.18.1/plugins/postcss.js";

const site = lume({
  location: new URL("https://example.com/"),
  slugifyUrls: false
});

site.ignore("README.md");
site.copy("_includes/js", "js");
site.copy("_includes/css", "css");
site.copy("_includes/img", "img");

site.use(postcss());
site.use(date());

site.filter(
  "head",
  (array = [], n) => (n < 0) ? array.slice(n) : array.slice(0, n),
);
site.filter("min", (...numbers) => Math.min.apply(null, numbers));
site.filter(
  "stringify",
  x => JSON.stringify(x, null, 4),
);

export default site;
