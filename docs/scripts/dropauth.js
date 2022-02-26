// Example POST method implementation:
/* eslint-disable no-console */

const getCode = async (url) => {
  try {
    const response = await fetch(url, { mode: 'no-cors' });
    console.log(response);
  } catch (err) {
    console.log(err);
  }
};

getCode('https://www.dropbox.com/oauth2/authorize?client_id=qz0krgp7dd3kom6&response_type=code');
