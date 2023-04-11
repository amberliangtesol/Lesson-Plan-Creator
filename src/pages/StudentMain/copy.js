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

function StudentMain() {
  const { user, setUser } = useContext(UserContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      console.log("user", user);
      if (user && user.classes && user.classes.length > 0) {
        const lessonsRef = collection(db, "lessons");
        const q = await query(
          lessonsRef,
          where("classes", "array-contains-any", user.classes)
        );
        const results = await getDocs(q);
        console.log("results", results);
        const lessons = results.docs.map((doc) => {
          return doc.data();
        });

        setClasses(lessons);
      }
      setLoading(false); // Set loading to false after trying to fetch classes
    };

    fetchClasses();
  }, [user,user.classes]);

  console.log("classes", classes);
  console.log("uid", user.uid);

  return (
    <div>
      <h3>學生課程主頁</h3>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Container>
          <Container1>
            <BtnContainer>
              <Btn>
                <Link to="/StudentMain">課程主頁</Link>
              </Btn>
              <Btn>
                <Link to="/Badge">徽章搜集</Link>
              </Btn>
              <Btn>
                <Link to="/StudentProfile">個人設定</Link>
              </Btn>
            </BtnContainer>
          </Container1>
          <Container2 style={{ paddingLeft: "50px" }}>
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

export default StudentMain;