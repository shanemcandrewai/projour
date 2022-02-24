// Example POST method implementation:
/* eslint-disable no-console */
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

postData('https://content.dropboxapi.com/2/files/upload', { answer: 42 })
  .then((data) => {
    console.log(data); // JSON data parsed by `data.json()` call
  });
