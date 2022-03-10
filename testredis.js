import { createClient } from 'redis';
(async () => {
  const client = createClient({
    url: 'redis://redis-11092.c250.eu-central-1-1.ec2.cloud.redislabs.com:11092',
    username: [user]
    password: [password],
  });
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  await client.set('key1', 'value1');
  const value = await client.get('key1');
  console.log('xxx', value);
  await client.quit();
})();
