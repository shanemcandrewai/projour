import { createClient } from 'redis';
/* eslint no-console: ["error", { allow: ["log"] }] */

const dataOrig = {
  UK: {
    Yorkshire: {
      Leeds: {
        'Train station': {},
        'Town hall': {},
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
const saveRedis = async (userClient, dataPath = [], data = dataOrig) => {
  const promises = [];
  dataPath.push(0);
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object' && Object.keys(value).length) {
      promises.push(userClient.hSet('data', `${dataPath},${key}`));
      console.log('xo', `${dataPath},${key}`);
      promises.push(saveRedis(userClient, dataPath, value));
      dataPath.push(dataPath.pop() + 1);
    } else {
      promises.push(userClient.hSet('data', `${dataPath},${key}`, value));
      console.log('xp', `${dataPath},${key}`, value);
    }
  });
  dataPath.pop();
  return promises;
};

const loadRedis = async (userClient) => {
  console.log(await userClient.HSCAN('data', 0));
};

const testRedis = async (userClient) => {
  await userClient.set('key', 'value');
  const promises = [];
  Object.entries({ a: 1, b: { d: 2 }, c: 3 }).forEach(([key, value]) => {
    console.log('xxx');
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
  await userClient.HDEL('data', 'UK');
  await Promise.all(await saveRedis(userClient));
  console.log('yyy');
  await loadRedis(userClient);
  await userClient.quit();
} catch (error) {
  console.log(error.toString());
}
