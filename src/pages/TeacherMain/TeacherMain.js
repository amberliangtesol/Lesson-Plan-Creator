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

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

function TeacherMain() {
  const { user, setUser } = useContext(UserContext);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageURL, setImageURL] = useState("");
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [classNames, setClassNames] = useState([]);

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

  useEffect(() => {
    const fetchClasses = async () => {
      if (
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
      }
      setLoading(false);
    };

    fetchClasses();
  }, [lessons, user]);

  return (
    <div>
      <h3>教師課程主頁</h3>

      {loading ? (
        <div>Loading...</div>
      ) : (
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
            <Btn>
              <Link to="/CreateCourse">課程建立</Link>
            </Btn>
            {lessons.map((c, index) => (
              <div key={index}>
                <VideoImg img={c.img}></VideoImg>
                <p>班級: {c.classes}</p>
                <p>課程名稱: {c.name}</p>
                <p>
                  課程時間{" "}
                  {`${formatDate(c.start_date)}~${formatDate(c.end_date)}`}
                </p>
                <Link to={`/YouTubeWithQuestion/${c.id}`}>
                  <Btn>進入課程</Btn>
                </Link>
                <Link to="/Score">
                  <Btn>答題狀況</Btn>
                </Link>
              </div>
            ))}
          </Container2>
        </Container>
      )}
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

const VideoImg = styled.div`
  width: 300px;
  height: 150px;
  border: 1px solid black;
  background-image: url(${(props) => props.img});
  background-size: cover;
  background-position: center;
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

export default TeacherMain;
