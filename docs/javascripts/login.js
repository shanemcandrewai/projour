const getError = async (resource = 'error') => {
  try {
    const response = await fetch(resource, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const ret = await response.json();
    document.getElementById('from').innerHTML = ret.from || '';
    document.getElementById('message').innerHTML = ret.error || '';
  } catch (error) {
    document.getElementById('from').innerHTML = resource;
    document.getElementById('message').innerHTML = error;
  }
};

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
    // document.getElementById('message').innerHTML = resp.url;
    window.location.replace(resp.url);
  } catch (error) {
    document.getElementById('message').innerHTML = error;
  }
};

getError();
document.getElementById('butLogin').addEventListener('click', () => loginPost());
