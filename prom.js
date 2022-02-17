import Debug from 'debug';

const debug = Debug('app');

function later(delay) {
  return new Promise((resolve, reject) => {
    debug('xxx2');
    setTimeout(resolve(delay), delay);
    // setTimeout(debug('delay'), delay);
    debug('xxx3');
  });
}

async function f1() {
  debug('xxx1');
  const y = await later(1000);
  debug('xxx4');
  debug(y); // 10
  debug('xxx5');
}

f1();
