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
treeVars.ul0.setAttribute('is', 'expanding-list');
document.body.append(treeVars.ul0);

const addNode = (parent, level = 1) => {
  Object.entries(parent).forEach((child) => {
    treeVars[`li${level}`] = document.createElement('li');
    treeVars[`li${level}`].append(child[0]);
    treeVars[`ul${level - 1}`].append(treeVars[`li${level}`]);
    if (Object.keys(child[1]).length) {
      treeVars[`ul${level}`] = document.createElement('ul');
      treeVars[`li${level}`].append(treeVars[`ul${level}`]);
      addNode(child[1], level + 1);
    }
  });
};

addNode(jsn);

