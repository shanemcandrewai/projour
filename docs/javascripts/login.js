const loginPost = async (resource = 'login', data = {
  url: document.getElementById('floatingUrl').value,
  user: document.getElementById('floatingUser').value,
  password: document.getElementById('floatingPassword').value,
}) => {
  document.getElementById('from').innerHTML = document.getElementById('floatingUrl').value;
  try {
    const response = await fetch(resource, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // redirect: 'error',
      body: JSON.stringify(data),
    });
    const ret = await response.json();
    // document.getElementById('message').innerHTML = JSON.stringify(ret) || '';
    window.location.replace(response.url);
  } catch (err) {
    document.getElementById('message').innerHTML = err;
  }
};

document.getElementById('butLogin').addEventListener('click', () => loginPost());
