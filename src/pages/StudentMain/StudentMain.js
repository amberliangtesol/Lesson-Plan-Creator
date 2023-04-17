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
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageURL, setImageURL] = useState("");
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [classNames, setClassNames] = useState([]);

  useEffect(() => {
    async function fetchUserData() {
      if (user.classNames) return;

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
              return classDoc.data() && classDoc.data().name;
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

  function getClassNameById(classId) {
    const index = user.classes.findIndex((id) => id === classId);
    return (user.classNames || [])[index] || "";
  }

  function isCourseOutdated(course) {
    const currentDate = new Date();
    const endDate = new Date(course.end_date);
    return endDate < currentDate;
  }

  return (
    <div>
      <h3>學生課程主頁</h3>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Container>
          <Container1>
            <ProfileImg imageURL={user.image}></ProfileImg>
            <p>Hello {user.name}!</p>
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
          {/* <Container2 style={{ paddingLeft: "50px" }}>
            {lessons.map((c, index) => (
              <div key={index}>
                <VideoImg img={c.img}></VideoImg>
                <p>
                  班級:{" "}
                  {c.classes.map((classId) => (
                    <span key={classId}>{getClassNameById(classId)} </span>
                  ))}
                </p>{" "}
                <p>課程名稱: {c.name}</p>
                <p>
                  課程時間{" "}
                  {`${formatDate(c.start_date)}~${formatDate(c.end_date)}`}
                </p>
                <Link to={`/YouTubeWithQuestion/${c.id}`}>
                  <Btn>進入課程</Btn>
                </Link>
              </div>
            ))}
          </Container2> */}
          <div>
            <Container2 style={{ paddingLeft: "50px" }}>
              <h4>進行中課程</h4>
              {lessons
                .filter((c) => !isCourseOutdated(c))
                .map((c, index) => (
                  <OutdatedCourse key={index} outdated={false}>
                    <VideoImg img={c.img}></VideoImg>
                    <p>
                      班級:{" "}
                      {c.classes.map((classId) => (
                        <span key={classId}>{getClassNameById(classId)} </span>
                      ))}
                    </p>
                    <p>課程名稱: {c.name}</p>
                    <p>
                      課程時間{" "}
                      {`${formatDate(c.start_date)}~${formatDate(c.end_date)}`}
                    </p>
                    <Link to={`/YouTubeWithQuestion/${c.id}`}>
                  <Btn>進入課程</Btn>
                </Link>
                  </OutdatedCourse>
                ))}
            </Container2>

            <Container2 style={{ paddingLeft: "50px" }}>
              <h4>已完成課程</h4>
              {lessons
                .filter((c) => isCourseOutdated(c))
                .map((c, index) => (
                  <OutdatedCourse key={index} outdated>
                    <VideoImg img={c.img}></VideoImg>
                    <p>
                      班級:{" "}
                      {c.classes.map((classId) => (
                        <span key={classId}>{getClassNameById(classId)} </span>
                      ))}
                    </p>
                    <p>課程名稱: {c.name}</p>
                    <p>
                      課程時間{" "}
                      {`${formatDate(c.start_date)}~${formatDate(c.end_date)}`}
                    </p>
                    <Link to={`/YouTubeWithQuestion/${c.id}`}>
                  <Btn>進入課程</Btn>
                </Link>
                  </OutdatedCourse>
                ))}
            </Container2>
          </div>
        </Container>
      )}
    </div>
  );
}

const Btn = styled.button`
  cursor: pointer;
  width: 100px;
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
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
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

const OutdatedCourse = styled.div`
  ${({ outdated }) =>
    outdated &&
    `
    opacity: 0.5;
    pointer-events: none;
  `}
`;

export default StudentMain;
