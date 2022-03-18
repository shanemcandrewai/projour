const data = { username: 'example' };

fetch('https://httpbin.org/post', {
  method: 'POST', // or 'PUT'
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
  .then((response) => response.json())
  .then((ret) => {
    document.getElementById('message').innerHTML = JSON.stringify(ret.data);
  // console.log('Success:', data);
  })
  .catch((error) => {
    document.getElementById('message').innerHTML = error;
  // console.error('Error:', error);
  });
