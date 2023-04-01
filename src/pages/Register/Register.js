import React from "react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../utils/firebaseApp";
import { setDoc, doc } from "firebase/firestore";
import styled from 'styled-components/macro';
import profile from './profile.png';
import { Link } from 'react-router-dom';


const ProfileIcon = styled.div`
  width: 120px;
  height: 120px;
  background-image: url(${profile});
  cursor: pointer;
`;

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    console.log(email, password);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // const user = userCredential.user;
        setDoc(doc(db, "users", email), {
          name: name,
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

  return (
    <div>
      <ProfileIcon></ProfileIcon>
      <p>註冊</p>
      <form>
        <p>姓名</p>
        <input type="text" onChange={(e) => setName(e.target.value)}></input>
        <p>帳號</p>
        <input type="text" onChange={(e) => setEmail(e.target.value)}></input>
        <p>密碼</p>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button type="button" onClick={handleRegister}>
          註冊
        </button>
      </form>
    </div>
  );
}

export default Register;