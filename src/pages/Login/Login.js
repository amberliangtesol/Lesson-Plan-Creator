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


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
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
    <div>
      <ProfileIcon></ProfileIcon>
      <form>
        <h4>登入</h4>
        <p>身份</p>
        <select value={role} onChange={handleRoleChange}>
          <option value="student">student</option>
          <option value="teacher">teacher</option>
        </select>
        <p>帳號</p>
        <input type="text" onChange={(e) => setEmail(e.target.value)}></input>
        <p>密碼</p>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <div>
          <Btn type="button" onClick={handleLogin}>
            登入
          </Btn>
          <Btn type="button">
            <Link to="/Register">註冊</Link>
          </Btn>
        </div>
      </form>
    </div>
  );
}

const ProfileIcon = styled.div`
  width: 120px;
  height: 120px;
  background-image: url(${profile});
  cursor: pointer;
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
