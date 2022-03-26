const toggler = document.getElementsByClassName('caret');

const tt = function toggle() {
  console.log(this);
  console.log(typeof this);
  this.parentElement.querySelector('.nested').classList.toggle('active');
  this.classList.toggle('caret-down');
}

for (let i = 0; i < toggler.length; i += 1) {
  toggler[i].addEventListener('click', tt);
}