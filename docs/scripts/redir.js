/* eslint-disable no-console */

// get <AUTHORIZATION_CODE from url
// make query string for https://api.dropbox.com/oauth2/token
// fetch post to retrieve access_token

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      // 'Content-Type': 'application/json',
      'Content-Type': 'application/octet-stream',
      Authorization: 'Bearer sl.BCreLYbKQE3elibcos2ZyDIWqHihTvwFTgC7qAbHptpfV1wtQmXl31jRyPDCZzbzeHibS1ykqQGsP9d85uNTavJba2QX76O-aMGXLW2VVfzMPhCoAAOO1XwZ6VuhU5ChUIpYuzmJ',
      'Dropbox-API-Arg': '{"path":"/tf.txt"}',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

async function getToken(url, app) {
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(app), // body data type must match
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
// postData('https://content.dropboxapi.com/2/files/upload', { answer: 42 })
// .then((data) => {
// console.log(data); // JSON data parsed by `data.json()` call
// });

const params = new URLSearchParams(window.location.search);
console.log('xxx', params.get('code'));
getToken(
  'https://api.dropboxapi.com/oauth2/token',
  {
    code: params.get('code'),
    grant_type: 'authorization_code',
    client_id: 'qz0krgp7dd3kom6',
    client_secret: '94ubpfvyp2dvoye',
    redirect_uri: 'http://localhost:3000/redir.html',
  },
)
  .then((data) => {
    console.log(data); // JSON data parsed by `data.json()` call
  });
