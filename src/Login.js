import React from "react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseApp";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    console.log(email, password);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;
        setDoc(doc(db, "users", email), {
          // name: "",
          account: email,
          password: password,
        }).then(console.log("註冊成功"));
        console.log(userCredential);
      })
      .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  };

  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;
        // ...
      })
      .then(console.log("登入成功"))
      .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  };

  return (
    <div>
      <form>
        <p>身份</p>
        <input type="radio" value="teacher" />
        <label>老師</label>
        <input type="radio" value="student" />
        <label>學生</label>
        <p>帳號</p>
        <input type="text" onChange={(e) => setEmail(e.target.value)}></input>
        <p>密碼</p>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button type="button" onClick={handleLogin}>
          送出
        </button>
      </form>

      <p>註冊</p>
      <form>
        <p>身份</p>
        <input type="radio" value="teacher" />
        <label>老師</label>
        <input type="radio" value="student" />
        <label>學生</label>
        <p>姓名</p>
        <input type="text"></input>
        <p>帳號</p>
        <input type="text" onChange={(e) => setEmail(e.target.value)}></input>
        <p>密碼</p>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button type="button" onClick={handleSubmit}>
          送出
        </button>
      </form>
    </div>
  );
}

export default Login;
