import Chart from "./Chart";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { useState, useEffect } from "react";
import {
  getDoc,
  doc,
  collection,
  query,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { useParams } from "react-router-dom";
import { MainDarkBorderBtn } from "../../components/Buttons";

function Score() {
  const { lessonId } = useParams();
  const [sortedUnits, setSortedUnits] = useState([]);
  const [currentUnitId, setCurrentUnitId] = useState();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchClassesAndStudents = async () => {
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonDoc = await getDoc(lessonRef);
      const classesIds = lessonDoc.data().classes;

      const studentsData = {};

      for (const classId of classesIds) {
        const classRef = doc(db, "classes", classId);
        const classDoc = await getDoc(classRef);
        const studentsInClass = classDoc.data().students;

        for (const studentId of studentsInClass) {
          studentsData[studentId] = [];
        }
      }

      setClasses(classesIds);
      setStudents(studentsData);
    };

    fetchClassesAndStudents();
  }, [lessonId]);

  useEffect(() => {
    const fetchSortedUnits = async () => {
      const unitsCollectionRef = collection(db, `lessons/${lessonId}/units`);
      const unitsQuery = query(unitsCollectionRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(unitsQuery);
      const units = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setSortedUnits(units);
      setCurrentUnitId(units[0].id);
    };

    fetchSortedUnits();
  }, [lessonId]);

  const useFirestoreData = (lessonId, currentUnitId, students) => {
    const [data, setData] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        if (!currentUnitId || !students) {
          return;
        }

        const fetchedData = { ...students };

        const unitRef = doc(db, "lessons", lessonId, "units", currentUnitId);
        const studentsSubmissionCollection = collection(
          unitRef,
          "students_submission"
        );
        const q = query(studentsSubmissionCollection);
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          fetchedData[doc.id] = doc.data();
        });
        setData(fetchedData);
      };

      fetchData();
    }, [lessonId, currentUnitId, students]);

    return data;
  };

  const fetchedData = useFirestoreData(lessonId, currentUnitId, students);

  const currentUnit = sortedUnits.find((unit) => unit.id === currentUnitId);
  const unitQuestions = currentUnit ? currentUnit.data.test.length : 0;

  const generateEmptyAnswers = (count) => {
    return new Array(count).fill(null).map(() => ({}));
  };

  const data = {};

  for (const student in fetchedData) {
    if (fetchedData.hasOwnProperty(student)) {
      const studentData = fetchedData[student];

      if (
        studentData.hasOwnProperty("answered") &&
        Array.isArray(studentData.answered)
      ) {
        data[student] = studentData.answered;
      } else {
        data[student] = generateEmptyAnswers(unitQuestions);
      }
    }
  }

  const isDataValid = Object.values(data).every(
    (studentData) => Array.isArray(studentData) && studentData.length > 0
  );

  const isDataEmpty = Object.values(data).every(
    (studentData) => studentData.length === 0
  );

  return (
    <Body>
      <Content>
        <Container>
          <MainContent>
            <Container1>
              <BtnContainer>
                <h3
                  style={{
                    borderBottom: "3px solid #f46868",
                    paddingBottom: "18px",
                  }}
                >
                  單元列表
                </h3>
                {sortedUnits.map((unit, index) => (
                  <h3
                    key={unit.id}
                    style={{
                      color: unit.id === currentUnitId ? "#F46868" : "black",
                      fontWeight: unit.id === currentUnitId ? "700" : "400",
                      alignSelf: "flex-start",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setCurrentUnitId(unit.id);
                    }}
                  >
                    單元 {index + 1} : {unit.data.unitName}
                  </h3>
                ))}

                <MainDarkBorderBtn
                  style={{
                    position: "absolute",
                    bottom: "250px",
                    alignSelf: "center",
                  }}
                >
                  <Link to="/TeacherMain">回首頁</Link>
                </MainDarkBorderBtn>
              </BtnContainer>
            </Container1>

            <Container2>
              <Title>單元成績</Title>
              {isDataValid ? (
                <Chart data={data} students={students} />
              ) : (
                <div>
                  Invalid data, please check your Firestore data structure.
                </div>
              )}
              {isDataEmpty && <div>尚未有學生答題.</div>}
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
  margin-top: 50px;
`;

const Content = styled.div`
  flex: 1;
`;

const Container = styled.div`
  padding-top: 40px;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
`;

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  margin-top: 0;
  margin-bottom: 40px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 50px;
  padding-right: 50px;
`;

const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container1 = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  align-items: center;
  text-align: center;
  background-color: rgb(245, 245, 245);
  min-height: 100vh;
  padding-top: 90px;
  padding-left: 50px;
  padding-right: 50px;
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 50px;
  width: 60vw;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 90px;
  padding-right: 30px;
  padding-left: 30px;
  select {
    pointer-events: auto;
  }
`;

export default Score;
