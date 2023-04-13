import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";

function ManageClass() {
  const { user, setUser } = useContext(UserContext);
  const [classDetails, setClassDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // First useEffect for fetching and setting user data
  useEffect(() => {
    async function fetchUserData() {
      if (user.name) return;

      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser({
          ...user,
          image: userData.image,
          name: userData.name,
          classes: userData.classes,
        });
      }
    }
    fetchUserData();
  }, [user.account]);

  // Second useEffect for fetching and setting class details
  useEffect(() => {
    async function fetchClassDetails() {
      if (!user.classes) return;

      const classDetails = await Promise.all(
        user.classes.map(async (classId) => {
          const classDoc = await getDoc(doc(db, "classes", classId));
          const classData = classDoc.data();
          return {
            name: classData.name,
            studentNumber: classData.students.length,
            id: classData.id,
          };
        })
      );
      setClassDetails(classDetails);
      setIsLoading(false);
    }
    fetchClassDetails();
  }, [user.classes]);

  console.log(classDetails);

  return (
    <div>
      <h3>班級管理</h3>
      <Container>
        <Container1>
          <ProfileImg imageURL={user.image}></ProfileImg>
          <p>Hello {user.name}!</p>
          <BtnContainer>
            <Btn>
              <Link to="/TeacherMain">課程主頁</Link>
            </Btn>
            <Btn>
              <Link to="/ManageClass">班級管理</Link>
            </Btn>
            <Btn>
              <Link to="/ManageBadge">徽章管理</Link>
            </Btn>
            <Btn>
              <Link to="/TeacherProfile">個人設定</Link>
            </Btn>
          </BtnContainer>
        </Container1>

        <Btn>
            <Link to="/AddClass">班級建立</Link>
          </Btn>

        <Container2 style={{ paddingLeft: "50px" }}>
          {/* <h4 style={{ paddingTop: "30px" }}>我的班級</h4> */}
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {classDetails.map((classItem, index) => (
                <div key={index}>
                  <p>班級名稱: {classItem.name} / 學生人數: {classItem.studentNumber}人</p>
                  <Btn>
                    <Link to={`/edit-class/${classItem.id}`}>班級編輯</Link>
                  </Btn>
                </div>
              ))}
            </div>
          )}
        </Container2>
      </Container>
    </div>
  );
}

const Btn = styled.button`
  cursor: pointer;
  width: 80px;
  height: 25px;
  a {
    text-decoration: none;
    color: #000000;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
`;

const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;
const Container1 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container2 = styled.div`
  width:100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap:20px;
`;

const ProfileImg = styled.div`
  width: 150px;
  height: 150px;
  border: 1px solid black;
  background-image: url(${(props) => props.imageURL});
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export default ManageClass;
