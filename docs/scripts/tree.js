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

const treeVars = {};
const mllist = document.getElementById('ml-list');
treeVars.ul0 = document.createElement('ul');
mllist.append(treeVars.ul0);

const addNodes = (parent, level = 1) => {
  Object.entries(parent).forEach((child) => {
    treeVars[`li${level}`] = document.createElement('li');
    treeVars[`li${level}`].append(child[0]);
    treeVars[`ul${level - 1}`].append(treeVars[`li${level}`]);
    if (Object.keys(child[1]).length) {
      treeVars[`li${level}`].classList.add('caret');
      treeVars[`ul${level}`] = document.createElement('ul');
      treeVars[`ul${level}`].classList.add('closed');
      treeVars[`li${level}`].append(treeVars[`ul${level}`]);
      addNodes(child[1], level + 1);
    }
  });
};

addNodes(jsn);

const toggle = (event, elem) => {
  elem.querySelector('UL').classList.toggle('open');
  elem.classList.toggle('caret-down');
  event.stopPropagation();
};

Array.from(document.getElementsByClassName('caret')).forEach((elem) => elem.addEventListener('click', (ev) => toggle(ev, elem)));
