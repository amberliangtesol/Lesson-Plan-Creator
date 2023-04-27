import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import "./EditClass.css";
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
import { FiEdit } from "react-icons/fi";
import { useParams } from "react-router-dom";

const HiddenFileInput = styled.input.attrs({ type: "file" })`
  display: none;
`;

const CustomFileInputButton = styled(MainDarkBorderBtn)`
  /* Add any custom styles you want for the input button */
`;

function EditClass() {
  const navigate = useNavigate();

  const { classId } = useParams();
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
  const [inputFocused, setInputFocused] = useState(false);
  const [studentName, setStudentName] = useState([]);

  const fetchStudents = async (studentsEmails) => {
    if (!studentsEmails || studentsEmails.length === 0) {
      console.error("The studentEmailList array is empty.");
      return;
    }

    const studentsQuery = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("account", "in", studentsEmails)
    );
    const querySnapshot = await getDocs(studentsQuery);
    const studentsName = querySnapshot.docs.map((doc) => ({
      name: doc.data().name,
      email: doc.data().account,
    }));
    setStudentName(studentsName);
  };

  console.log("classId:", classId);

  const fetchClassData = async (classId) => {
    const classDocRef = doc(db, "classes", classId);
    const classDoc = await getDoc(classDocRef);
    const classData = classDoc.data();
    setRows(classData.students);
    setSelectedTeachers(classData.teachers);
    setSelectedClass(classData.name);
    console.log("classData.students:", classData.students); // Add this line to debug

    if (classData.students && classData.students.length > 0) {
      fetchStudents(classData.students);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      const classesQuery = collection(db, "classes");
      const querySnapshot = await getDocs(classesQuery);
      const classNames = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setSelectedClass(classNames);
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

  useEffect(() => {
    if (rows && rows.length > 0) {
      fetchStudents(rows);
    }
  }, [rows]);

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

  console.log("selectedTeachers", selectedTeachers);

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
          {selectedTeachers.map((teacher, index) => {
            const teacherIndex = teachers.indexOf(teacher);
            if (teacherIndex === -1 || !teachersName[teacherIndex]) {
              return null;
            }
            return (
              <tr key={index}>
                <td>{teachersName[teacherIndex]}</td>
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
            );
          })}
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
    } else {
      alert("無此教師帳號");
    }
  };

  const fileHandler = (event) => {
    let fileObj = event.target.files[0];

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      console.log(resp);
      if (err) {
        console.log(err);
      } else {
        let updatedCols = [...resp.cols];
        updatedCols[0].name = "姓名";
        updatedCols[1].name = "帳號";
        setCols(updatedCols);
        setRows([...rows, ...resp.rows]);
      }
    });
  };

  const createOrUpdateClass = async () => {
    const classDocRef = doc(db, "classes", classId);
    const classDoc = await getDoc(classDocRef);

    if (classDoc.exists()) {
      const classData = classDoc.data();
      for (const selectedTeacher of selectedTeachers) {
        const teacherDocRef = doc(db, "users", selectedTeacher);
        const teacherDoc = await getDoc(teacherDocRef);
        const teacherData = teacherDoc.data();

        if (!teacherData.classes.includes(classDocRef.id)) {
          await updateDoc(teacherDocRef, {
            classes: [...teacherData.classes, classDocRef.id],
          });
        }
      }

      if (classData) {
        await updateDoc(classDocRef, {
          name: selectedClass,
        });
      }

      await updateDoc(classDocRef, {
        teachers: [...selectedTeachers],
      });

      const studentsData = rows.map((row, idx) => {
        const email = Array.isArray(row) ? row[1] : row;
        let name;
        if (Array.isArray(row)) {
          name = row[0];
        } else {
          const student = studentName.find((s) => s.email === email);
          name = student.name;
        }
        return { name, email };
      });
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
      } else {
        await updateDoc(classDocRef, {
          students: studentsData.map((s) => s.email),
        });
      }
    } else {
      console.error("Error: Class document does not exist.");
    }
  };

  const handleSubmit = async () => {
    if (selectedTeacher) {
      await createOrUpdateClass();
      navigate("/ManageClass");
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

  console.log("rows", rows);
  const renderRows = () => {
    return rows.map((row, rowIndex) => {
      const email = Array.isArray(row) ? row[1] : row;
      let name;
      if (Array.isArray(row)) {
        name = row[0];
      } else {
        const student = studentName.find((s) => s.email === email);
        name = student?.name;
      }

      return (
        <tr key={rowIndex}>
          <td>{name}</td>
          <td>{email}</td>
          <td>
            <DeleteIcon
              onDelete={() => {
                const updatedRows = rows.filter((_, i) => i !== rowIndex);
                setRows(updatedRows);
              }}
            />
          </td>
        </tr>
      );
    });
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
              <div style={{ position: "relative", width: "100%" }}>
                <ClassNameInput
                  type="text"
                  value={selectedClass}
                  onChange={handleClassNameChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="輸入名稱"
                />

                {!inputFocused && (
                  <FiEdit
                    style={{
                      position: "absolute",
                      right: "0",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      fontSize: "20px",
                      color: "#F46868",
                    }}
                  />
                )}
              </div>
              {/* <HiddenFileInput ref={fileInputRef} onChange={fileHandler} /> */}
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
              {/* <CustomFileInputButton
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
              </CustomFileInputButton> */}
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
              確認修改
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

export default EditClass;
