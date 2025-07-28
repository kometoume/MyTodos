"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

{
  const firebaseConfig = {
    apiKey: "AIzaSyDtV8y7SvqNcpovVTRtftzUs5aaLU414fA",
    authDomain: "mytodoapp-6734f.firebaseapp.com",
    projectId: "mytodoapp-6734f",
    storageBucket: "mytodoapp-6734f.firebasestorage.app",
    messagingSenderId: "686046226256",
    appId: "1:686046226256:web:3dfed56077c4bf5ea82e55",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  const authSection = document.getElementById('auth-section');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('login-button');
  const signupButton = document.getElementById('signup-button');
  const anonymousLoginButton = document.getElementById('anonymous-login-button');
  const logoutButton = document.getElementById('logout-button');
  const todoContainer = document.querySelector('.container');
  const todosUl = document.querySelector("#todos");
  const addForm = document.querySelector("#add-form");
  const newTodoTitleInput = document.querySelector("#new-todo-title");

  const customAlert = document.getElementById('custom-alert');
  const customAlertMessage = document.getElementById('custom-alert-message');
  const customAlertCloseButton = document.getElementById('custom-alert-close');
  const userEmailSpan = document.getElementById('user-email');

  let todos = [];
  let todosColRef;

  const showCustomAlert = (message) => {
    customAlertMessage.textContent = message;
    customAlert.style.display = 'flex';
  };

  customAlertCloseButton.addEventListener('click', () => {
    customAlert.style.display = 'none';
  });

  signupButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      showCustomAlert('メールアドレスとパスワードを入力してください。');
      return;
    }
    if (password.length < 6) {
      showCustomAlert('パスワードは6文字以上で入力してください。');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showCustomAlert('新規登録しました！');
      emailInput.value = '';
      passwordInput.value = '';
    } catch (error) {
      console.error("新規登録エラー:", error.code, error.message);
      let errorMessage = "新規登録に失敗しました。";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスはすでに使用されています。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです。';
      }
      showCustomAlert(errorMessage);
    }
  });

  loginButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      showCustomAlert('メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showCustomAlert('ログインしました！');
      emailInput.value = '';
      passwordInput.value = '';
    } catch (error) {
      console.error("ログインエラー:", error.code, error.message);
      let errorMessage = "ログインに失敗しました。";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'メールアドレスまたはパスワードが間違っています。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです。';
      }
      showCustomAlert(errorMessage);
    }
  });

  anonymousLoginButton.addEventListener('click', async () => {
    try {
      await signInAnonymously(auth);
      showCustomAlert('ゲストとしてログインしました！');
    } catch (error) {
      console.error("ゲストログインエラー:", error.code, error.message);
      showCustomAlert(`ゲストログインに失敗しました: ${error.message}`);
    }
  });

  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showCustomAlert('ログアウトしました！');
    } catch (error) {
      console.error("ログアウトエラー:", error.code, error.message);
      showCustomAlert(`ログアウトに失敗しました: ${error.message}`);
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Logged in:", user.uid);
      todosColRef = collection(db, 'users', user.uid, 'todos');

      const userDocRef = doc(db, 'users', user.uid);

      try {
        await setDoc(userDocRef, {
          email: user.email || '匿名ユーザー',
          lastLogin: serverTimestamp()
        }, { merge: true });
        console.log("ユーザー情報がFirestoreに保存されました。");
      } catch (error) {
        console.error("ユーザー情報の保存中にエラーが発生しました:", error);
      }
    
      authSection.style.display = 'none';
      logoutButton.style.display = 'block';
      todoContainer.style.display = 'block';
      userEmailSpan.textContent = user.email || 'ゲストユーザー';

      await renderTodos();
    } else {
      console.log("Logged out");
      authSection.style.display = 'block';
      logoutButton.style.display = 'none';
      todoContainer.style.display = 'none';
      userEmailSpan.textContent = '';

      todosColRef = null;
      todos = [];
      todosUl.innerHTML = "";
    }
  });

  const renderTodo = (todo) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = todo.isCompleted;
    input.addEventListener("change", async () => {
      if (!todosColRef) {
        showCustomAlert("ログインしていません。");
        return;
      }
      const todoDocRef = doc(db, todosColRef.path, todo.id);
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
        showCustomAlert("タスクの更新に失敗しました。");
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
      
      if (!todosColRef) {
        showCustomAlert("ログインしていません。");
        return;
      }
      const todoDocRef = doc(db, todosColRef.path, todo.id);

      try {
        await deleteDoc(todoDocRef);
        li.remove();

        todos = todos.filter((item) => {
          return item.id !== todo.id;
        });
        if (todos.length === 0) {
          await renderTodos();
        }
      } catch (error) {
        console.error("Todoの削除中にエラーが発生しました: ", error);
        showCustomAlert("タスクの削除に失敗しました。");
      }
    });

    const li = document.createElement("li");
    if (todo.isCompleted) {
      li.classList.add("completed");
    }
    li.appendChild(label);
    li.appendChild(button);
    todosUl.appendChild(li);
  };

  const addDefaultTodos = async () => {
    if (!todosColRef) {
      console.warn("todosColRefが設定されていないため、デフォルトTodoを追加できません。");
      return;
    }

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
    todosUl.innerHTML = "";

    if (!todosColRef) {
      console.log("todosColRefが設定されていないため、Todoリストを読み込みません。");
      return;
    }

    try {
      const q = query(todosColRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);

      todos = [];
      
      querySnapshot.forEach((doc) => {
        todos.push({ id: doc.id, ...doc.data() });
      });

      if (todos.length === 0) {
        await addDefaultTodos();
        await renderTodos();
      } else {
        todos.forEach((todo) => {
          renderTodo(todo);
        });
      }
    } catch (error) {
      console.error("Todoリストの読み込み中にエラーが発生しました: ", error);
      showCustomAlert("タスクの読み込みに失敗しました。ネットワーク接続を確認してください。");
    }
  };

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = newTodoTitleInput;
    if (input.value.trim() === "") {
      showCustomAlert("タスクを入力してください");
      input.focus();
      return;
    }

    if (!todosColRef) {
      showCustomAlert("ログインしていません。タスクを追加できません。");
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
      showCustomAlert("タスクの追加に失敗しました。");
    }
  });

  document.querySelector("#purge").addEventListener("click", async () => {
    if (!confirm("完了済みのタスクをすべて削除しますか？")) {
      return;
    }

    if (!todosColRef) {
      showCustomAlert("ログインしていません。タスクを削除できません。");
      return;
    }

    const completedTodos = todos.filter(todo => todo.isCompleted);

    try {
      for (const todo of completedTodos) {
        const todoDocRef = doc(db, todosColRef.path, todo.id);
        await deleteDoc(todoDocRef);
      }

      todos = todos.filter((todo) => {
        return todo.isCompleted === false;
      });

      renderTodos();

    } catch (error) {
      console.error("完了済みTodoの一括削除中にエラーが発生しました: ", error);
      showCustomAlert("完了済みタスクの削除に失敗しました。");
    }
  });
}