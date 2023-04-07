import React, { useState, useEffect } from "react";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./AddClass.css";
import { auth, db } from "../../utils/firebaseApp";
import {
  setDoc,
  getDoc,
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import styled from "styled-components/macro";
import { AiFillDelete } from "react-icons/ai";
import { Link } from "react-router-dom";

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

function AddClass() {
  const [cols, setCols] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherInput, setTeacherInput] = useState("");
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const teachersQuery = query(
        collection(db, "users"),
        where("role", "==", "teacher")
      );
      const querySnapshot = await getDocs(teachersQuery);
      const teacherEmails = querySnapshot.docs.map((doc) => doc.data().account);
      setTeachers(teacherEmails);
    };
    fetchTeachers();
  }, []);

  const handleTeacherInputChange = (e) => {
    setTeacherInput(e.target.value);
  };

  const handleTeacherInputBlur = () => {
    if (teachers.includes(teacherInput)) {
      setSelectedTeacher(teacherInput);
    } else {
      alert("無此教師帳號");
      setTeacherInput("");
    }
  };

  const fileHandler = (event) => {
    let fileObj = event.target.files[0];

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        let updatedCols = [...resp.cols];
        updatedCols[0].name = "姓名";
        updatedCols[1].name = "帳號";
        setCols(updatedCols);
        setRows(resp.rows);
      }
    });
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleSubmit = async () => {
    const classDocRef = doc(db, "classes", selectedClass);

    // Read the current document
    const classDoc = await getDoc(classDocRef);
    const classData = classDoc.data();

    // Update teachers field's array if the teacher is not already in the array
    if (!classData.teachers.includes(selectedTeacher)) {
      await updateDoc(classDocRef, {
        teachers: [...classData.teachers, selectedTeacher],
      });
    }

    // Extract email and name columns from the rows
    const studentsData = rows.map((row) => ({ email: row[1], name: row[0] }));

    // Filter out existing student ids
    const newStudentsData = studentsData.filter(
      (student) => !classData.students.includes(student.email)
    );

    // Update students field's array if there are new student ids
    if (newStudentsData.length > 0) {
      const newStudentIds = newStudentsData.map((student) => student.email);

      await updateDoc(classDocRef, {
        students: [...classData.students, ...newStudentIds],
      });

      // Create user documents for new students
      for (const student of newStudentsData) {
        const userDocRef = doc(db, "users", student.email);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Update the classes field for existing students
          const userData = userDoc.data();
          if (!userData.classes.includes(selectedClass)) {
            await updateDoc(userDocRef, {
              classes: [...userData.classes, selectedClass],
            });
          }
        } else {
          // Create a new user account using Firebase Auth
          try {
            const { user } = await createUserWithEmailAndPassword(
              auth,
              student.email,
              student.email // Using the email as the password, but consider generating a random or default password
            );

            // Create user documents for new students
            await setDoc(userDocRef, {
              role: "student",
              account: student.email,
              uid: user.uid,
              name: student.name,
              createdBy: selectedTeacher,
              classes: [selectedClass],
              badge: { collected: [""], outdated: [""] },
            });
          } catch (error) {
            console.error(`Error creating user: ${student.email}`, error);
          }
        }
      }
    }
  };

  const DeleteIcon = ({ onDelete }) => {
    return (
      <span onClick={onDelete}>
        <AiFillDelete />
      </span>
    );
  };

  const renderRows = () => {
    return rows.map((row, rowIndex) => (
      <tr key={rowIndex}>
        {row.map((cell, cellIndex) => (
          <td key={cellIndex}>{cell}</td>
        ))}
        <td>
          <DeleteIcon
            onDelete={() => {
              const updatedRows = rows.filter((_, i) => i !== rowIndex);
              setRows(updatedRows);
            }}
          />
        </td>
      </tr>
    ));
  };

  const renderTable = () => {
    return (
      <table className="ExcelTable2007">
        <thead>
          <tr className="heading">
            {cols.map((col, index) => (
              <th key={index}>{col.name}</th>
            ))}
            {rows.length > 0 && <th>Delete</th>}
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    );
  };

  return (
    <Container>
      <Container1>
        <BtnContainer>
        <h3>班級建立</h3>
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
            <Link to="/Profile">個人設定</Link>
          </Btn>
        </BtnContainer>
      </Container1>
      <Container2 style={{ paddingLeft: '50px' }}>
        <p>班級名稱</p>
        <select value={selectedClass} onChange={handleClassChange}>
          <option value="">選擇班級</option>
          <option value="FYscpMbcfftwkaJNUjaJ">FYscpMbcfftwkaJNUjaJ</option>
          <option value="YuoUco0Vo0iFZiULsmFh">YuoUco0Vo0iFZiULsmFh</option>
        </select>
        <p>指派教師</p>
        <input
          type="text"
          value={teacherInput}
          onChange={handleTeacherInputChange}
          onBlur={handleTeacherInputBlur}
          placeholder="輸入教師電子郵件"
        />
        <input type="file" onChange={fileHandler} style={{ padding: "10px" }} />
        {renderTable()}
        <Btn onClick={handleSubmit}>建立帳號</Btn>
      </Container2>
    </Container>
  );
}

export default AddClass;