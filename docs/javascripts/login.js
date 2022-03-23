const getMessages = async (resource = 'messages') => {
  try {
    const response = await fetch(resource, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const ret = await response.json();
    document.getElementById('from').innerHTML = ret.from || '';
    document.getElementById('message').innerHTML = ret.message || '';
  } catch (err) {
    document.getElementById('from').innerHTML = resource;
    document.getElementById('message').innerHTML = err;
  }
};

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
      body: JSON.stringify(data),
    });
    const ret = await response.json();
    document.getElementById('message').innerHTML = ret.message || '';
  } catch (err) {
    document.getElementById('message').innerHTML = err;
  }
};

getMessages();
document.getElementById('butLogin').addEventListener('click', () => loginPost());
