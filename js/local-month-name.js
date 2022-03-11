customElements.define('local-month-name', class extends HTMLElement {
  connectedCallback() {
    const localMonthNames = [...new Array(12)].map((_, i) => new Intl.DateTimeFormat(navigator.language, { month: 'long' }).format(new Date(Date.UTC(2021, i, 1, 0, 0, 0))));
    this.innerHTML = localMonthNames[parseInt(this.getAttribute('value'), 10) - 1];
  }
});
