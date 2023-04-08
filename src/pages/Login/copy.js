import React from "react";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import styled from "styled-components/macro";
import profile from "./profile.png";

// import { auth, db } from "../../utils/firebaseApp";

const ProfileIcon = styled.div`
  width: 120px;
  height: 120px;
  background-image: url(${profile});
  cursor: pointer;
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
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
      <ProfileIcon></ProfileIcon>
      <form>
        <h4>登入</h4>
        <p>身份</p>
        <select>
          <option value="teacher">學生</option>
          <option value="student">老師</option>
        </select>
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
    </div>
  );
}

export default Login;
