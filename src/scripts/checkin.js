/* Camera scanner on /admin/events/<id>/checkin. Uses the browser's own BarcodeDetector (Chrome and Edge
 * on Android, desktop Chrome), so no library ships to the page; where it is missing the scanner stays
 * hidden and the hint points to the phone's camera app, which opens the same check-in through the
 * link inside the code. Each code read is posted once; the same code is ignored for a few seconds so
 * one held in front of the camera is not sent again and again. The camera stops when the page does. */
import { onPage, listen, bag } from './page.js';

const TOKEN = /\/admin\/checkin\/([0-9a-f]{32})\b|^([0-9a-f]{32})$/i;

onPage(() => {
  const root = document.querySelector('[data-checkin]');
  if (!root || !('BarcodeDetector' in window)) return;
  const scanner = root.querySelector('[data-checkin-scanner]');
  const start = root.querySelector('[data-checkin-start]');
  const video = root.querySelector('[data-checkin-video]');
  const result = root.querySelector('[data-checkin-result]');
  const fallback = root.querySelector('[data-checkin-fallback]');
  const off = bag();
  let stream = null,
    timer = 0,
    busy = false,
    stopped = false;
  const seen = new Map();

  const show = (text, good) => {
    result.textContent = text;
    result.className = `checkin__result ${good ? 'is-ok' : 'is-bad'}`;
  };
  const stop = () => {
    stopped = true;
    clearTimeout(timer);
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  };

  const send = async (token) => {
    busy = true;
    try {
      const r = await fetch(`/api/admin/events/${root.dataset.checkin}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token }),
      });
      const j = await r.json().catch(() => null);
      show(j?.ok ? `✓ ${j.message}` : `✕ ${j?.error || 'Check-in failed.'}`, !!j?.ok);
      navigator.vibrate?.(j?.ok ? 80 : [60, 60, 60]);
    } catch {
      show('✕ No connection. Try again.', false);
    } finally {
      busy = false;
    }
  };

  BarcodeDetector.getSupportedFormats?.()
    .then((formats) => {
      if (!formats.includes('qr_code')) return;
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      scanner.hidden = false;
      fallback.textContent = "Point the camera at the member's code, or use the camera app or the list below.";
      const tick = async () => {
        if (stopped) return;
        if (!busy && video.readyState >= 2) {
          try {
            for (const code of await detector.detect(video)) {
              const m = TOKEN.exec(code.rawValue || '');
              const token = m && (m[1] || m[2]).toLowerCase();
              if (!token) continue;
              if (Date.now() - (seen.get(token) || 0) < 4000) continue;
              seen.set(token, Date.now());
              await send(token);
              break;
            }
          } catch {
            // A frame the detector could not read; the next one usually works.
          }
        }
        timer = setTimeout(tick, 250);
      };
      off.add(
        listen(start, 'click', async () => {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            video.srcObject = stream;
            video.hidden = false;
            start.hidden = true;
            await video.play();
            stopped = false;
            tick();
          } catch {
            show('✕ The camera is blocked. Allow it in the browser, or use the list below.', false);
          }
        }),
      );
    })
    .catch(() => {});

  return () => {
    stop();
    off.flush();
  };
});
