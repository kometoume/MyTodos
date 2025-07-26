"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

{
  const firebaseConfig = {
    apiKey: "AIzaSyDtV8y7SvqNcpovVTRtftzUs5aaLU414fA",
    authDomain: "mytodoapp-6734f.firebaseapp.com",
    projectId: "mytodoapp-6734f",
    storageBucket: "mytodoapp-6734f.firebasestorage.app",
    messagingSenderId: "686046226256",
    appId: "1:686046226256:web:3dfed56077c4bf5ea82e55"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const todosColRef = collection(db, 'todos');

  let todos = [];

  const renderTodo = (todo) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = todo.isCompleted;
    input.addEventListener("change", async () => {
      const todoDocRef = doc(db, 'todos', todo.id);
      const newCompletedStatus = !todo.isCompleted;

      try {
        await updateDoc(todoDocRef, {
          isCompleted: newCompletedStatus
        });

        todos.forEach((item) => {
          if (item.id === todo.id) {
            item.isCompleted = newCompletedStatus;
          }
        });

        if (newCompletedStatus) {
          li.classList.add("completed");
        } else {
          li.classList.remove("completed");
        }
      } catch (error) {
        console.error("Todoの更新中にエラーが発生しました: ", error);
        alert("タスクの更新に失敗しました。");
      }
    });

    const span = document.createElement("span");
    span.textContent = todo.title;

    const label = document.createElement("label");
    label.appendChild(input);
    label.appendChild(span);

    const button = document.createElement("button");
    button.textContent = "✕";
    button.addEventListener("click", async () => {
      if (!confirm("削除しますか？")) {
        return;
      }

      const todoDocRef = doc(db, 'todos', todo.id);

      try {
        await deleteDoc(todoDocRef);

        li.remove();

        todos = todos.filter((item) => {
          return item.id !== todo.id;
        });

        if (todos.length === 0) {
          await addDefaultTodos();
        }
        renderTodos();
      } catch (error) {
        console.error("Todoの削除中にエラーが発生しました: ", error);
        alert("タスクの削除に失敗しました。");
      }
    });

    const li = document.createElement("li");
    if (todo.isCompleted) {
      li.classList.add("completed");
    }
    li.appendChild(label);
    li.appendChild(button);
    document.querySelector("#todos").appendChild(li);
  };

  const addDefaultTodos = async () => {
    const defaultTodos = [
      { title: "ゴミ出し", isCompleted: false },
      { title: "洗濯", isCompleted: false },
      { title: "皿洗い", isCompleted: false },
    ];
    for (const item of defaultTodos) {
      const newDocRef = await addDoc(todosColRef, {
        ...item,
        createdAt: serverTimestamp()
      });
      todos.push({ id: newDocRef.id, ...item });
    }
  };

  const renderTodos = async () => {
    document.querySelector("#todos").innerHTML = "";

    try {
      const q = query(todosColRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);

      todos = [];
      querySnapshot.forEach((doc) => {
        todos.push({ id: doc.id, ...doc.data() });
      });

      if (todos.length === 0) {
        await addDefaultTodos();
      }

      todos.forEach((todo) => {
        renderTodo(todo);
      });
    } catch (error) {
      console.error("Todoリストの読み込み中にエラーが発生しました: ", error);
      alert("タスクの読み込みに失敗しました。ネットワーク接続を確認してください。");
    }
  };

  document.querySelector("#add-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.querySelector("#new-todo-title");
    if (input.value.trim() === "") {
      alert("タスクを入力してください");
      input.focus();
      return;
    }

    const newTodo = {
      title: input.value,
      isCompleted: false,
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(todosColRef, newTodo);
      
      todos.push({ id: docRef.id, ...newTodo });
      renderTodo({ id: docRef.id, ...newTodo });

      input.value = "";
      input.focus();
    } catch (error) {
      console.error("Todoの追加中にエラーが発生しました: ", error);
      alert("タスクの追加に失敗しました。");
    }
  });

  document.querySelector("#purge").addEventListener("click", async () => {
    if (!confirm("完了済みのタスクをすべて削除しますか？")) {
      return;
    }

    const completedTodos = todos.filter(todo => todo.isCompleted);

    try {
      for (const todo of completedTodos) {
        const todoDocRef = doc(db, 'todos', todo.id);
        await deleteDoc(todoDocRef);
      }

      todos = todos.filter((todo) => {
        return todo.isCompleted === false;
      });

      if (todos.length === 0) {
        await addDefaultTodos();
      }
      renderTodos();

    } catch (error) {
      console.error("完了済みTodoの一括削除中にエラーが発生しました: ", error);
      alert("完了済みタスクの削除に失敗しました。");
    }
  });

  document.addEventListener("DOMContentLoaded", renderTodos);
}