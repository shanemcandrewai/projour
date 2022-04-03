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
const saveRedis = async (userClient, data, dataPath = []) => {
  dataPath.push(0);
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object' && Object.keys(value).length) {
      saveRedis(value, dataPath);
      dataPath.push(dataPath.pop() + 1);
    } else {
      userClient.hSet(`data.${dataPath}`, key, value);
    }
  });
};

const loadRedis = async (userClient, data = [], dataPath = []) => {
  dataPath.push(0);
  while (userClient.EXISTS(`data.${dataPath}`)) {
    data.push(userClient.HGETALL(`data.${dataPath}`));
    dataPath.push(dataPath.pop() + 1);
  }
};

const userClient = createClient({
  url: process.env.URL,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
});
try {
  await userClient.connect();
  await saveRedis(userClient, dataOrig);
} catch (error) {
  console.log(error.toString());
}
