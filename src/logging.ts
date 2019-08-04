import { QSL } from "./datastore/types";

function format(qsl: QSL) {
  let his = (qsl.his_no || '').match(/^([1-5][1-9]{1,2})(\d{2}[K-Nk-n])$/);
  let my = (qsl.my_no || '').match(/^([1-5][1-9]{1,2})(\d{2}[K-Nk-n])$/);
  if(!my || !his) return '';
  return `${(it=>`${it.getFullYear()}-${(it.getMonth() + 1).toString().padStart(2, '0')}-${it.getDate().toString().padStart(2, '0')} \
${it.getHours().toString().padStart(2, '0')}:${it.getMinutes().toString().padStart(2, '0')}`)(qsl.date)} ${qsl.band.frequency} \
${qsl.mode} ${qsl.his} ${his[1]} ${his[2]} ${my[1]} ${my[2]}\n`;
}

export function generateLogSheet(qsls: QSL[]) {
  return 'DATE (JST) TIME BAND MODE CALLSIGN SENTNo RCVDNo\n'+qsls.map(format).join('');
}

export function downloadLogs(qsls: QSL[]) {
  let a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([generateLogSheet(qsls)]));
  a.download = "logsheet.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
