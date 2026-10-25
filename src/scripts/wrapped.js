/* /me/wrapped: the preview follows the "Put my name on the image" box, so what you see is what you
 * download. Without this script the preview shows the default and the download still honours the box. */
import { onPage, listen } from './page.js';

onPage(() => {
  const form = document.querySelector('[data-wrapped]');
  const box = form?.querySelector('[data-wrapped-name]');
  const img = document.querySelector('[data-wrapped-preview]');
  if (!form || !box || !img) return;
  return listen(box, 'change', () => {
    img.src = box.checked ? form.dataset.srcName : form.dataset.srcPlain;
  });
});
