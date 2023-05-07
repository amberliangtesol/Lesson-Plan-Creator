import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
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
import Header from "../../components/Header";
import StudentMainSidebar from "../../components/StudentMainSidebar";
import Footer from "../../components/Footer";
import loadinganimation from "../../components/loading.gif";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";
import { BiTimeFive } from "react-icons/bi";
import { BsFillBookmarkStarFill } from "react-icons/bs";
import { BsCheckCircleFill } from "react-icons/bs";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

function StudentMain() {
  const { user, setUser } = useContext(UserContext);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

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
          // Add this condition to check if userData is defined
          // Fetch class names
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
        console.log("lessons", lessons);
        setLessons(lessons);
        setLoading(false);
      }
    };

    fetchClasses();
  }, [lessons, loading, user]);

  console.log(lessons.length);
  function isCourseOutdated(course) {
    const currentDate = new Date();
    const endDate = new Date(course.end_date);
    return endDate < currentDate;
  }

  return (
    <Body>
      <Header></Header>
      <Content>
        <Container>
          <StudentMainSidebar></StudentMainSidebar>
          <MainContent>
            <Title>課程主頁</Title>
            {lessons.length > 0 ? (
              <CourseOutsideWrapper>
                <Container2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <BsFillBookmarkStarFill
                      style={{ color: "#F46868", fontSize: "24px" }}
                    ></BsFillBookmarkStarFill>
                    <SubTitle>進行中課程</SubTitle>
                  </div>

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
                                {c.classes.map((classId) => (
                                  <span key={classId}>
                                    {getClassNameById(classId)}{" "}
                                  </span>
                                ))}
                              </p>
                              <p>
                                <b>課程</b>
                                <br /> {c.name}
                              </p>
                              <p
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <BiTimeFive
                                  style={{
                                    marginRight: "5px",
                                    fontSize: "24px",
                                  }}
                                />
                                {`${formatDate(c.start_date)}~${formatDate(
                                  c.end_date
                                )}`}
                              </p>
                            </CourseTextWrapper>
                          </CourseContent>
                          <BtnContainer>
                            <MainRedFilledBtn>
                              <Link to={`/YouTubeWithQuestion/${c.id}`}>
                                進入課程
                              </Link>
                            </MainRedFilledBtn>
                          </BtnContainer>
                        </OutdatedCourse>
                      ))}
                  </CourseWrapper>
                </Container2>
                <Container2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <BsCheckCircleFill
                      style={{ color: "#F46868", fontSize: "24px" }}
                    ></BsCheckCircleFill>
                    <SubTitle>已完成課程</SubTitle>
                  </div>
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
                                {c.classes.map((classId) => (
                                  <span key={classId}>
                                    {getClassNameById(classId)}{" "}
                                  </span>
                                ))}
                              </p>
                              <p>
                                <b>課程</b>
                                <br /> {c.name}
                              </p>
                              <p
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <BiTimeFive
                                  style={{
                                    marginRight: "5px",
                                    fontSize: "24px",
                                  }}
                                />
                                {`${formatDate(c.start_date)}~${formatDate(
                                  c.end_date
                                )}`}
                              </p>
                            </CourseTextWrapper>
                          </CourseContent>
                          <BtnContainer></BtnContainer>
                        </OutdatedCourse>
                      ))}
                  </CourseWrapper>
                </Container2>
              </CourseOutsideWrapper>
            ) : (
              <LoadingContainer>
                <LoadingSvg />
                <p>{loading ? "Loading..." : "目前尚無課程"}</p>
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
  text-align: center;
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

const LoadingSvg = styled.div`
  background-image: url(${loadinganimation});
  background-size: contain;
  width: 200px;
  height: 200px;
  opacity: 30%;
`;

export default StudentMain;
