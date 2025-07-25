'use strict';

{
  const todos = [
    {title: 'aaa', isCompleted: false},
    {title: 'bbb', isCompleted: false},
    {title: 'ccc', isCompleted: false},
  ];

  const renderTodo = (todo) => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = todo.isCompleted;
    const span = document.createElement('span');
    span.textContent = todo.title;
    const label = document.createElement('label');
    label.appendChild(input);
    label.appendChild(span);
  };

  const renderTodos = () => {
    todos.forEach((todo) => {
      renderTodo(todo);
    });
  };

  renderTodos();
}