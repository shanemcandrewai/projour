// Example POST method implementation:
/* eslint-disable no-console */

const encodeQueryData = (data) => {
  const ret = [];
  Object.keys(data).forEach((d) => ret.push(`${encodeURIComponent(d)}=${encodeURIComponent(data[d])}`));
  return ret.join('&');
};

const getCode = async (url) => {
  const params = {
    client_id: 'qz0krgp7dd3kom6',
    response_type: 'code',
    redirect_uri: 'http://localhost:3000/redir.html',
  };

  window.location.replace(url + encodeQueryData(params));
  // try {
  // const response = await fetch(url, { mode: 'cors' });
  // console.log('xxx', response);
  // } catch (err) {
  // console.log(err);
  // }
};

getCode('https://www.dropbox.com/oauth2/authorize?');
