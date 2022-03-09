import { createClient } from 'redis';
(async () => {
  const client = createClient({
    url: 'redis://redis-11092.c250.eu-central-1-1.ec2.cloud.redislabs.com:11092',
    username: 'admin',
    password: 'k3.rXxv4',
  });
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  await client.set('key', 'value');
  const value = await client.get('key');
  await client.quit();
})();
