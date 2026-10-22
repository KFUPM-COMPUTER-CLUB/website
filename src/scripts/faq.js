/* FAQ language toggle: shows the English or Arabic text of every entry. Only rendered when at
 * least one entry has an Arabic version. Loaded by src/pages/faq.astro. */
import { onPage } from './page.js';

onPage(() => {
  const buttons = [...document.querySelectorAll('[data-faq-lang]')];
  if (!buttons.length) return;
  const show = (lang) => {
    document.querySelectorAll('[data-faq] [data-lang]').forEach((el) => {
      el.hidden = el.getAttribute('data-lang') !== lang;
    });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.faqLang === lang)));
  };
  buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.faqLang)));
});
