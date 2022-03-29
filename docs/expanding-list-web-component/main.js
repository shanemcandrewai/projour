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

treeVars.ul1 = document.createElement('ul');
treeVars.ul1.setAttribute('is', 'expanding-list');
document.body.append(treeVars.ul1);

treeVars.li1 = document.createElement('li');
treeVars.li1.append('UK');
treeVars.ul1.append(treeVars.li1);

treeVars.ul2 = document.createElement('ul');
treeVars.li2 = document.createElement('li');
treeVars.li2.append('Yorkshire');
treeVars.ul2.append(treeVars.li2);
treeVars.li1.append(treeVars.ul2);

treeVars.ul3 = document.createElement('ul');
treeVars.li3 = document.createElement('li');
treeVars.li3.append('Leeds');
treeVars.ul3.append(treeVars.li3);
treeVars.li2.append(treeVars.ul3);

treeVars.ul4 = document.createElement('ul');
treeVars.li4 = document.createElement('li');
treeVars.li4.append('Train station');
treeVars.ul4.append(treeVars.li4);
treeVars.li3.append(treeVars.ul4);

treeVars.ul4 = document.createElement('ul');
treeVars.li4 = document.createElement('li');
treeVars.li4.append('Town hall');
treeVars.ul4.append(treeVars.li4);
treeVars.li3.append(treeVars.ul4);

treeVars.ul4 = document.createElement('ul');
treeVars.li4 = document.createElement('li');
treeVars.li4.append('Headrow');
treeVars.ul4.append(treeVars.li4);
treeVars.li3.append(treeVars.ul4);

treeVars.ul3 = document.createElement('ul');
treeVars.li3 = document.createElement('li');
treeVars.li3.append('Bradford');
treeVars.ul3.append(treeVars.li3);
treeVars.li2.append(treeVars.ul3);

const addNode = (text, level) => {
  treeVars[`ul${level}`] = document.createElement('ul');
  treeVars[`li${level}`] = document.createElement('li');
  treeVars[`li${level}`].append(text);
  treeVars[`ul${level}`].append(treeVars[`li${level}`]);
  treeVars[`li${level - 1}`].append(treeVars[`ul${level}`]);
};

addNode('Hull', 3);
addNode('USA', 2);
