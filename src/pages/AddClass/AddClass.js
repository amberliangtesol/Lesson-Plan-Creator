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
import { RiFileExcel2Line } from "react-icons/ri";
import { MdOutlineSchool } from "react-icons/md";

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
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [teacherInput, setTeacherInput] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [teachersName, setTeachersName] = useState([]);
  const [useLoggedInUserEmail, setUseLoggedInUserEmail] = useState(false);
  const fileInputRef = useRef();
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  const [studentEmailInput, setStudentEmailInput] = useState("");
  const [studentNameInput, setStudentNameInput] = useState("");
  const [teacherEmailInput, setTeacherEmailInput] = useState("");

  const handleAddStudentEmail = () => {
    if (studentEmailInput && studentNameInput) {
      setRows([...rows, [studentNameInput, studentEmailInput]]);
      setStudentNameInput("");
      setStudentEmailInput("");
    }
  };

  const handleAddTeacherEmail = () => {
    if (teacherEmailInput && !selectedTeachers.includes(teacherEmailInput)) {
      setSelectedTeachers([...selectedTeachers, teacherEmailInput]);
      setTeachersName([...teachersName, teacherEmailInput]);
      setTeacherEmailInput("");
    }
  };

  const renderStudentTable = () => {
    return (
      <table
        className="ExcelTable2007"
        style={rows.length === 0 ? { border: "none" } : {}}
      >
        {rows.length > 0 && (
          <thead>
            <tr className="heading">
              <th>姓名</th>
              <th>帳號</th>
              <th>刪除</th>
            </tr>
          </thead>
        )}
        <tbody>{renderRows()}</tbody>
      </table>
    );
  };

  const renderTeacherTable = () => {
    return (
      <table
        className="ExcelTable2007"
        style={selectedTeachers.length === 0 ? { border: "none" } : {}}
      >
        {selectedTeachers.length > 0 && (
          <thead>
            <tr className="heading">
              <th>姓名</th>
              <th>帳號</th>
              <th>刪除</th>
            </tr>
          </thead>
        )}
        <tbody>
          {selectedTeachers.map((teacher, index) => (
            <tr key={index}>
              <td>{teachersName[teachers.indexOf(teacher)]}</td>
              <td>{teacher}</td>
              <td>
                <DeleteIcon
                  onDelete={() => {
                    setSelectedTeachers(
                      selectedTeachers.filter((_, i) => i !== index)
                    );
                    setTeacherInput("");
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      const teachersQuery = query(
        collection(db, "users"),
        where("role", "==", "teacher")
      );
      const querySnapshot = await getDocs(teachersQuery);
      const teacherEmails = querySnapshot.docs.map((doc) => doc.data().account);
      const teacherNames = querySnapshot.docs.map((doc) => doc.data().name);
      setTeachers(teacherEmails);
      setTeachersName(teacherNames);
    };
    fetchTeachers();
  }, []);

  const handleClassNameChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleTeacherInputBlur = () => {
    if (teachers.includes(teacherEmailInput)) {
      // setSelectedTeacher(teacherEmailInput);
      // alert("有此教師帳號");
    } else {
      alert("無此教師帳號");
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

  console.log("selectedTeachers", selectedTeachers);
  console.log("Selected teacher:", selectedTeacher);

  const createNewClass = async () => {
    const newClassDocRef = await addDoc(collection(db, "classes"), {
      name: selectedClass,
      students: [],
      teachers: selectedTeachers,
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
      for (const selectedTeacher of selectedTeachers) {
        console.log("Updating teacher's classes array for", selectedTeacher);
        const teacherDocRef = doc(db, "users", selectedTeacher);
        const teacherDoc = await getDoc(teacherDocRef);
        const teacherData = teacherDoc.data();

        if (!teacherData.classes.includes(classDocRef.id)) {
          await updateDoc(teacherDocRef, {
            classes: [...teacherData.classes, classDocRef.id],
          });
        }
      }

      if (!classData.teachers.includes(selectedTeachers[0])) {
        await updateDoc(classDocRef, {
          teachers: [...classData.teachers, ...selectedTeachers],
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
                  photoURL: student.photoURL || "",
                  password: student.email,
                  name: student.name,
                  selectedTeacher: selectedTeacher,
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
      <span
        onClick={onDelete}
        style={{ cursor: "pointer", paddingLeft: "7px" }}
      >
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

  const handleCheckboxChange = (e) => {
    setUseLoggedInUserEmail(e.target.checked);
    if (e.target.checked) {
      setTeacherInput(user.account); // Replace loggedInUserEmail with the actual email of the logged-in user
    } else {
      setTeacherInput("");
    }
  };

  useEffect(() => {
    const loggedInUserEmail = user.account; // Replace with the actual email of the logged-in user
    setSelectedTeacher(loggedInUserEmail);
    if (useLoggedInUserEmail) {
      setTeacherInput(loggedInUserEmail);
    }
  }, [user.account, useLoggedInUserEmail]);

  return (
    <Body>
      <Header></Header>
      <Content>
        <Container>
          <TeacherMainSidebar></TeacherMainSidebar>
          <MainContent>
            <div style={{ display: "flex", alignItems: "center" }}>
              <MdOutlineSchool
                style={{ marginRight: "20px", fontSize: "40px" }}
              />
              <h2 style={{ marginRight: "20px", whiteSpace: "nowrap" }}>
                班級
              </h2>
              <ClassNameInput
                type="text"
                value={selectedClass}
                onChange={handleClassNameChange}
                placeholder="輸入名稱"
              ></ClassNameInput>
              <HiddenFileInput ref={fileInputRef} onChange={fileHandler} />
            </div>

            <Splict></Splict>

            <StudentTable
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "30px",
              }}
            >
              <h2 style={{ marginRight: "20px", whiteSpace: "nowrap" }}>
                學生
              </h2>
              <ClassInput
                type="text"
                value={studentNameInput}
                onChange={(e) => setStudentNameInput(e.target.value)}
                placeholder="輸入姓名"
              />
              <ClassInput
                type="text"
                value={studentEmailInput}
                onChange={(e) => setStudentEmailInput(e.target.value)}
                placeholder="輸入信箱"
              />
              <MainDarkBorderBtn
                onClick={handleAddStudentEmail}
                style={{ cursor: "pointer", marginLeft: "5px" }}
              >
                新增學生
              </MainDarkBorderBtn>
              <CustomFileInputButton
                onClick={triggerFileInput}
                style={{ marginLeft: "auto", padding: "5px" }}
              >
                <RiFileExcel2Line
                  style={{
                    fontSize: "20px",
                    marginRight: "5px",
                    color: "#1d6f42",
                  }}
                />
                上傳
              </CustomFileInputButton>
            </StudentTable>
            <p style={{ fontSize: "15px", margin: "0px" }}>
              * 未曾註冊之信箱將『建立帳號』，系統預設初始『帳號』與『密碼』相同
            </p>
            {renderStudentTable()}

            <TeacherTable
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "30px",
              }}
            >
              <h2 style={{ marginRight: "20px", whiteSpace: "nowrap" }}>
                教師
              </h2>
              <ClassInput
                type="text"
                value={teacherEmailInput}
                onChange={(e) => setTeacherEmailInput(e.target.value)}
                onBlur={handleTeacherInputBlur}
                style={{ width: "100%" }}
                placeholder="輸入信箱"
              />
              <MainDarkBorderBtn
                onClick={handleAddTeacherEmail}
                style={{ cursor: "pointer", marginLeft: "5px" }}
              >
                新增教師
              </MainDarkBorderBtn>
            </TeacherTable>

            {renderTeacherTable()}

            <MainRedFilledBtn
              onClick={handleSubmit}
              style={{ width: "100%", marginTop: "30px" }}
            >
              <Link to="/ManageClass">新增班級</Link>
            </MainRedFilledBtn>
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

const StudentTable = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;

const TeacherTable = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;

const ClassInput = styled.input`
  width: 50%;
  height: 35px;
  background-color: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
  option:checked {
    background-color: #febebe;
  }
  :focus {
    outline: 2px solid #f46868;
  }
`;

const ClassNameInput = styled.input`
  width: 100%;
  height: 35px;
  font-size: 18px;
  padding-left: 15px;
  border-radius: 24px;
  border: none;
  :focus {
    outline: 2px solid #f46868;
  }
`;

const Splict = styled.div`
  border-bottom: solid 2px #f46868;
  width: 60vw;
`;

export default AddClass;
