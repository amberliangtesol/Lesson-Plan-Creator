import React, { useState, useEffect } from "react";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import "./EditClass.css";
import { db } from "../../utils/firebaseApp";
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
// import styled from "styled-components/macro";
import { AiFillDelete } from "react-icons/ai";

function EditClass() {
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
          // Create user documents for new students
          await setDoc(userDocRef, {
            role: "student",
            id: student.email,
            name: student.name,
            createdBy: selectedTeacher,
            classes: [selectedClass],
            badge: { collected: [""], outdated: [""] },
          });
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
    <div>
      <p>EditClass</p>
      <p>選擇班級</p>
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
      <button onClick={handleSubmit}>建立帳號</button>
    </div>
  );
}

export default EditClass;
