'use strict';

{
  let todos;

  if (localStorage.getItem('todos') === null) {
    todos = [
      { id: Date.now() + 1, title: 'ゴミ出し', isCompleted: false },
      { id: Date.now() + 2, title: '洗濯', isCompleted: false },
      { id: Date.now() + 3, title: '皿洗い', isCompleted: false },
    ];
  } else {
    // ローカルストレージにデータがある場合は、それを読み込む
    todos = JSON.parse(localStorage.getItem('todos'));
  }

  const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos));
  };
  
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
    input.addEventListener('change', () => {
      todos.forEach((item) => {
        if (item.id === todo.id) {
          item.isCompleted = !item.isCompleted;
          if (item.isCompleted) {
            li.classList.add('completed'); // 完了したら'completed'クラスを追加
          } else {
            li.classList.remove('completed'); // 未完了なら'completed'クラスを削除
          }
        }
      });
      saveTodos();
    });
    const span = document.createElement('span');
    span.textContent = todo.title;
    const label = document.createElement('label');
    label.appendChild(input);
    label.appendChild(span);
    const button = document.createElement('button');
    button.textContent = '✕';
    button.addEventListener('click', () => {
      // if (confirm('削除しますか？?') === false) {
      if (!confirm('削除しますか？?')) {
          return;
      }
      li.remove();
      todos = todos.filter((item) => {
        return item.id !== todo.id;
      });
      saveTodos();
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
    if (input.value.trim() === '') {
        alert('タスクを入力してください'); // ユーザーにメッセージを表示
        input.focus(); // 入力欄にフォーカスを戻す
        return; // これ以降の処理を実行しない
    }
    const todo = {
      id: Date.now(),
      title: input.value,
      isCompleted: false,
    };
    renderTodo(todo);
    todos.push(todo);
    console.table(todos);
    saveTodos();
    input.value = '';
    input.focus();
  });

  document.querySelector('#purge').addEventListener('click', () => {
    if (!confirm('完了済みのタスクをすべて削除しますか？?')) {
      return;
    }
    todos = todos.filter((todo) => {
      return todo.isCompleted === false;
    });
    saveTodos();
    document.querySelectorAll('#todos li').forEach((li) => {
      li.remove();
    });
        if (todos.length === 0) {
      todos = [
        { id: Date.now() + 1, title: 'ゴミ出し', isCompleted: false },
        { id: Date.now() + 2, title: '洗濯', isCompleted: false },
        { id: Date.now() + 3, title: '皿洗い', isCompleted: false },
      ];
      saveTodos(); // 新しい初期リストをローカルストレージに保存
    }
    renderTodos();
  });

  renderTodos();
}