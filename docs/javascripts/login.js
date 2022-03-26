const getMessage = async () => {
  try {
    const resp = await fetch('message', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const ret = await resp.json();
    document.getElementById('from').innerHTML = ret.from || '';
    document.getElementById('message').innerHTML = ret.message || '';
  } catch (error) {
    document.getElementById('from').innerHTML = 'Projour';
    document.getElementById('message').innerHTML = error;
  }
};

const loginPost = async (resource = 'login', data = {
  url: document.getElementById('floatingUrl').value,
  user: document.getElementById('floatingUser').value,
  password: document.getElementById('floatingPassword').value,
}) => {
  try {
    const resp = await fetch(resource, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const ret = await resp.json();
    if (Object.keys(ret).length === 0) {
      window.location.replace('/');
    } else {
      document.getElementById('from').innerHTML = ret.from || '';
      document.getElementById('message').innerHTML = ret.message || '';
    }
  } catch (error) {
    document.getElementById('message').innerHTML = error;
  }
};

getMessage();
document.getElementById('butLogin').addEventListener('click', () => loginPost());
