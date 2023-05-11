import styled from "styled-components/macro";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../UserInfoProvider";
import React, { useState, useContext } from "react";
import { HiOutlineHome } from "react-icons/hi";
import { BsFillPeopleFill } from "react-icons/bs";
import { BsFillPersonFill } from "react-icons/bs";
import { BiBadgeCheck } from "react-icons/bi";
import teacherprofile from "./Asset/defaultteacherprofile.png";
import studentprofile from "./Asset/defaultstudentprofile.png";

const MainSidebar = ({ userType, links }) => {
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
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={{ textDecoration: "none" }}
            onClick={() => handleLinkClick(link.path)}
          >
            <Btnwrapper className={activeLink === link.path ? "active" : ""}>
              {link.icon}
              <StyledParagraph>{link.label}</StyledParagraph>
            </Btnwrapper>
          </Link>
        ))}
      </BtnContainer>
    </Container1>
  );
};

const StudentMainSidebar = () => (
  <MainSidebar
    userType="student"
    links={[
      {
        path: "/StudentMain",
        label: "課程主頁",
        icon: <HiOutlineHome style={{ color: "black" }} />,
      },
      {
        path: "/Badge",
        label: "我的徽章",
        icon: <BiBadgeCheck style={{ color: "black" }} />,
      },
      {
        path: "/Profile",
        label: "個人設定",
        icon: <BsFillPersonFill style={{ color: "black" }} />,
      },
    ]}
  />
);

const TeacherMainSidebar = () => (
  <MainSidebar
    userType="teacher"
    links={[
      {
        path: "/TeacherMain",
        label: "課程主頁",
        icon: <HiOutlineHome style={{ color: "black" }} />,
      },
      {
        path: "/ManageClass",
        label: "班級管理",
        icon: <BsFillPeopleFill style={{ color: "black" }} />,
      },
      {
        path: "/ManageBadge",
        label: "徽章管理",
        icon: <BiBadgeCheck style={{ color: "black" }} />,
      },
      {
        path: "/Profile",
        label: "個人設定",
        icon: <BsFillPersonFill style={{ color: "black" }} />,
      },
    ]}
  />
);

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
  width: 350px;
  background-color: #f5f5f5;
  padding-top: 100px;
  min-height: calc(100vh - 60px);
  @media screen and (max-width: 1279px) {
  }
`;

const ProfileImg = styled.div`
  width: 150px;
  height: 150px;
  box-shadow: rgb(0 0 0 / 40%) 0px 1px 4px 0px;
  background-image: url(${(props) =>
    props.imageURL
      ? props.imageURL
      : props.userType === "teacher"
      ? teacherprofile
      : studentprofile});
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
  gap: 10px;
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

export { TeacherMainSidebar, StudentMainSidebar };
