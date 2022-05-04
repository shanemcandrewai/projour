const jsn = [
  {
    row: 0,
    'rec-0': {
      date: 20220121,
      tags: ['val-0'],
    },
    'rec-1': {
      date: 20220116,
      url: 'https://example.com/a',
    },
  },
  {
    row: 1,
    'rec-0': {
      date: 20220116,
      url: 'https://example.com/b',
    },
    'rec-1': {
      tags: ['val-0', 'val-1'],
    },
  },
];

const toggle = (event, elem) => {
  elem.querySelector('UL').style.display = 'none';
  elem.classList.toggle('caret-down');
  event.stopPropagation();
};

const addNodes = (parent, fragm) => {
  const ul = document.createElement('ul');
  fragm.appendChild(ul);
  Object.entries(parent).reduce((acc, [key, value]) => {
    const li = document.createElement('li');
    li.textContent = key;
    ul.appendChild(li);
    if (typeof value === 'object' && Object.keys(value).length) {
      li.classList.add('caret');
      li.addEventListener('click', (event) => toggle(event, li));
      return addNodes(value, li);
    }
    li.textContent += `: ${value}`;
    return acc;
  }, fragm);
  return fragm;
};

const list = document.querySelector('#ml-list');
const frag = addNodes(jsn, new DocumentFragment());

/* const cn = frag.children;
for (let i = 0, len = cn.length; i < len; i += 1) {
  console.log(cn[i]);
} */

list.appendChild(frag);
