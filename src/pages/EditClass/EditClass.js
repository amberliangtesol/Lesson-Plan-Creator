import React, { useState, useEffect, useRef } from "react";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import "./EditClass.css";
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
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import TeacherMainSidebar from "../../components/TeacherMainSidebar";
import Footer from "../../components/Footer";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";
import arrow from "../Login/arrow.png";

const HiddenFileInput = styled.input.attrs({ type: "file" })`
  display: none;
`;

const CustomFileInputButton = styled(MainDarkBorderBtn)`
  /* Add any custom styles you want for the input button */
`;

function EditClass() {
  const { classId } = useParams();
  const [cols, setCols] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherInput, setTeacherInput] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classTeachers, setClassTeachers] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const fileInputRef = useRef();
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const fetchClassData = async (classId) => {
    const classDocRef = doc(db, "classes", classId);
    const classDoc = await getDoc(classDocRef);
    const classData = classDoc.data();
    setClassStudents(classData.students);
    setClassTeachers(classData.teachers);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      const classesQuery = collection(db, "classes");
      const querySnapshot = await getDocs(classesQuery);
      const classNames = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setClasses(classNames);
    };

    fetchClasses();

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
    if (classId) {
      fetchClassData(classId);
      setSelectedClass(classId);
    }
  }, [classId]);

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

  const handleSubmit = async () => {
    const classDocRef = doc(db, "classes", selectedClass);

    // Read the current document
    const classDoc = await getDoc(classDocRef);
    const classData = classDoc.data();

    if (selectedTeacher !== "") {
      // Update teachers field's array if the teacher is not already in the array
      if (!classData.teachers.includes(selectedTeacher)) {
        await updateDoc(classDocRef, {
          teachers: [...classData.teachers, selectedTeacher],
        });
      }

      const teacherDocRef = doc(db, "users", selectedTeacher);
      const teacherDoc = await getDoc(teacherDocRef);
      const teacherData = teacherDoc.data();

      if (!teacherData.classes.includes(selectedClass)) {
        await updateDoc(teacherDocRef, {
          classes: [...teacherData.classes, selectedClass],
        });
      }
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
                console.log("Successfully created new user:", result.data.uid);
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
  };

  const DeleteIcon = ({ onDelete }) => {
    return (
      <span onClick={onDelete}>
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
            {rows.length > 0 && <th>Delete</th>}
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    );
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
              <Link to="/ManageClass">確認修改</Link>
            </MainRedFilledBtn>
            <ClassContainer>
              <ClassContainerBox>
                <p style={{ margin: "10px" }}>班級教師</p>
                <SelectOptions>
                  {classTeachers.map((teacher, index) => (
                    <option key={index} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </SelectOptions>

                <p style={{ margin: "10px" }}>現有學生</p>
                <SelectOptions>
                  {classStudents.map((student, index) => (
                    <option key={index} value={student}>
                      {student}
                    </option>
                  ))}
                </SelectOptions>
              </ClassContainerBox>

              <ClassContainerBox>
                <p style={{ margin: "10px" }}>新增教師</p>
                <ClassInput
                  type="text"
                  value={teacherInput}
                  onChange={handleTeacherInputChange}
                  onBlur={handleTeacherInputBlur}
                  placeholder="輸入教師電子郵件"
                ></ClassInput>

                <p style={{ margin: "10px" }}>新增學生</p>
                <CustomFileInputButton
                  onClick={triggerFileInput}
                  // style={{ marginLeft: "auto" }}
                >
                  上傳帳號
                </CustomFileInputButton>
                <HiddenFileInput ref={fileInputRef} onChange={fileHandler} />
              </ClassContainerBox>
            </ClassContainer>

            {renderTable()}
          </MainContent>
        </Container>
      </Content>

      <Footer></Footer>
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
  flex-direction: column;
  flex-wrap: wrap;
  background-color: #f5f5f5;
  border-radius: 33px;
  width: 60vw;
  height: 170px;
  padding: 30px 30px;
  align-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  ${
    "" /* & > :last-child {
    justify-self: flex-end;
  } */
  }
  p {
    font-size: 20px;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }
`;

const ClassContainerBox = styled.div`
display: flex;
flex-direction: row;
align-content: center;
align-items: center;
`;

const ClassInput = styled.input`
  width: 100%;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  padding-right: 30px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
`;

const SelectOptions = styled.select`
  width: 100%;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
  appearance: none;
  background-image: url(${arrow});
  background-repeat: no-repeat;
  background-position: calc(100% - 5px) center; /* Adjusted */
  padding-right: 30px;
  text-overflow: ellipsis;
`;


export default EditClass;
