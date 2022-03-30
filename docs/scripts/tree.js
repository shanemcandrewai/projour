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

treeVars.h1 = document.createElement('h1');
treeVars.h1.append('Dynamic ML list');
document.body.append(treeVars.h1);

treeVars.ul0 = document.createElement('ul');
document.body.append(treeVars.ul0);

const addNode = (parent, level = 1) => {
  Object.entries(parent).forEach((child) => {
    treeVars[`li${level}`] = document.createElement('li');
    treeVars[`ul${level - 1}`].append(treeVars[`li${level}`]);
    if (Object.keys(child[1]).length) {
      treeVars[`span${level}`] = document.createElement('span');
      treeVars[`span${level}`].classList.add('caret');
      treeVars[`span${level}`].append(child[0]);
      treeVars[`li${level}`].append(treeVars[`span${level}`]);
      treeVars[`ul${level}`] = document.createElement('ul');
      treeVars[`ul${level}`].classList.add('nested');
      treeVars[`li${level}`].append(treeVars[`ul${level}`]);
      addNode(child[1], level + 1);
    } else {
      treeVars[`li${level}`].append(child[0]);
    }
  });
};

addNode(jsn);

const toggler = document.getElementsByClassName('caret');
const toggle = (ind) => {
  toggler[ind].parentElement.querySelector('.nested').classList.toggle('active');
  toggler[ind].classList.toggle('caret-down');
};
for (let i = 0; i < toggler.length; i += 1) {
  toggler[i].addEventListener('click', () => toggle(i));
}
