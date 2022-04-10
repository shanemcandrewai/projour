const jsn = {
  UK: {
    Yorkshire: {
      Leeds: {
        'Train station': {},
        'Town hall': {},
        Headrow: {},
      },
      Bradford: {},
      Hull: {},
    },
  },
  USA: {
    California: {
      'Los Angeles': {},
      'San Francisco': {},
      Berkeley: {},
    },
    Nevada: {},
    Oregon: {},
  },
};

let treeVars = {};
const mllist = document.getElementById('ml-list');
treeVars.ul0 = document.createElement('ul');
mllist.append(treeVars.ul0);

const addNodes = (parent, level = 1) => {
  Object.entries(parent).forEach(([key, value]) => {
    treeVars[`li${level}`] = document.createElement('li');
    treeVars[`li${level}`].append(key);
    treeVars[`ul${level - 1}`].append(treeVars[`li${level}`]);
    if (typeof value === 'object' && Object.keys(value).length) {
      treeVars[`li${level}`].classList.add('caret');
      treeVars[`ul${level}`] = document.createElement('ul');
      treeVars[`ul${level}`].classList.add('nested');
      treeVars[`li${level}`].append(treeVars[`ul${level}`]);
      addNodes(value, level + 1);
    }
  });
};

addNodes(jsn);

const toggle = (event, elem) => {
  elem.querySelector('UL').classList.toggle('open');
  elem.classList.toggle('caret-down');
  event.stopPropagation();
};

Array.from(document.getElementsByClassName('caret')).forEach((elem) => elem.addEventListener('click', (event) => toggle(event, elem)));

const save = async (resource = 'save', data = jsn) => {
  try {
    const resp = await fetch(resource, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    const ret = await resp.json();
    document.getElementById('from').innerHTML = ret.from || '';
    document.getElementById('message').innerHTML = ret.message || '';
  } catch (error) {
    document.getElementById('from').innerHTML = 'tree.js';
    document.getElementById('message').innerHTML = error;
  }
};

document.getElementById('butSave').addEventListener('click', () => save());

const load = async (resource = 'load') => {
  try {
    const resp = await fetch(resource, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const ret = await resp.json();
    treeVars = {};
    while (mllist.firstChild) {
      mllist.removeChild(mllist.lastChild);
    }
    treeVars.ul0 = document.createElement('ul');
    mllist.append(treeVars.ul0);
    addNodes(ret);
  } catch (error) {
    document.getElementById('from').innerHTML = 'tree.js';
    document.getElementById('message').innerHTML = error;
  }
};

document.getElementById('butLoad').addEventListener('click', () => load());
