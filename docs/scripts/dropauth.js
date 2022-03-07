// Example POST method implementation:
/* eslint-disable no-console */

const encodeQueryData = (data) => {
  const ret = [];
  Object.keys(data).forEach((d) => ret.push(`${encodeURIComponent(d)}=${encodeURIComponent(data[d])}`));
  return ret.join('&');
};

const getCode = async (url) => {
  // const rand = (Math.random() + 1).toString(36).substring(2);
  const rand = 'dasfljf433dasfljf433dasfljf433dasfljf433dasfljf433';
  const msgUint8 = new TextEncoder().encode(rand);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashHex = 'dhMhX1tsGrstwVVsMeWJfWe5Sfvt7rPg7JCG-sKUdU0';

  const params = {
    client_id: '2p3gyy8gc50oe4s',
    response_type: 'code',
    redirect_uri: 'http://localhost:3000/redir.html',
    code_challenge: hashHex,
    code_challenge_method: 'S256',
  };
  // console.log('xxx code_challenge', params.code_challenge);
  window.location.replace(url + encodeQueryData(params));
  // try {
  // const response = await fetch(url, { mode: 'cors' });
  // console.log('xxx', response);
  // } catch (err) {
  // console.log(err);
  // }
};

getCode('https://www.dropbox.com/oauth2/authorize?');
