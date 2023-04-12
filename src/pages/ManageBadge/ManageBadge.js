import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import badge from "./badge.png";
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

function ManageBadge() {
  const { user, setUser } = useContext(UserContext);
  const [classNames, setClassNames] = useState([]);
  console.log(user);
  
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

        // Fetch class names
        const classNames = await Promise.all(
          userData.classes.map(async (classId) => {
            const classDoc = await getDoc(doc(db, "classes", classId));
            return classDoc.data().name;
          })
        );
        setClassNames(classNames);
      }
    }
    fetchUserData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div>
      <h3>徽章管理</h3>
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
        <Container2 style={{ paddingLeft: "50px" }}>
          <Badge />
          <p>連續答對三題</p>
          <p>選擇班級</p>
          <input></input>
          <p>選擇學生</p>
          <input></input>
          <Btn style={{ marginBottom: "30px" }}>確認兌換</Btn>
        </Container2>

        <Container2 style={{ paddingLeft: "50px" }}>
          <Badge />
          <p>準時完成作業</p>
          <p>選擇班級</p>
          <input></input>
          <p>選擇學生</p>
          <input></input>
          <Btn style={{ marginBottom: "30px" }}>確認兌換</Btn>
        </Container2>

        <Container2 style={{ paddingLeft: "50px" }}>
          <Badge />
          <p>挑戰打怪成功</p>
          <p>選擇班級</p>
          <input></input>
          <p>選擇學生</p>
          <input></input>
          <Btn style={{ marginBottom: "30px" }}>確認兌換</Btn>
        </Container2>
      </Container>
    </div>
  );
}

const Btn = styled.button`
  cursor: pointer;
  width: 70px;
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
  display: flex;
  flex-direction: column;
`;

const Badge = styled.div`
  width: 86px;
  height: 86px;
  background-image: url(${badge});
  cursor: pointer;
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

export default ManageBadge;
