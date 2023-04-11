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
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
`;

const VideoImg = styled.div`
  width: 300px;
  height: 150px;
  border: 1px solid black;
  background-image: url(${(props) => props.img});
  background-size: cover;
  background-position: center;
`;

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

function TeacherMain() {
  const { user, setUser } = useContext(UserContext);
  const [classes, setClasses] = useState([]);

  console.log("teachermain_user",user)

  
  useEffect(() => {
    const fetchClasses = async () => {
      const lessonsRef = collection(db, "lessons");
      const q = await query(
        lessonsRef,
        where("classes", "array-contains-any", user.classes)
      );
      const results = await getDocs(q);
      const lessons = results.docs.map((doc) => {
        console.log(doc.id); // log the name of the lesson document
        return doc.data();
      });

      setClasses(lessons);

    };
    if (user.classes) {
      fetchClasses();
    }
  }, [user.classes]);

  console.log("classes",classes);


  return (
    <div>
      <h3>教師課程主頁</h3>
      <Container>
        <Container1>
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
          <Btn>
            <Link to="/CreateCourse">課程建立</Link>
          </Btn>
          {classes.map((c) => (
            <div key={c.name}>
              <VideoImg img={c.img}></VideoImg>
              <p>班級: {c.classes}</p>
              <p>課程名稱: {c.name}</p>
              <p>
                課程時間{" "}
                {`${formatDate(c.start_date)}~${formatDate(c.end_date)}`}
              </p>
              <Link to="/YouTubeWithQuestion">
                <Btn>進入課程</Btn>
              </Link>
              <Link to="/Score">
              <Btn>答題狀況</Btn>
              </Link>
            </div>
          ))}
        </Container2>
      </Container>
    </div>
  );
}

export default TeacherMain;
