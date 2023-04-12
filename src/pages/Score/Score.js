import Chart from "../../components/Chart";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { useState, useEffect } from "react";
import { doc, collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { useParams } from "react-router-dom";

function Score() {
  const { lessonId } = useParams();
  const [sortedUnits, setSortedUnits] = useState([]);
  const [currentUnitId, setCurrentUnitId] = useState();

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

  const useFirestoreData = (lessonId, currentUnitId) => {
    const [data, setData] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        if (!currentUnitId) {
          return;
        }
  
        const unitRef = doc(db, "lessons", lessonId, "units", currentUnitId);
        const studentsSubmissionCollection = collection(
          unitRef,
          "students_submission"
        );
        const q = query(studentsSubmissionCollection);
        const querySnapshot = await getDocs(q);
  
        const fetchedData = {};
        querySnapshot.forEach((doc) => {
          fetchedData[doc.id] = doc.data();
        });
  
        setData(fetchedData);
      };
  
      fetchData();
    }, [lessonId, currentUnitId]);
  
    return data;
  };
  
  const fetchedData = useFirestoreData(lessonId, currentUnitId);
  const data = {};

  if (fetchedData) {
    for (const [studentId, studentData] of Object.entries(fetchedData)) {
      data[studentId] = studentData.answered;
    }
  }

  if (fetchedData === null) {
    return <div>Loading...</div>;
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
            <Chart data={data} />
          ) : (
            <div>Invalid data, please check your Firestore data structure.</div>
          )}
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
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
  select {
    pointer-events: auto;
  }
`;

export default Score;
