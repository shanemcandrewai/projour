const toggler = document.getElementsByClassName('caret');
let i;

for (i = 0; i < toggler.length; i += 1) {
  toggler[i].addEventListener('click', function togclick() {
    this.parentElement.querySelector('.nested').classList.toggle('active');
    this.classList.toggle('caret-down');
  });
}
