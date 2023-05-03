import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebaseApp";
import { useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import profile from "./profile.png";
import teacherprofile from "./teacherprofile.png";
import { UserContext } from "../../UserInfoProvider";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import arrow from "./arrow.png";
import { ColorFilledBtn } from "../../components/Buttons";
import { ColorBorderBtn } from "../../components/Buttons";
import modal from "../../components/Modal";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const profileImage = role === "teacher" ? teacherprofile : profile;

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
          modal.success("請確認登入身份是否正確");
        }
      } else {
        if (role === "teacher") {
          modal.success("您沒有帳號請先註冊");
          navigate("/register");
        } else {
          modal.success("錯誤的帳號或密碼");
        }
      }
    } catch (error) {
      console.log(error.code);
      modal.success("錯誤的帳號或密碼");
    }
  };

  return (
    <Body>
      <Header></Header>
      <Content>
        <Wrapper>
          <ProfileIcon
            style={{ backgroundImage: `url(${profileImage})` }}
          ></ProfileIcon>
          <h2>登入</h2>
          <RegisterForm>
            <RegisterSelect value={role} onChange={handleRoleChange}>
              <option value="" disabled>
                請選擇身份
              </option>
              <option value="student">學生</option>
              <option value="teacher">教師</option>
            </RegisterSelect>
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
            <BtnContainer>
              <ColorFilledBtn type="button" onClick={handleLogin}>
                登入
              </ColorFilledBtn>
              <ColorBorderBtn type="button">
                <Link to="/Register">註冊</Link>
              </ColorBorderBtn>
            </BtnContainer>
            <TextContainer>
              <Text1>無帳號教師</Text1>
              <Text2>請先註冊</Text2>
            </TextContainer>
          </RegisterForm>
        </Wrapper>
      </Content>
      <Footer></Footer>
    </Body>
  );
}

const Body = styled.div`
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  width: 98px;
  height: 137px;
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

const RegisterSelect = styled.select`
  width: 360px;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
  appearance: none;
  background-image: url(${arrow});
  background-repeat: no-repeat;
  background-position: calc(100% - 20px) center;
  padding-right: 30px;
  option:checked {
    background-color: #febebe;
  }
  option:hover {
    background-color: #febebe;
  }
  :focus {
    outline: 2px solid #f46868;
  }
`;

const BtnContainer = styled.div`
  width: 360px;
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding-bottom: 20px;
`;

const TextContainer = styled.div`
  width: 360px;
  display: flex;
  flex-direction: row;
  gap: 5px;
  padding-bottom: 20px;
  justify-content: center;
`;

const Text1 = styled.p`
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  align-items: center;
  text-align: center;
  color: #666666;
  letter-spacing: 0.1em;
`;

const Text2 = styled(Text1)`
  font-weight: 700;
  color: #f46868;
`;

export default Login;
