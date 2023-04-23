import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { useState, useEffect, useRef } from "react";
import { keyframes } from "styled-components";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import HoverComputer from "../../components/HoverComputer/HoverComputer";
import { ColorFilledBtn } from "../../components/Buttons";
import { ColorBorderBtn } from "../../components/Buttons";
import arrow from "./arrow.png";
import logo from "./logo.png";
import banner from "./banner.png";
import student from "./student.png";
import teacher from "./teacher.png";

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
        <Header></Header>
        <ColorFilledBtn
          type="button"
          style={{
            zIndex: 10001,
            width: "104px",
            right: "31px",
            top: "26px",
            position: "fixed",
          }}
        >
          <Link to="/Login">登入</Link>
        </ColorFilledBtn>
      </HeaderWrapper>

      <SlogenWrapper>
        <h1>
          The world's classroom <br />
          at your fingertips !
        </h1>
        <ColorBorderBtn
          type="button"
          style={{
            zIndex: 1000,
            width: "104px",
            position: "absolute",
            top: "300px",
          }}
        >
          <Link to="/Register">註冊</Link>
        </ColorBorderBtn>
        <SlogenWrapperImg></SlogenWrapperImg>
        <Liner></Liner>
        <Arrow></Arrow>
      </SlogenWrapper>

      <ConversationWrapper ref={conversationWrapperRef}>
        <ConversationInsideWrapper style={{ justifyContent: "flex-start" }}>
          <TeacherImg
            className={showTeacher ? "show" : ""}
            ref={teacherImgRef}
          ></TeacherImg>
          <ConversationP>
            更方便的建立影音素材教案
            <br />
            設計更吸引學生的互動問答
            <br />
            更有效率地管理學生的後台
          </ConversationP>
        </ConversationInsideWrapper>
        <ConversationInsideWrapper
          style={{ justifyContent: "flex-end" }}
          ref={studentImgRef}
        >
          <ConversationP>
            更方便的建立影音素材教案
            <br />
            設計更吸引學生的互動問答
            <br />
            更有效率地管理學生的後台
          </ConversationP>
          <StudentImg className={showStudent ? "show" : ""}></StudentImg>
        </ConversationInsideWrapper>
      </ConversationWrapper>

      <ComputerWrapper style={{ marginTop: "50px", marginBottom: "50px" }}>
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
        <h3>Learning has never been this easy with </h3>
        <Logo></Logo>
      </FooterSlogenWrapper>

      <Footer></Footer>
    </div>
  );
}

const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
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
  padding-right: 150px;
  padding-left: 150px;
`;

const ConversationInsideWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ConversationP = styled.p`
  font-size: 20px;
  font-weight: 500;
  margin: 50px;
  line-height: 40px;
`;

const TeacherImg = styled.div`
  width: 168px;
  height: 245px;
  background-image: url(${teacher});
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
  background-image: url(${student});
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
`;

const FeatureWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Feature = styled.div`
  display: flex;
  flex-direction: column;
`;

const FeatureImg = styled.div``;

const FooterSlogenWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 150px;
`;

const Logo = styled.div`
  width: 208px;
  height: 43px;
  background-image: url(${logo});
`;

export default Main;
