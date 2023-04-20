import Chart from "../../components/Chart";
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
import Footer from "../../components/Footer";

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
      console.log(`lessons/${lessonId}/units`);
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
        const studentsSubmissionCollection = collection(unitRef, "students_submission");
        const q = query(studentsSubmissionCollection);
        const querySnapshot = await getDocs(q);
  
        querySnapshot.forEach((doc) => {
          fetchedData[doc.id] = doc.data();
        });
        console.log("fetchedData after loop", fetchedData);
        setData(fetchedData);
      };
  
      fetchData();
    }, [lessonId, currentUnitId, students]);
  
    return data;
  };  

  const fetchedData = useFirestoreData(lessonId, currentUnitId, students);

  const currentUnit = sortedUnits.find((unit) => unit.id === currentUnitId);
  const unitQuestions = currentUnit ? currentUnit.data.test.length : 0;
  
  // Function to generate an array of empty objects
  const generateEmptyAnswers = (count) => {
    return new Array(count).fill(null).map(() => ({}));
  };
  
  // Initialize an empty data object
  const data = {};
  
  // Loop through the fetched data object
  for (const student in fetchedData) {
    if (fetchedData.hasOwnProperty(student)) {
      const studentData = fetchedData[student];
      
      // Check if studentData has an 'answered' property and it's an array
      if (studentData.hasOwnProperty('answered') && Array.isArray(studentData.answered)) {
        data[student] = studentData.answered;
      } else {
        // If studentData doesn't have an 'answered' property, set a default value
        data[student] = generateEmptyAnswers(unitQuestions);
      }
    }
  }
  
  console.log("data", data);
  

  if (fetchedData === null) {
    return (
      <div>
        <p>尚未有學生答題</p>
        <Link to="/TeacherMain">
          <Btn>回首頁</Btn>
        </Link>
      </div>
    );
  }

  const isDataValid = Object.values(data).every(
    (studentData) => Array.isArray(studentData) && studentData.length > 0
  );

  return (
    <div>
      <h3>答題狀況</h3>
      <Container>
        <Container1>
          <BtnContainer>
            <h4>單元列表</h4>
            {sortedUnits.map((unit, index) => (
              <p
                key={unit.id}
                style={{
                  color: unit.id === currentUnitId ? "red" : "black",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setCurrentUnitId(unit.id);
                }}
              >
                Unit {index + 1}: {unit.data.unitName}
              </p>
            ))}

            <Link to="/TeacherMain">
              <Btn>回首頁</Btn>
            </Link>
          </BtnContainer>
        </Container1>
        <Container2 style={{ paddingLeft: "50px", width: "1000px" }}>
          {isDataValid ? (
            <Chart data={data} students={students} />
          ) : (
            <div>Invalid data, please check your Firestore data structure.</div>
          )}
        </Container2>
      </Container>
      <Footer></Footer>
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
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
  select {
    pointer-events: auto;
  }
`;

export default Score;
