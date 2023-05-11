import React, { useContext } from "react";
import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import studentprofile from "./LoginAsset/studentprofile.png";
import teacherprofile from "./LoginAsset/teacherprofile.png";
import { UserContext } from "../../UserInfoProvider";
import { Link } from "react-router-dom";
import arrow from "./LoginAsset/arrow.png";
import { ColorFilledBtn } from "../../components/Buttons";
import { ColorBorderBtn } from "../../components/Buttons";
import modal from "../../components/Modal";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const profileImage = role === "teacher" ? teacherprofile : studentprofile;

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
      modal.success("錯誤的帳號或密碼");
    }
  };

  const handleForgotPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        modal.success("已寄送密碼重設信至您的信箱");
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/missing-email":
            modal.success("請輸入您的電子信箱");
            break;
          case "auth/invalid-email":
            modal.success("請輸入有效的電子信箱");
            break;
          default:
            modal.success("設定失敗，請確認是否輸入正確的電子信箱");
        }
      });
  };

  return (
    <Body>
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
            <Text0 onClick={handleForgotPassword}>忘記密碼</Text0>
            <TextContainer>
              {role === "student" ? (
                <>
                  <Text1>系統預設學生</Text1>
                  <Text2>帳號密碼相同</Text2>
                </>
              ) : (
                <>
                  {" "}
                  <Text1>無帳號教師請先</Text1>
                  <Text2>
                    <Link to="/Register">註冊</Link>
                  </Text2>
                </>
              )}
            </TextContainer>
          </RegisterForm>
        </Wrapper>
      </Content>
    </Body>
  );
}

const Body = styled.div`
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 50px;
`;

const Content = styled.div`
  flex: 1;
  height: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 80px;
  height: 100%;
`;

const ProfileIcon = styled.div`
  width: 98px;
  height: 137px;
  background-image: url(${studentprofile});
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

const Text0 = styled.p`
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  align-items: center;
  text-align: center;
  color: #666666;
  letter-spacing: 0.1em;
  margin: 0;
  cursor: pointer;
  a {
    color: #f46868;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    letter-spacing: 0.055em;
    text-decoration: none;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
  :hover {
    transform: translate(-0.05em, -0.05em);
  }

  :active {
    transform: translate(0.05em, 0.05em);
  }ß
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
  cursor: pointer;
  a {
    color: #f46868;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    letter-spacing: 0.055em;
    text-decoration: none;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
  :hover {
    transform: translate(-0.05em, -0.05em);
  }

  :active {
    transform: translate(0.05em, 0.05em);
  }
`;

export default Login;
