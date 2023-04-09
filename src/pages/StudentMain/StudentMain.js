import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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
  flex-direction: row;
`;

function StudentMain() {
  const { user, setUser } = useContext(UserContext);
  const [classes, setClasses] = useState([]);
  const [className, setclassName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseStatus, setCourseStatus] = useState("")


  useEffect(() => {
    const fetchClasses = async () => {
      const lessonsRef = collection(db, "lessons");
      const q = await query(lessonsRef, where("classes", "array-contains-any", user.classes));
      const results = await getDocs(q);
      setClasses(results.docs.map((d) => d.data()));
    }
    if (user.classes) {
      fetchClasses();
    }
  }, [user.classes]);


  return (
    <div>
      <h3>學生課程主頁</h3>
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

        </Container2>
      </Container>
    </div>  );
}

export default StudentMain;
