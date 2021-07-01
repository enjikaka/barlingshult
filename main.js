import './_includes/js/date-header.js';

[...document.querySelectorAll('img')].forEach(imageElement => {
  imageElement.addEventListener('error', () => imageElement.remove());
});
