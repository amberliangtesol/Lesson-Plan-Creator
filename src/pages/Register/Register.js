import React from "react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../utils/firebaseApp";
import { setDoc, doc } from "firebase/firestore";
import styled from "styled-components/macro";
import profile from "./profile.png";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    console.log(email, password);
    createUserWithEmailAndPassword(auth, email, password, name)
      .then((userCredential) => {
        // Get the user's unique identifier (UID) from the userCredential object
        const uid = userCredential.user.uid;

        // Use the user's UID as the document ID in Firestore
        setDoc(doc(db, "users", email), {
          name: name,
          image: "",
          account: email,
          role: "teacher",
          classes: [],
          uid: uid,
        }).then(() => {
          console.log("註冊成功");
          // Redirect to the login page after successful registration
          navigate("/login");
        });
        console.log(userCredential);
      })
      .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  };

  return (
    <Body>
      <Header></Header>
      <Wrapper>
        <ProfileIcon></ProfileIcon>
        <h2>教師註冊</h2>
        <RegisterForm>
          <RegisterText>姓名</RegisterText>
          <RegisterInput
            type="text"
            onChange={(e) => setName(e.target.value)}
          ></RegisterInput>
          <RegisterText>帳號</RegisterText>
          <RegisterInput
            type="text"
            onChange={(e) => setEmail(e.target.value)}
          ></RegisterInput>
          <RegisterText>密碼</RegisterText>
          <RegisterInput
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          ></RegisterInput>
        </RegisterForm>
        <button type="button" onClick={handleRegister}>
          註冊
        </button>
      </Wrapper>
    </Body>
  );
}

const Body = styled.div`
  background-color:#F5F5F5;
  height: 100vh;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 80px;
`;

const ProfileIcon = styled.div`
  width: 98px;
  height: 142px;
  background-image: url(${profile});
  cursor: pointer;
`;

const RegisterText = styled.p`
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 29px;
  color: #000000;
`;
const RegisterForm = styled.form`
  width: 300px;
  display: flex;
  flex-direction: column;
`;

const RegisterInput = styled.input`
  width: 300px;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 20px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
`;

export default Register;
