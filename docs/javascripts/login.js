const loginPost = async (url = 'login', data = {
  url: document.getElementById('floatingUrl').value,
  user: document.getElementById('floatingUser').value,
  password: document.getElementById('floatingPassword').value,
}) => {
  console.log('xxx');
  document.getElementById('from').innerHTML = document.getElementById('floatingUrl').value;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const ret = await response.json();
    document.getElementById('message').innerHTML = ret;
  } catch (err) {
    document.getElementById('message').innerHTML = err;
  }
};

console.log('xxx1');
document.getElementById('login').addEventListener('click', function loginPost());
