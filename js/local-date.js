import { registerFunctionComponent } from 'https://cdn.skypack.dev/webact';

function LocalDate({ datetime }) {
  const { html, postRender, $ } = this;

  html`
    <time></time>
  `;

  postRender(() => {
    if (!datetime) {
      return;
    }

    const date = new Date(datetime);
    const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: 'auto' });
    const dtf = new Intl.DateTimeFormat(navigator.language, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });

    const absoluteDateText = dtf.format(date);

    const time = $('time');

    time.setAttribute('datetime', datetime);
    time.setAttribute('title', absoluteDateText);
    time.textContent = absoluteDateText;
  });
}

export default registerFunctionComponent(LocalDate, {
  name: 'local-date'
});
