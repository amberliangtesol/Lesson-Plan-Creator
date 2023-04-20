import React, { useState, useEffect, useContext, useRef } from "react";
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
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserInfoProvider";
import Header from "../../components/Header";
import TeacherMainSidebar from "../../components/TeacherMainSidebar";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";

const HiddenFileInput = styled.input.attrs({ type: "file" })`
  display: none;
`;

const CustomFileInputButton = styled(MainDarkBorderBtn)`
  /* Add any custom styles you want for the input button */
`;

function AddClass() {
  const { user, setUser } = useContext(UserContext);
  const [cols, setCols] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherInput, setTeacherInput] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [useLoggedInUserEmail, setUseLoggedInUserEmail] = useState(false);
  const fileInputRef = useRef();
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
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
      console.log("Class document exists");
      const classData = classDoc.data();
      console.log("Class teachers:", classData.teachers);
      console.log("Selected teacher:", selectedTeacher);

      // Check removed
      console.log("Updating teacher's classes array");
      const teacherDocRef = doc(db, "users", selectedTeacher);
      const teacherDoc = await getDoc(teacherDocRef);
      const teacherData = teacherDoc.data();

      if (!teacherData.classes.includes(classDocRef.id)) {
        await updateDoc(teacherDocRef, {
          classes: [...teacherData.classes, classDocRef.id],
        });
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
            if (!userData.classes.includes(classDocRef.id)) {
              // Use classDocRef.id instead of selectedClass
              await updateDoc(userDocRef, {
                classes: [...userData.classes, classDocRef.id],
              });
            }
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
                  photoURL: student.photoURL || "",
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
        <RiDeleteBinLine />
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
            {rows.length > 0 && <th>刪除</th>}
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
    <Body>
      <Header></Header>
      <Content>
        <Container>
          <TeacherMainSidebar></TeacherMainSidebar>
          <MainContent>
            <Title>班級建立</Title>
            <MainRedFilledBtn
              onClick={handleSubmit}
              style={{ marginLeft: "auto" }}
            >
              <Link to="/ManageClass">新增班級</Link>
            </MainRedFilledBtn>

            <ClassContainer>
              {/* <p>班級</p> */}
              <ClassInput
                type="text"
                value={selectedClass}
                onChange={handleClassNameChange}
                placeholder="輸入班級名稱"
              />{" "}
              {/* <p>教師</p> */}
              <ClassInput
                type="text"
                value={teacherInput}
                onChange={handleTeacherInputChange}
                onBlur={handleTeacherInputBlur}
                placeholder="輸入教師信箱"
              />
              <p>
                <input
                  type="checkbox"
                  checked={useLoggedInUserEmail}
                  onChange={handleCheckboxChange}
                />
                指派自己
              </p>
              <CustomFileInputButton
                onClick={triggerFileInput}
                style={{ marginLeft: "auto" }}
              >
                上傳帳號
              </CustomFileInputButton>
              <HiddenFileInput ref={fileInputRef} onChange={fileHandler} />
            </ClassContainer>
            {renderTable()}
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
  display: flex;
  flex-direction: row;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  margin-top: 90px;
  margin-bottom: 90px;
  padding-right: 30px;
  padding-left: 30px;
`;

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: auto;
  margin-right: auto;
  padding-left: 50px;
  padding-right: 50px;
`;

const ClassContainer = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background-color: #f5f5f5;
  border-radius: 33px;
  width: 60vw;
  height: 83px;
  padding: 30px 60px;
  align-content: center;
  align-items: center;
  gap: 8px;
  & > :last-child {
    justify-self: flex-end;
  }
  p {
    font-size: 20px;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }
`;

const ClassInput = styled.input`
  width: 25%;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
`;

export default AddClass;
