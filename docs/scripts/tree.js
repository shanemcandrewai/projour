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

const addNode = (parent, level = 1) => {
  Object.entries(parent).forEach((child) => {
    treeVars[`li${level}`] = document.createElement('li');
    treeVars[`li${level}`].append(child[0]);
    treeVars[`ul${level - 1}`].append(treeVars[`li${level}`]);
    if (Object.keys(child[1]).length) {
      /*       treeVars[`span${level}`] = document.createElement('span');
      treeVars[`span${level}`].classList.add('caret');
      treeVars[`span${level}`].append(child[0]);
      treeVars[`li${level}`].append(treeVars[`span${level}`]); */
      treeVars[`li${level}`].classList.add('caret');
      treeVars[`ul${level}`] = document.createElement('ul');
      treeVars[`ul${level}`].classList.add('closed');
      treeVars[`li${level}`].append(treeVars[`ul${level}`]);
      addNode(child[1], level + 1);
    }
  });
};

addNode(jsn);

const toggler = document.getElementsByClassName('caret');
const toggle = (ind) => {
  console.log(ind, toggler[ind].querySelector('UL'));
  toggler[ind].querySelector('UL').classList.toggle('open');
  toggler[ind].classList.toggle('caret-down');
};
for (let i = 0; i < toggler.length; i += 1) {
  toggler[i].addEventListener('click', () => toggle(i));
}

// const dropdownMacos = document.getElementById('dropdownMacos');
// dropdownMacos.addEventListener('click', () => console.log('dropdownMacos.setAttribute'));
