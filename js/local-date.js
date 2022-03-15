import { registerFunctionComponent } from 'https://cdn.skypack.dev/webact';

function LocalDate({ datetime }) {
  const { html, postRender, $ } = this;

  html`
    <time itemprop="datePublished"></time>
  `;

  postRender(() => {
    if (!datetime) {
      return;
    }

    const date = new Date(datetime);
    const dtf = new Intl.DateTimeFormat(navigator.language, { dateStyle: 'full' });

    const absoluteDateText = dtf.format(date);

    const time = $('time');

    time.setAttribute('content', date.toISOString());
    time.setAttribute('datetime', date.toISOString());
    time.setAttribute('title', absoluteDateText);
    time.textContent = absoluteDateText;
  });
}

export default registerFunctionComponent(LocalDate, {
  name: 'local-date'
});
