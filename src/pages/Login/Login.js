import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebaseApp";
import { useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import profile from "./profile.png";
import { UserContext } from "../../UserInfoProvider";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import arrow from "./arrow.png";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const db = getFirestore();
      const userDocRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUser(userDoc.data());
        if (role === "student" && userDoc.data().role === "student") {
          navigate("/studentmain");
        } else if (role === "teacher" && userDoc.data().role === "teacher") {
          navigate("/teachermain");
        } else {
          alert("請聯絡你的老師");
        }
      } else {
        if (role === "teacher") {
          alert("您沒有帳號請先註冊");
          navigate("/register");
        } else {
          alert("錯誤的帳號或密碼");
        }
      }
    } catch (error) {
      console.log(error.message);
      alert("錯誤的帳號或密碼");
    }
  };

  return (
    <Body>
      <Header></Header>
      <Wrapper>
        <ProfileIcon></ProfileIcon>
        <h2>登入</h2>
        <RegisterForm>
          <RegisterSelect value={role} onChange={handleRoleChange}>
            <option value="">請選擇身份</option>
            <option value="student">student</option>
            <option value="teacher">teacher</option>
          </RegisterSelect>
          <RegisterInput
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="請輸入帳號"
          ></RegisterInput>
          <RegisterInput
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="請輸入密碼"
          ></RegisterInput>
          <div>
            <Btn type="button" onClick={handleLogin}>
              登入
            </Btn>
            <Btn type="button">
              <Link to="/Register">註冊</Link>
            </Btn>
          </div>
        </RegisterForm>
      </Wrapper>
      <Footer></Footer>
    </Body>
  );
}

const Body = styled.div`
  background-color: #f5f5f5;
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
  gap:15px;
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

const RegisterSelect = styled.select`
  width: 300px;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 20px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
  appearance: none;
  background-image: url(${arrow});
  background-repeat: no-repeat;
  background-position: right center;
  padding-right: 30px;
`;

const Btn = styled.button`
  cursor: pointer;
  width: 100px;
  height: 25px;
  a {
    text-decoration: none;
    color: #000000;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
`;

export default Login;
