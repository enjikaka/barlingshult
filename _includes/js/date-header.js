import { registerFunctionComponent } from 'https://cdn.skypack.dev/webact';

function DateHeader({ datetime }) {
  const { css, html, postRender, $$ } = this;

  css`
    :host {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      background-image: linear-gradient(to bottom, #84401C, #41150C);
      padding: 0.5em 1em;
      color: white;
      position: relative;
      display: flex;
      flex-direction: row nowrap;
      text-align: center;
    }

    :host::after {
      content: "";
      width: 25%;
      height: 1em;
      background-color: #41150C;
      position: absolute;
      display: block;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
    }

    time {
      text-transform: capitalize;
      font-variant: small-caps slashed-zero;
      font-size: 0.8em;
      flex: 1;
      text-align: left;
      padding: 0 0.5em;
    }

    time:last-child {
      text-align: right;
    }
  `;

  html`
    <time></time>
    <time></time>
  `;

  postRender(() => {
    const date = new Date(datetime);
    const rtf = new Intl.RelativeTimeFormat('sv-SE', { numeric: "auto" });

    const timeElements = $$('time');

    [...timeElements].forEach(time => {
      time.setAttribute('datetime', datetime);
    });

    timeElements[0].textContent = rtf.format(0, 'day');
    timeElements[1].textContent = new Intl.DateTimeFormat('sv-SE', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  });
}

export default registerFunctionComponent(DateHeader, {
  name: 'date-header'
});
