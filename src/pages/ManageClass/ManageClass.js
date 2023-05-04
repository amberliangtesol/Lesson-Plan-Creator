import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import Header from "../../components/Header";
import TeacherMainSidebar from "../../components/TeacherMainSidebar";
import Footer from "../../components/Footer";
import loadinganimation from "../../components/loading.gif";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";

function ManageClass() {
  const { user, setUser } = useContext(UserContext);
  const [classDetails, setClassDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // First useEffect for fetching and setting user data
  // useEffect(() => {
  //   async function fetchUserData() {
  //     if (user.name && user.name !== "") return;

  //     const docRef = doc(db, "users", user.account);
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       const userData = docSnap.data();
  //       setUser({
  //         ...user,
  //         image: userData.image,
  //         name: userData.name,
  //         classes: userData.classes,
  //       });
  //     }
  //   }
  //   fetchUserData();
  // }, [user.account]);

  // Second useEffect for fetching and setting class details
  useEffect(() => {
    async function fetchClassDetails() {
      if (!user.classes || user.classes.length === 0) {
        setIsLoading(false);
        return;
      }
      const classDetails = await Promise.all(
        user.classes.map(async (classId) => {
          const classDoc = await getDoc(doc(db, "classes", classId));
          const classData = classDoc.data();

          if (!classData) {
            console.warn(`Class data not found for class ID: ${classId}`);
            return null;
          }

          return {
            name: classData.name,
            studentNumber: classData.students.length,
            id: classData.id,
          };
        })
      );
      setClassDetails(classDetails.filter(Boolean));
      setIsLoading(false);
    }
    console.log("user_classes", user.classes);
    fetchClassDetails();
  }, [user.classes]);

  console.log(classDetails);

  return (
    <Body>
      <Header></Header>
      <Content>
        <Container>
          <TeacherMainSidebar></TeacherMainSidebar>
          <MainContent>
            <HeaderContainer>
              <Title>班級管理</Title>
              <MainRedFilledBtn style={{ marginLeft: "auto" }}>
                <Link to="/AddClass">班級建立</Link>
              </MainRedFilledBtn>
            </HeaderContainer>
            <Container2>
              {isLoading ? (
                <LoadingContainer>
                  <LoadingSvg />
                  <p>Loading...</p>
                </LoadingContainer>
              ) : classDetails.length === 0 ? (
                <LoadingContainer>
                  <LoadingSvg />
                  <p>目前尚無班級資料</p>
                </LoadingContainer>
              ) : (
                <ClassWrapper>
                  {classDetails.map((classItem, index) => (
                    <ClassContainer key={index}>
                      <p>
                        <b>班級名稱</b> {classItem.name}
                        <b style={{ color: "#F46868" }}> / </b>
                        <b>學生人數</b>
                        {classItem.studentNumber}人
                      </p>
                      <MainDarkBorderBtn style={{ marginLeft: "auto" }}>
                        <Link to={`/edit-class/${classItem.id}`}>班級編輯</Link>
                      </MainDarkBorderBtn>
                    </ClassContainer>
                  ))}
                </ClassWrapper>
              )}
            </Container2>
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
  margin-top: 50px;
`;

const Content = styled.div`
  flex: 1;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
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

const Container2 = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: centerㄤ;
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

const ClassWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  margin-top: 50px;
  width: 100%;
`;

const ClassContainer = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #f5f5f5;
  border-radius: 33px;
  width: 100%;
  height: 83px;
  padding: 30px 60px;
  align-items: center;
  & > :last-child {
    justify-self: flex-end;
  }
  p {
    font-size: 20px;
    letter-spacing: 0.03em;
  }
`;

const LoadingSvg = styled.div`
  background-image: url(${loadinganimation});
  background-size: contain;
  width: 200px;
  height: 200px;
  opacity: 30%;
`;

export default ManageClass;
