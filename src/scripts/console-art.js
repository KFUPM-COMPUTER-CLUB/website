/* The club mark in the browser console, with the first clue of the site challenge.
 * Printed once per tab session (module scripts run once per visit; the storage guard covers reloads). */
const KEY = 'cc_console_art';
const ART = [
  ' ██████╗ ██████╗',
  '██╔════╝██╔════╝',
  '██║     ██║',
  '██║     ██║',
  '╚██████╗╚██████╗',
  ' ╚═════╝ ╚═════╝',
  'KFUPM COMPUTER CLUB',
].join('\n');

let seen = false;
try {
  seen = sessionStorage.getItem(KEY) === '1';
  sessionStorage.setItem(KEY, '1');
} catch {
  /* storage blocked: print anyway */
}
if (!seen) {
  console.log(
    `%c${ART}`,
    'color:#3B82F6; font-family: ui-monospace, Menlo, Consolas, monospace; font-weight:700; line-height:1.2',
  );
  console.log('clue 1/3: view the page source. There is a note for you near the end.');
}
