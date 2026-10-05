var form = document.getElementById('add');
var input = document.getElementById('text');
var list = document.getElementById('list');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var value = input.value.trim();
  if (!value) return;
  var li = document.createElement('li');
  var span = document.createElement('span');
  span.textContent = value;
  var button = document.createElement('button');
  button.textContent = '×';
  button.setAttribute('aria-label', 'Delete');
  li.appendChild(span);
  li.appendChild(button);
  list.appendChild(li);
  input.value = '';
  input.focus();
});

list.addEventListener('click', function (e) {
  var target = e.target;
  var li = target.closest('li');
  if (!li) return;
  if (target.tagName === 'SPAN') {
    li.classList.toggle('done');
  } else if (target.tagName === 'BUTTON') {
    li.remove();
  }
});
