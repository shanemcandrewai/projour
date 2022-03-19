const loginPost = async (url = 'https://httpbin.org/post', data = {
  url: document.getElementById('floatingUrl').value,
  user: document.getElementById('floatingUser').value,

}) => {
  // const data = { username: 'example' };
  try {
    const response = await fetch('https://httpbin.org/post', {
    // const response = await fetch(url, {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const ret = await response.json();
    document.getElementById('message').innerHTML = JSON.stringify(ret.data);
    document.getElementById('from').innerHTML = 'success';
  } catch (error) {
    document.getElementById('message').innerHTML = error;
    document.getElementById('from').innerHTML = 'failed';
  }
};
document.getElementById('demo').addEventListener('click', loginPost);
