import React from "react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../utils/firebaseApp";
import { setDoc, doc } from "firebase/firestore";
import styled from "styled-components/macro";
import teacherprofile from "./teacherprofile.png";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ColorBorderBtn } from "../../components/Buttons";
import modal from "../../components/Modal";
import { Link } from "react-router-dom";

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
          modal.success("註冊成功");
          navigate("/login");
        });
        console.log(userCredential);
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/email-already-in-use":
            modal.success("電子信箱已使用");
            break;
          case "auth/invalid-email":
            modal.success("請輸入有效的電子信箱");
            break;
          case "auth/weak-password":
            modal.success("密碼應至少為6個字符");
            break;
          default:
            modal.success("註冊失敗，請重試");
        }
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
              type="email"
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
          <TextContainer>
            <Text1>註冊成功將跳轉</Text1>
            <Text2>
              <Link to="/Login">登入</Link>
            </Text2>
          </TextContainer>
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
  width: 107px;
  height: 135px;
  background-image: url(${teacherprofile});
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

export default Register;
