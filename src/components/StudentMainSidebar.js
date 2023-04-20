import styled from "styled-components/macro";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../UserInfoProvider";
import React, { useState, useEffect, useContext } from "react";
import { HiOutlineHome } from "react-icons/hi";
import { BsFillPersonFill } from "react-icons/bs";
import { BiBadgeCheck } from "react-icons/bi";

const StudentMainSidebar = () => {
  const { user, setUser } = useContext(UserContext);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return ( 
    <Container1>
      <ProfileImg imageURL={user.image}></ProfileImg>
      <Greeting>{user.name}</Greeting>
      <BtnContainer>
        <Link
          to="/StudentMain"
          style={{ textDecoration: "none" }}
          onClick={() => handleLinkClick("/StudentMain")}
        >
          <Btnwrapper className={activeLink === "/StudentMain" ? "active" : ""}>
            <HiOutlineHome style={{ color: "black" }} />
            <StyledParagraph>課程主頁</StyledParagraph>
          </Btnwrapper>
        </Link>

        <Link
          to="/Badge"
          style={{ textDecoration: "none" }}
          onClick={() => handleLinkClick("/Badge")}
        >
          <Btnwrapper className={activeLink === "/Badge" ? "active" : ""}>
            <BiBadgeCheck style={{ color: "black" }} />
            <StyledParagraph>徽章搜集</StyledParagraph>
          </Btnwrapper>
        </Link>

        <Link
          to="/StudentProfile"
          style={{ textDecoration: "none" }}
          onClick={() => handleLinkClick("/StudentProfile")}
        >
          <Btnwrapper
            className={activeLink === "/StudentProfile" ? "active" : ""}
          >
            <BsFillPersonFill style={{ color: "black" }} />
            <StyledParagraph>個人設定</StyledParagraph>
          </Btnwrapper>
        </Link>
      </BtnContainer>
    </Container1>
  );
};

const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 20px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  text-align: left;
  @media screen and (max-width: 1279px) {
  }
`;

const Container1 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  background-color: #f5f5f5;
  padding-top: 100px;
  height:100vh;
  @media screen and (max-width: 1279px) {
  }
`;

const ProfileImg = styled.div`
  width: 150px;
  height: 150px;
  background-image: url(${(props) => props.imageURL});
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #ffffff;
  @media screen and (max-width: 1279px) {
  }
`;

const Greeting = styled.p`
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 0.04em;
  color: black;
  font-size: 30px;
  font-weight: 700;
  line-height: 29px;
  @media screen and (max-width: 1279px) {
  }
`;

const StyledParagraph = styled.p`
  display: flex;
  align-items: center;
  letter-spacing: 0.04em;
  color: black;
  text-decoration: none;
  &.active {
    border-bottom: 3px solid black;
  }
  @media screen and (max-width: 1279px) {
  }
`;

const Btnwrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
  position: relative;

  &.active {
    &::after {
      content: "";
      position: absolute;
      bottom: 15px;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: #f46868;
    }
  }
  @media screen and (max-width: 1279px) {
  }
`;

export default StudentMainSidebar;
