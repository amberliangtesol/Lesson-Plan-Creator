import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { TeacherMainSidebar } from "../../components/Sidebar";
import loadinganimation from "../../components/Asset/loading.gif";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";

function ManageClass() {
  const { user, setUser } = useContext(UserContext);
  const [classDetails, setClassDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchClassDetails();
  }, [user.classes]);

  return (
    <Body>
      <Content>
        <Container>
          <TeacherMainSidebar></TeacherMainSidebar>
          <MainContent>
            <HeaderContainer>
              <Title>班級管理</Title>
              <CreateClassBtn>
                <Link to="/CreateClass">班級建立</Link>
              </CreateClassBtn>
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
                        <Slash> / </Slash>
                        <b>學生人數</b>
                        {classItem.studentNumber}人
                      </p>
                      <EditClassButton>
                        <Link to={`/edit-class/${classItem.id}`}>班級編輯</Link>
                      </EditClassButton>
                    </ClassContainer>
                  ))}
                </ClassWrapper>
              )}
            </Container2>
          </MainContent>
        </Container>
      </Content>
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
  max-width: 100%;
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
  width: 60vw;
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

const EditClassButton = styled(MainDarkBorderBtn)`
  margin-left: auto;
`;

const Slash = styled.b`
  color: #f46868;
`;

const CreateClassBtn = styled(MainRedFilledBtn)`
  margin-left: auto;
`;

export default ManageClass;
