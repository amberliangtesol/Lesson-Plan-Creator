import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { TeacherMainSidebar } from "../../components/Sidebar";
import Footer from "../../components/Footer";
import loadinganimation from "../../components/Asset/loading.gif";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";
import { BiTimeFive } from "react-icons/bi";
import { BsFillBookmarkStarFill } from "react-icons/bs";
import { BsCheckCircleFill } from "react-icons/bs";
import Joyride from "react-joyride";
import modal from "../../components/Modal";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

function TeacherMain() {
  const { user, setUser } = useContext(UserContext);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runJoyride, setRunJoyride] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const guideState = localStorage.getItem("mainguide");

    if (guideState === "true") {
      setRunJoyride(false);
    } else {
      setRunJoyride(true);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;

    if (status === "finished" || status === "skipped") {
      localStorage.setItem("mainguide", "true");
    }
  };

  const [steps] = useState([
    {
      target: ".manageClassButton",
      content: (
        <>
          <GuideText>Step1</GuideText>
          <br />
          請先建立班級
        </>
      ),
      disableBeacon: true,
      continuous: true,
      showSkipButton: true,
      hideCloseButton: true,
      showProgress: true,
      showNextButton: true,
    },
    {
      target: ".createClass",
      content: (
        <>
          <GuideText>Step2</GuideText>
          <br />
          再建立課程
        </>
      ),
      disableBeacon: true,
      showSkipButton: true,
      hideCloseButton: true,
      hideBackButton: true,
      showNextButton: true,
    },
  ]);

  const joyrideStyles = {
    options: {
      primaryColor: "#f46868",
      borderRadius: "25px",
    },
    buttonSkip: {
      backgroundColor: "#ffffff",
      color: "#f46868",
      borderRadius: "25px",
      paddingLeft: "15px",
      paddingRight: "15px",
      border: "2px #f46868 solid",
    },
    buttonNext: {
      backgroundColor: "#f46868",
      color: "#ffffff",
      borderRadius: "25px",
      paddingLeft: "15px",
      paddingRight: "15px",
      border: "none",
      cursor: "pointer",
    },
    tooltip: {
      backgroundColor: "#ffffff",
      borderRadius: "25px",
      textAlign: "left",
    },
    tooltipContainer: {
      textAlign: "center",
    },
    buttonBack: {
      backgroundColor: "#f46868",
      color: "#ffffff",
      borderRadius: "25px",
      paddingLeft: "15px",
      paddingRight: "15px",
      border: "none",
    },
    buttonPrimary: {
      backgroundColor: "#ffffff",
      border: "none",
    },
    buttonClose: {
      backgroundColor: "#ffffff",
      color: "#f46868",
      borderRadius: "25px",
      border: "none",
      text: "Next",
    },
    tooltipTitle: {
      color: "#ffffff",
      fontSize: "24px",
      fontWeight: "bold",
    },
    tooltipContent: {
      fontSize: "18px",
    },
  };

  function getClassNameById(classId) {
    const className = (user.classNames || []).find((c) => c.id === classId);
    return className?.name || "";
  }

  useEffect(() => {
    async function fetchUserData() {
      if (!user.account || user.classNames) return;

      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData) {
          const classNames = await Promise.all(
            userData.classes.map(async (classId) => {
              const classDoc = await getDoc(doc(db, "classes", classId));
              return {
                id: classId,
                name: classDoc.data() && classDoc.data().name,
              };
            })
          );
          setUser({
            ...user,
            image: userData.image,
            name: userData.name,
            classes: userData.classes,
            classNames,
          });
        }
      }
    }

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (
        loading &&
        user &&
        user.classes &&
        user.classes.length > 0 &&
        lessons.length === 0
      ) {
        const lessonsRef = collection(db, "lessons");
        const q = await query(
          lessonsRef,
          where("classes", "array-contains-any", user.classes)
        );
        const results = await getDocs(q);
        const lessons = results.docs.map((doc) => {
          return doc.data();
        });
        setLessons(lessons);
        setLoading(false);
      }
    };

    fetchClasses();
  }, [lessons, loading, user]);

  const handleScore = (id) => {
    navigate(`/score/${id}`);
  };

  const handleEditCourse = (id) => {
    navigate(`/EditCourse/${id}`);
  };

  function isCourseOutdated(course) {
    const currentDate = new Date();
    const endDate = new Date(course.end_date);
    return endDate < currentDate;
  }

  const handleCreateCourseClick = () => {
    if (user && user.classes && user.classes.length <= 0) {
      modal.success("請先至『班級管理』建立班級");
    } else {
      navigate("/CreateCourse");
    }
  };

  return (
    <Body>
      <Joyride
        steps={steps}
        styles={joyrideStyles}
        run={runJoyride}
        callback={handleJoyrideCallback}
      />
      <Header></Header>
      <Content>
        <Container>
          <TeacherMainSidebar className="sideBar"></TeacherMainSidebar>
          <MainContent>
            <HeaderContainer>
              <Title>課程主頁</Title>
              <CreateCourseP>
                <CreateCourseBtn
                  className="createClass"
                  onClick={handleCreateCourseClick}
                >
                  課程建立
                </CreateCourseBtn>
              </CreateCourseP>
            </HeaderContainer>
            {lessons.length > 0 ? (
              <CourseOutsideWrapper>
                <Container2>
                  <CourseSubheader>
                    <CourseSubheaderIcon></CourseSubheaderIcon>
                    <SubTitle>進行中課程</SubTitle>
                  </CourseSubheader>

                  <CourseWrapper>
                    {lessons
                      .filter((c) => !isCourseOutdated(c))
                      .map((c, index) => (
                        <OutdatedCourse key={index} outdated={false}>
                          <CourseContent>
                            <VideoImg img={c.img}></VideoImg>
                            <CourseTextWrapper>
                              <p>
                                <b>班級</b>
                                <br />
                                {c.classes.map((classId, index) => (
                                  <span key={classId}>
                                    {getClassNameById(classId)}
                                    {index < c.classes.length - 1 ? "、" : ""}
                                  </span>
                                ))}
                              </p>
                              <p>
                                <b>課程</b>
                                <br /> {c.name}
                              </p>
                              <TimeText>
                                <TimeIcon />
                                {`${formatDate(c.start_date)}~${formatDate(
                                  c.end_date
                                )}`}
                              </TimeText>
                            </CourseTextWrapper>
                          </CourseContent>
                          <BtnContainer>
                            <MainDarkFilledBtn
                              type="button"
                              onClick={() => handleEditCourse(c.id)}
                            >
                              <Link to="/EditCourse">課程編輯</Link>
                            </MainDarkFilledBtn>
                            <MainDarkBorderBtn
                              type="button"
                              onClick={() => handleScore(c.id)}
                            >
                              <Link to="/Score">答題狀況</Link>
                            </MainDarkBorderBtn>
                          </BtnContainer>
                        </OutdatedCourse>
                      ))}
                  </CourseWrapper>
                </Container2>

                <Container2>
                  <CourseSubheader>
                    <CourseSubheaderIcon1></CourseSubheaderIcon1>
                    <SubTitle>已完成課程</SubTitle>
                  </CourseSubheader>
                  <CourseWrapper>
                    {lessons
                      .filter((c) => isCourseOutdated(c))
                      .map((c, index) => (
                        <OutdatedCourse key={index}>
                          <CourseContent outdated>
                            <VideoImg img={c.img}></VideoImg>
                            <CourseTextWrapper>
                              <p>
                                班級
                                <br />
                                {c.classes.map((classId, index) => (
                                  <span key={classId}>
                                    {getClassNameById(classId)}
                                    {index < c.classes.length - 1 ? "、" : ""}
                                  </span>
                                ))}
                              </p>
                              <p>
                                <b>課程</b>
                                <br /> {c.name}
                              </p>
                              <TimeText>
                                <TimeIcon />
                                {`${formatDate(c.start_date)}~${formatDate(
                                  c.end_date
                                )}`}
                              </TimeText>
                            </CourseTextWrapper>
                          </CourseContent>
                          <BtnContainer>
                            <MainDarkBorderBtn
                              type="button"
                              onClick={() => handleScore(c.id)}
                            >
                              <Link to="/Score">答題狀況</Link>
                            </MainDarkBorderBtn>
                          </BtnContainer>
                        </OutdatedCourse>
                      ))}
                  </CourseWrapper>
                </Container2>
              </CourseOutsideWrapper>
            ) : (
              <LoadingContainer>
                <LoadingSvg />
                <p>{loading ? "Loading..." : "目前尚無課程資料"}</p>
              </LoadingContainer>
            )}
          </MainContent>
        </Container>
      </Content>
      <Footer></Footer>
    </Body>
  );
}

