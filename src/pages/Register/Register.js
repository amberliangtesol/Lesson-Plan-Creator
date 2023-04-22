import React from "react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../utils/firebaseApp";
import { setDoc, doc } from "firebase/firestore";
import styled from "styled-components/macro";
import profile from "./profile.png";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ColorBorderBtn } from "../../components/Buttons";

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
      <Content>
        <Wrapper>
          <ProfileIcon></ProfileIcon>
          <h2>教師註冊</h2>
          <RegisterForm>
            <RegisterInput
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="請輸入姓名"
            ></RegisterInput>
            <RegisterInput
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入信箱"
            ></RegisterInput>
            <RegisterInput
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
            ></RegisterInput>
          </RegisterForm>

          <BtnContainer>
            <ColorBorderBtn type="button" onClick={handleRegister}>
              註冊
            </ColorBorderBtn>
          </BtnContainer>
        </Wrapper>
      </Content>
      <Footer></Footer>
    </Body>
  );
}

const Body = styled.div`
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin-top: 90px;
`;

const Content = styled.div`
  flex: 1;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 80px;
`;

const ProfileIcon = styled.div`
  width: 107px;
  height: 135px;
  background-image: url(${profile});
  cursor: pointer;
`;

const RegisterForm = styled.form`
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 30px;
`;

const RegisterInput = styled.input`
  width: 360px;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
  :focus {
    outline: 2px solid #f46868;
  }
`;

const BtnContainer = styled.div`
  width: 360px;
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding-bottom: 30px;
  justify-content: center;
`;

export default Register;
