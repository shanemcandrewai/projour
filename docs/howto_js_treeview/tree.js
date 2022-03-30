const toggler = document.getElementsByClassName('caret');

const toggle = (ind) => {
  // console.log(toggler[ind].parentElement.querySelector('.nested').classList);
  toggler[ind].parentElement.querySelector('.nested').classList.toggle('active');
  toggler[ind].classList.toggle('caret-down');
};
for (let i = 0; i < toggler.length; i += 1) {
  toggler[i].addEventListener('click', () => toggle(i));
}

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
};

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

const divjsn = document.querySelector('#jsn');
process(jsn, divjsn); */
