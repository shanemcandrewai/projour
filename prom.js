import Debug from 'debug';

const debug = Debug('app');

function later(delay) {
  return new Promise((resolve) => {
    setTimeout({resolve(delay)}, delay);
  });
}

async function f1() {
  const y = await later(10000);
  debug(y); // 10
}

f1();