const Body = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 50px;
`;

const Content = styled.div`
  flex: 1;
  height: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  margin-top: 90px;
  margin-bottom: 90px;
  padding-right: 30px;
  padding-left: 30px;
`;

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: auto;
  margin-right: auto;
  flex-grow: 1;
  text-align: center;
`;

const HeaderContainer = styled.div`
  min-width: 300px;
  padding-right: 60px;
  display: flex;
  flex-direction: row;
  align-items: center;
  & > :last-child {
    margin-left: auto;
  }
`;

const SubTitle = styled.p`
  font-weight: 700;
  font-size: 20px;
  line-height: 19px;
  color: #000000;
`;

const CourseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  border-radius: 33px;
`;

const CourseOutsideWrapper = styled.div`
  width: 60vw;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 20px;
`;

const Container2 = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 50px;
  align-items: center;
  p {
    margin: 0px;
  }
`;

const VideoImg = styled.div`
  width: 300px;
  height: 150px;
  border-radius: 29px;
  background-image: url(${(props) => props.img});
  background-size: cover;
  background-position: center;
`;

const OutdatedCourse = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background-color: #f5f5f5;
  border-radius: 33px;
  width: 100%;
  padding: 30px 60px;
  & > :last-child {
    justify-content: flex-end;
  }
  ${({ outdated }) =>
    outdated &&
    `
    opacity: 0.5;

    ${MainDarkBorderBtn} {
      opacity: 1;
      a {
        opacity: 1;
      }
    }
  `}
`;

const BtnContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-top: 30px;
  align-items: flex-end;
`;

const CourseContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 30px;
  ${({ outdated }) =>
    outdated &&
    `
    opacity: 0.5;
  `}
`;

const CourseTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  p {
    margin: 0;
    font-size: 20px;
  }
`;

const CreateCourseP = styled.div`
  display: flex;
  align-items: center;
`;

const LoadingSvg = styled.div`
  background-image: url(${loadinganimation});
  background-size: contain;
  width: 200px;
  height: 200px;
  opacity: 30%;
`;

const TimeText = styled.p`
  display: flex;
  align-items: center;
`;

const TimeIcon = styled(BiTimeFive)`
  margin-right: 5px;
  font-size: 24px;
`;

const CourseSubheaderIcon1 = styled(BsCheckCircleFill)`
  color: #f46868;
  font-size: 24px;
`;

const CourseSubheaderIcon = styled(BsFillBookmarkStarFill)`
  color: #f46868;
  font-size: 24px;
`;

const CourseSubheader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const CreateCourseBtn = styled(MainRedFilledBtn)`
  margin-left: auto;
`;

const GuideText = styled.span`
  font-weight: bold;
  color: #f46868;
`;

export default TeacherMain;
