const fetchAsync = async () => {
  const url = 'https://httpbin.org/post';
  const data = { node1: 'val1', node2: 'val2' };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const ret = await response.json();
    document.getElementById('status').innerHTML = 'success';
    document.getElementById('return').innerHTML = ret.data;
  } catch (error) {
    document.getElementById('status').innerHTML = 'failed';
    document.getElementById('return').innerHTML = error;
  }
};

const fetchAsyncDefault = async (
  url = 'https://httpbin.org/post',
  data = { node1: 'val1', node2: 'val2' },
) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const ret = await response.json();
    document.getElementById('status').innerHTML = 'success';
    document.getElementById('return').innerHTML = ret.data;
  } catch (error) {
    document.getElementById('status').innerHTML = 'failed';
    document.getElementById('return').innerHTML = error;
  }
};

document.getElementById('fetchAsync').addEventListener('click', fetchAsync);
document.getElementById('fetchAsyncDefault').addEventListener('click', () => fetchAsyncDefault());
