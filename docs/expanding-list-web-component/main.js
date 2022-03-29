// Create a class for the element
class ExpandingList extends HTMLUListElement {
  constructor() {
    // Always call super first in constructor
    // Return value from super() is a reference to this element
    const self = super();

    // Get ul and li elements that are a child of this custom ul element
    // li elements can be containers if they have uls within them
    const uls = Array.from(self.querySelectorAll('ul'));
    const lis = Array.from(self.querySelectorAll('li'));

    // Hide all child uls
    // These lists will be shown when the user clicks a higher level container
    uls.forEach((ul) => {
      ul.style.setProperty('display', 'none');
      // ul.style.display = 'none';
    });

    // self.querySelectorAll('ul').style.display = 'none';

    // Look through each li element in the ul
    lis.forEach((li) => {
      // If this li has a ul as a child, decorate it and add a click handler
      if (li.querySelectorAll('ul').length > 0) {
        // Add an attribute which can be used  by the style
        // to show an open or closed icon
        li.setAttribute('class', 'closed');

        // Wrap the li element's text in a new span element
        // so we can assign style and event handlers to the span
        const childText = li.childNodes[0];
        const newSpan = document.createElement('span');

        // Copy text from li to span, set cursor style
        newSpan.textContent = childText.textContent;
        newSpan.style.cursor = 'pointer';

        // Add click handler to this span
        newSpan.onclick = self.showul;

        // Add the span and remove the bare text node from the li
        childText.parentNode.insertBefore(newSpan, childText);
        childText.parentNode.removeChild(childText);
      }
    });
  }

  // li click handler
  showul = (e) => {
    // next sibling to the span should be the ul
    this.nextul = e.target.nextElementSibling;

    // Toggle visible state and update class attribute on ul
    if (this.nextul.style.display === 'block') {
      this.nextul.style.display = 'none';
      this.nextul.parentNode.setAttribute('class', 'closed');
    } else {
      this.nextul.style.display = 'block';
      this.nextul.parentNode.setAttribute('class', 'open');
    }
  };
}

// Define the new element
customElements.define('expanding-list', ExpandingList, { extends: 'ul' });

/* const jsn = {
  Beverages: {
    Water: {},
    Coffee: {},
    Tea: {
      'Black Tea': {},
      'White Tea': {},
      'Green Tea': {
        Sencha: {},
        Gyokuro: {},
        Matcha: {},
        'Pi Lo Chun': {},
      },
    },
  },
}; */

/*
const process = async (obj, elem) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      console.log(typeof elem);
      const li = elem.createElement('li');
      li.classList.add('caret');
      li.textContent = obj[key];
      elem.append(li);
      const ul = elem.createElement('ul');
      ul.classList.add('nested');
      elem.append(ul);
      process(obj[key], ul);
    } else {
      const li = elem.createElement('li');
      li.textContent = obj[key];
      elem.append(li);
    }
  });
};
 */

/* eslint no-param-reassign: ["error", { "props": false }] */
// const expl = document.querySelector('#expl');
// const jsnl = {};
// toJSON(expl, jsnl);

const toJSON = async (elem, path) => {
  for (let i = 0; i < elem.childNodes.length; i += 1) {
    path.push(i);
    if (elem.childNodes[i].nodeType === 3 && elem.childNodes[i].textContent[0] !== '\n') {
      // path.pop();
      // path.push([i, elem.childNodes[i].textContent]);
      console.log('childNodes', path, elem.childNodes[i]);
    }
    toJSON(elem.childNodes[i], path);
    path.pop();
  }
  return 1;
};

const jsn = toJSON(document.getElementById('expl'), []);

/* function eachNode(rootNode, callback) {
  if (!callback) {
    const nodes = [];
    eachNode(rootNode, (node) => {
      nodes.push(node);
    });
    return nodes;
  }

  if (callback(rootNode) === false) {
    return false;
  }

  if (rootNode.hasChildNodes()) {
    const nodes = rootNode.childNodes;
    for (let i = 0, l = nodes.length; i < l; i += 1) {
      if (eachNode(nodes[i], callback) === false) {
        return undefined;
      }
    }
  }
  return undefined;
}

console.log(eachNode(document.getElementById('expl'))); */
