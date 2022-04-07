import { createClient } from 'redis';
/* eslint no-console: ["error", { allow: ["log"] }] */

const dataOrig = {
  UK: {
    Yorkshire: {
      Leeds: {
        'Train station': {},
        'Town hall': 2,
        Headrow: {},
      },
      Bradford: {},
      Hull: {},
    },
  },
  USA: {
    California: {
      'Los Angeles': {},
      'San Francisco': {},
      Berkeley: {},
    },
    Nevada: {},
    Oregon: {},
  },
};

// save redis
const saveRedis = async (userClient, keyPath = '', data = dataOrig, separator = '|') => {
  const promises = [];
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object' && Object.keys(value).length) {
      promises.push(saveRedis(userClient, `${keyPath}${separator}${key}`, value));
    } else if (typeof value === 'object') {
      promises.push(userClient.hSet('data', `${keyPath}${separator}${key}`));
    } else {
      promises.push(userClient.hSet('data', `${keyPath}${separator}${key}`, value));
    }
  });
  return promises;
};

/* const loadScan = async (key, dataPath = []) => {
  const jsn = {};
  dataPath.push(0);
  while key
  const val = key.split(',').pop();
  if (key === dataPath + val) {
    jsn.key = '';
  }
  return loadScan(key, dataPath);

}; */

const loadRedis = async (userClient, key = 'data', separator = '|') => {
  const jsn = {};
  Object.entries(await userClient.HGETALL(key)).forEach(([field, value]) => {
    let path = '';
    field.split(separator).forEach((pathComp, ind) => {
      if (ind) {
        path += `['${pathComp}']`;
      }
    });
    console.log('xxx', path);
    jsn[path] = {};
  });
  console.log('jsn', jsn);
};

const testRedis = async (userClient) => {
  await userClient.set('key', 'value');
  const promises = [];
  Object.entries({ a: 1, b: { d: 2 }, c: 3 }).forEach(([key, value]) => {
    promises.push(userClient.set(key, value));
  });
  console.log(promises);
  await Promise.all(promises);
  console.log(promises);
};

const userClient = createClient({
  url: process.env.URL_TEST,
  username: process.env.USERNAME_TEST,
  password: process.env.PASSWORD_TEST,
});

try {
  await userClient.connect();

  const hkeys = await userClient.HKEYS('data');
  console.log('Deleted: ', await userClient.HDEL('data', hkeys));
  await Promise.all(await saveRedis(userClient));

  // console.log('hkeys', hkeys);
  console.log(await userClient.HGETALL('data'));
  // await loadRedis(userClient);
  await userClient.quit();
} catch (error) {
  console.log(error.toString());
}
