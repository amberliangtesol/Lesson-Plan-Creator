import React, { useState, useEffect, useContext } from "react";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import "./AddClass.css";
import { auth, db } from "../../utils/firebaseApp";
import {
  setDoc,
  addDoc,
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
import { UserContext } from "../../UserInfoProvider";

function AddClass() {
  const { user, setUser } = useContext(UserContext);
  const [cols, setCols] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherInput, setTeacherInput] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [useLoggedInUserEmail, setUseLoggedInUserEmail] = useState(false);

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

  const handleClassNameChange = (e) => {
    setSelectedClass(e.target.value);
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

  const createNewClass = async () => {
    const newClassDocRef = await addDoc(collection(db, "classes"), {
      name: selectedClass,
      students: [],
      teachers: [selectedTeacher],
    });
    // setSelectedClass(newClassDocRef.id);
    await updateDoc(newClassDocRef, {
      id: newClassDocRef.id,
    });
    return newClassDocRef.id;
  };

  const createOrUpdateClass = async () => {
    let classDocRef = doc(db, "classes", selectedClass);
    let classDoc = await getDoc(classDocRef);

    if (!classDoc.exists()) {
      const newClassId = await createNewClass();
      classDocRef = doc(db, "classes", newClassId);
      classDoc = await getDoc(classDocRef);
    }

    if (classDoc.exists) {
      const classData = classDoc.data();

      if (!classData.teachers.includes(selectedTeacher)) {
        await updateDoc(classDocRef, {
          teachers: [...classData.teachers, selectedTeacher],
        });
        const teacherDocRef = doc(db, "users", selectedTeacher);
        const teacherDoc = await getDoc(teacherDocRef);
        const teacherData = teacherDoc.data();

        if (!teacherData.classes.includes(classDocRef.id)) {
          await updateDoc(teacherDocRef, {
            classes: [...teacherData.classes, classDocRef.id],
          });
        }
      }

      const studentsData = rows.map((row) => ({ email: row[1], name: row[0] }));
      const newStudentsData = studentsData.filter(
        (student) => !classData.students.includes(student.email)
      );

      if (newStudentsData.length > 0) {
        const newStudentIds = newStudentsData.map((student) => student.email);
        await updateDoc(classDocRef, {
          students: [...classData.students, ...newStudentIds],
        });

        for (const student of newStudentsData) {
          const userDocRef = doc(db, "users", student.email);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // if (!userData.classes.includes(selectedClass)) {
            //   await updateDoc(userDocRef, {
            //     classes: [...userData.classes, selectedClass],
            //   });
            if (!userData.classes.includes(classDocRef.id)) { // Use classDocRef.id instead of selectedClass
              await updateDoc(userDocRef, {
                classes: [...userData.classes, classDocRef.id],
              });
            }
            console.log("userData.classes",userData.classes);
            console.log("userDoc",userDoc);
            console.log("selectedClass.id",selectedClass.id);
            
          } else {
            async function createCustomUser(student) {
              const functions = getFunctions();
              const createCustomUserFunction = httpsCallable(
                functions,
                "createCustomUser"
              );

              try {
                const result = await createCustomUserFunction({
                  email: student.email,
                  // phoneNumber: student.phoneNumber || '',
                  photoURL: student.photoURL || '',
                  password: student.email,
                  name: student.name,
                  selectedTeacher,
                  selectedClass: classDocRef.id,
                });
                if (result.data.success) {
                  console.log(
                    "Successfully created new user:",
                    result.data.uid
                  );
                } else {
                  console.error(
                    `Error creating user: ${student.email}`,
                    result.data.error
                  );
                }
              } catch (error) {
                console.error(`Error creating user: ${student.email}`, error);
              }
            }

            // Call the createCustomUser function with the student object
            createCustomUser(student);
          }
        }
      }
    } else {
      console.error("Error: Class document does not exist.");
    }
  };

  const handleSubmit = async () => {
    if (selectedTeacher) {
      await createOrUpdateClass();
    } else {
      alert("Please select a teacher before submitting.");
    }
  };

  const DeleteIcon = ({ onDelete }) => {
    return (
      <span onClick={onDelete} style={{ cursor: "pointer" }}>
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

  const handleCheckboxChange = (e) => {
    setUseLoggedInUserEmail(e.target.checked);
    if (e.target.checked) {
      setTeacherInput(user.account); // Replace loggedInUserEmail with the actual email of the logged-in user
    } else {
      setTeacherInput("");
    }
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
            <Link to="/TeacherProfile">個人設定</Link>
          </Btn>
        </BtnContainer>
      </Container1>
      <Container2 style={{ paddingLeft: "50px" }}>
        <p>班級名稱</p>
        <input
          type="text"
          value={selectedClass}
          onChange={handleClassNameChange}
          placeholder="輸入班級名稱"
        />{" "}
        <p>指派教師</p>
        <p>
          <input
            type="checkbox"
            checked={useLoggedInUserEmail}
            onChange={handleCheckboxChange}
          />
          指派自己為教師
        </p>{" "}
        <input
          type="text"
          value={teacherInput}
          onChange={handleTeacherInputChange}
          onBlur={handleTeacherInputBlur}
          placeholder="輸入教師電子郵件"
        />
        <input type="file" onChange={fileHandler} style={{ padding: "10px" }} />
        {renderTable()}
        {/* <Link to="/ManageClass"> */}
          <Btn onClick={handleSubmit}>建立帳號</Btn>
        {/* </Link> */}
      </Container2>
    </Container>
  );
}

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

export default AddClass;