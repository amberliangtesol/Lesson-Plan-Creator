import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { useState, useEffect, useRef } from "react";
import { keyframes } from "styled-components";
import HoverComputer from "./HoverComputer/HoverComputer";
import { ColorFilledBtn } from "../../components/Buttons";
import { ColorBorderBtn } from "../../components/Buttons";
import arrow from "./MainAsset/arrow.png";
import logo from "./MainAsset/logo.png";
import banner from "./MainAsset/banner.png";
import studentprofile from "./MainAsset/studentprofile.png";
import teacherprofile from "./MainAsset/teacherprofile.png";

function Main() {
  const [showTeacher, setShowTeacher] = useState(false);
  const [showStudent, setShowStudent] = useState(false);

  const conversationWrapperRef = useRef(null);
  const teacherImgRef = useRef(null);
  const studentImgRef = useRef(null);

  useEffect(() => {
    const options = {
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === teacherImgRef.current) {
            setShowTeacher(true);
          } else if (entry.target === studentImgRef.current) {
            setShowStudent(true);
          }
        }
      });
    }, options);

    observer.observe(teacherImgRef.current);
    observer.observe(studentImgRef.current);

    return () => {
      if (teacherImgRef.current instanceof Element) {
        observer.unobserve(teacherImgRef.current);
      }
      if (studentImgRef.current instanceof Element) {
        observer.unobserve(studentImgRef.current);
      }
    };
  }, []);

  return (
    <div>
      <HeaderWrapper>
        <Link to="/">
          <Logo />
        </Link>
        <LogInBtn type="button">
          <Link to="/Login">登入</Link>
        </LogInBtn>
      </HeaderWrapper>

      <SlogenWrapper>
        <h1>
          讓學習更輕鬆 <br />
          使教學更生動 !
        </h1>
        <RegisterBtn type="button">
          <Link to="/Register">註冊</Link>
        </RegisterBtn>
        <SlogenWrapperImg></SlogenWrapperImg>
        <Liner></Liner>
        <Arrow></Arrow>
      </SlogenWrapper>

      <ConversationWrapper ref={conversationWrapperRef}>
        <ConversationInsideWrapper>
          <TeacherImg
            className={showTeacher ? "show" : ""}
            ref={teacherImgRef}
          ></TeacherImg>
          <ConversationP>
            更方便快速的建立
            <KeyText>影音教案</KeyText>
            <br />
            設計更吸引學生的
            <KeyText>互動問答</KeyText>
            <br />
            更有效容易的管理
            <KeyText>學生後台</KeyText>
          </ConversationP>
        </ConversationInsideWrapper>
        <ConversationInsideWrapper ref={studentImgRef}>
          <ConversationP>
            <KeyText1>隨時隨地 </KeyText1>
            學習讓上課不無聊
            <br />
            <KeyText1>遊戲模式 </KeyText1>
            超級刺激欲罷不能
            <br />
            <KeyText1>徽章集點 </KeyText1>
            讓我想準時寫作業
          </ConversationP>
          <StudentImg className={showStudent ? "show" : ""}></StudentImg>
        </ConversationInsideWrapper>
      </ConversationWrapper>

      <ComputerWrapper>
        <HoverComputer />
      </ComputerWrapper>

      {/* <FeatureWrapper>
        <Feature>
          <FeatureImg></FeatureImg>
          <p></p>
        </Feature>
        <Feature>
          <FeatureImg></FeatureImg>
          <p></p>
        </Feature>
        <Feature>
          <FeatureImg></FeatureImg>
          <p></p>
        </Feature>
      </FeatureWrapper> */}

      <FooterSlogenWrapper>
        <h2>來看看更多精彩功能吧！ </h2>
      </FooterSlogenWrapper>
    </div>
  );
}

const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
  z-index: 10000;
`;

const Logo = styled.div`
  width: 252px;
  height: 51px;
  background-image: url(${logo});
  cursor: pointer;
  @media screen and (max-width: 1279px) {
  }
`;

const SlogenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 90px;
  align-items: center;
  h1 {
    text-align: center;
    margin-top: 100px;
    margin-bottom: 100px;
  }
`;

const SlogenWrapperImg = styled.div`
  width: 100%;
  height: 266px;
  background-image: url(${banner});
  z-index: 2000;
`;

const Liner = styled.div`
  width: 100%;
  height: 189px;
  margin-top: -25px;
  background: linear-gradient(
    180deg,
    rgba(244, 159, 159, 0.49) 18.52%,
    rgba(240, 187, 190, 0.299027) 58.8%,
    rgba(235, 232, 239, 0) 88.89%
  );
`;
const moveDown = keyframes`
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(0, 10px);
  }
`;

const Arrow = styled.div`
  width: 70.41px;
  height: 70.41px;
  background-image: url(${arrow});
  z-index: 3000;
  margin-top: -150px;
  animation: ${moveDown} 1s infinite alternate;
`;

const ConversationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  width: 50%;
  align-self: center;
  margin-right: auto;
  margin-left: auto;
  margin-top: 30px;
`;

const ConversationInsideWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const ConversationP = styled.p`
  font-size: 24px;
  font-weight: 500;
  margin: 50px;
  line-height: 40px;
`;

const TeacherImg = styled.div`
  width: 168px;
  height: 245px;
  background-image: url(${teacherprofile});
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: translateX(-50%);
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;

  &.show {
    opacity: 1;
    transform: translateX(0%);
  }
`;

const StudentImg = styled.div`
  width: 170px;
  height: 248px;
  background-image: url(${studentprofile});
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: translateX(50%);
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;

  &.show {
    opacity: 1;
    transform: translateX(0%);
  }
`;

const ComputerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 50px;
  margin-bottom: 50px;
`;

const FooterSlogenWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 50px;
  margin-bottom: 150px;
`;

const KeyText = styled.span`
  color: #f46868;
  font-weight: 700;
  padding-left: 10px;
`;

const KeyText1 = styled.span`
  color: #f46868;
  font-weight: 700;
  padding-right: 10px;
`;

const RegisterBtn = styled(ColorBorderBtn)`
  z-index: 1000;
  width: 104px;
  position: absolute;
  top: 300px;
`;

const LogInBtn = styled(ColorFilledBtn)`
  z-index: 10001;
  width: 104px;
  right: 31px;
  top: 26px;
  position: fixed;
`;

const FeatureWrapper = styled.div``;

const Feature = styled.div``;

const FeatureImg = styled.div``;

export default Main;
