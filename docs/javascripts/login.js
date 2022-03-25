const loginPost = async (resource = 'login', data = {
  url: document.getElementById('floatingUrl').value,
  user: document.getElementById('floatingUser').value,
  password: document.getElementById('floatingPassword').value,
}) => {
  document.getElementById('from').innerHTML = document.getElementById('floatingUrl').value;
  try {
    const resp = await fetch(resource, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const ret = await resp.json();
    if (ret.redirect === '/login') {
      document.getElementById('from').innerHTML = ret.from || '';
      document.getElementById('message').innerHTML = ret.error || '';
    } else {
      window.location.replace(ret.redirect);
    }
  } catch (error) {
    document.getElementById('message').innerHTML = error;
  }
};

document.getElementById('butLogin').addEventListener('click', () => loginPost());
