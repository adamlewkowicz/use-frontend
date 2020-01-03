import * as babel from '@babel/core';

const worker = new Worker('', { type: 'module' });

worker.addEventListener('message', (evt) => {
  evt.data
});

onmessage = (event) => {
  if (!event.isTrusted) return;

  const result = babel.transform(event.data);
}


const result = babel.transform('code');

worker.postMessage(result);