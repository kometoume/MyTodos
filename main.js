'use strict';

{
  let todos;

  if (localStorage.getItem('todos') === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem('todos'));
  }
  
  const renderTodo = (todo) => {
    /*
    - li
      - label
        - input
        - span
      - button
    */
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = todo.isCompleted;
    const span = document.createElement('span');
    span.textContent = todo.title;
    const label = document.createElement('label');
    label.appendChild(input);
    label.appendChild(span);
    const button = document.createElement('button');
    button.textContent = 'x';
    button.addEventListener('click', () => {
      // if (confirm('Sure?') === false) {
      if (!confirm('Sure?')) {
          return;
      }
      li.remove();
    });
    const li = document.createElement('li');
    li.appendChild(label);
    li.appendChild(button);
    document.querySelector('#todos').appendChild(li);
  };

  const renderTodos = () => {
    todos.forEach((todo) => {
      renderTodo(todo);
    });
  };

  document.querySelector('#add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('#add-form input');
    const todo = {
      title: input.value,
      isCompleted: false,
    };
    renderTodo(todo);
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
    input.value = '';
    input.focus();
  });

  renderTodos();
}