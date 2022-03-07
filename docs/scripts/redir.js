/* eslint-disable no-console */

// get <AUTHORIZATION_CODE from url
// make query string for https://api.dropbox.com/oauth2/token
// fetch post to retrieve access_token

const getToken = async (params, url = 'https://api.dropboxapi.com/oauth2/token') => {
  try {
    const fetchResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });
    // console.log('fetchResp', fetchResp);
    return fetchResp.json();
  } catch (err) {
    console.log('xxx1');
    console.log(err);
  }
  return 'getToken error';
};

const upload = async (token, data, url = 'https://content.dropboxapi.com/2/files/upload') => {
  try {
    const fetchResp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': '{"path":"/tf.txt"}',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return fetchResp.json();
  } catch (err) {
    console.log('xxx2');
    console.log(err);
  }
  return 'upload error';
};

const test = async () => {
  try {
    const tokenResp = await getToken(
      {
        code: new URLSearchParams(window.location.search).get('code'),
        grant_type: 'authorization_code',
        client_id: '2p3gyy8gc50oe4s',
        code_verifier: 'dasfljf433dasfljf433dasfljf433dasfljf433dasfljf433',
        redirect_uri: 'http://localhost:3000/redir.html',
      },
    );
    console.log('tokenResp', tokenResp);
    return await upload(tokenResp.access_token, { answer: 42 });
  } catch (err) {
    console.log('xxx3');
    console.log(err);
  }
  return 'test error';
};

console.log(test());
