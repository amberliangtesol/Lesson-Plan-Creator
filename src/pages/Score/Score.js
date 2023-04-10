import Chart from "../../components/Chart";
import React from "react";
import useFirestoreData from "./useFirestoreData";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";

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

function Score() {
  const collectionName = "students_submission";
  const fetchedData = useFirestoreData(collectionName);

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
      {isDataValid ? (
        <Chart data={data} />
      ) : (
        <div>Invalid data, please check your Firestore data structure.</div>
      )}
      <Link to="/TeacherMain">
        <Btn>回首頁</Btn>
      </Link>
    </div>
  );
}

export default Score;
