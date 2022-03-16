const toggler = document.getElementsByClassName('caret');

for (let i = 0; i < toggler.length; i += 1) {
  toggler[i].addEventListener('click', function toggle() {
    this.parentElement.querySelector('.nested').classList.toggle('active');
    this.classList.toggle('caret-down');
  });
}
