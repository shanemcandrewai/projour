const toggler = document.getElementsByClassName('caret');

const toggle = (ind) => {
  // console.log(toggler[ind].parentElement.querySelector('.nested').classList);
  toggler[ind].parentElement.querySelector('.nested').classList.toggle('active');
  toggler[ind].classList.toggle('caret-down');
};
for (let i = 0; i < toggler.length; i += 1) {
  toggler[i].addEventListener('click', () => toggle(i));
}

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

const myUL = document.querySelector('#myUL');

const process = async (obj) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const ul = document.createElement('ul');
      ul.textContent = key;
      myUL.append(ul);

      process(obj[key]);
    } else {
      const li = document.createElement('li');
      li.textContent = key;
      myUL.append(li);
    }
  });
};

process(jsn);
