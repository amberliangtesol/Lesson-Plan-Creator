import React from "react";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import profile from "./profile.png";

const ProfileIcon = styled.div`
  width: 120px;
  height: 120px;
  background-image: url(${profile});
  cursor: pointer;
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const db = getFirestore();
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
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
        <button type="button" onClick={handleLogin}>
          送出
        </button>
      </form>
    </div>
  );
}

export default Login;
