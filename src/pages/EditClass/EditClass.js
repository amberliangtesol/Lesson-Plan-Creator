import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../utils/firebaseApp";
import {
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
import { UserContext } from "../../UserInfoProvider";
import { TeacherMainSidebar } from "../../components/Sidebar";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";
import { MdOutlineSchool } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { useParams } from "react-router-dom";
import modal from "../../components/Modal";

function EditClass() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [teacherInput, setTeacherInput] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [teachersName, setTeachersName] = useState([]);
  const [useLoggedInUserEmail, setUseLoggedInUserEmail] = useState(false);
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

  const fetchClassData = async (classId) => {
    const classDocRef = doc(db, "classes", classId);
    const classDoc = await getDoc(classDocRef);
    const classData = classDoc.data();
    setRows(classData.students);
    setSelectedTeachers(classData.teachers);
    setSelectedClass(classData.name);

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
    if (!teachers.includes(teacherEmailInput)) {
      modal.success("無此教師帳號!");
      return;
    }
    if (teacherEmailInput && !selectedTeachers.includes(teacherEmailInput)) {
      setSelectedTeachers([...selectedTeachers, teacherEmailInput]);
      setTeachersName([...teachersName, teacherEmailInput]);
      setTeacherEmailInput("");
    }
  };

  const renderStudentTable = () => {
    return (
      <ExcelTable2007
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
      </ExcelTable2007>
    );
  };

  const renderTeacherTable = () => {
    return (
      <ExcelTable2007
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
      </ExcelTable2007>
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

  const createOrUpdateClass = async () => {
    const classDocRef = doc(db, "classes", classId);
    const classDoc = await getDoc(classDocRef);

    if (classDoc.exists()) {
      const classData = classDoc.data();

      await Promise.all(
        selectedTeachers.map(async (teacher) => {
          const teacherDocRef = doc(db, "users", teacher);
          const teacherDoc = await getDoc(teacherDocRef);
          const teacherData = teacherDoc.data();

          if (!teacherData.classes.includes(classDocRef.id)) {
            await updateDoc(teacherDocRef, {
              classes: [...teacherData.classes, classDocRef.id],
            });
          }
          if (classData) {
            await updateDoc(classDocRef, {
              name: selectedClass,
            });
          }
          await updateDoc(classDocRef, {
            teachers: [...selectedTeachers],
          });
          return true;
        })
      );

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
        let createStuedntSuccess = false;
        await Promise.all(
          newStudentsData.map(async (student) => {
            const userDocRef = doc(db, "users", student.email);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (!userData.classes.includes(classDocRef.id)) {
                await updateDoc(userDocRef, {
                  classes: [...userData.classes, classDocRef.id],
                });
              }
              createStuedntSuccess = true;
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
                    modal.success("成功建立學生帳號");
                    createStuedntSuccess = true;
                  } else {
                    modal.success(`${student.email}帳號建立失敗`);
                  }
                } catch (error) {
                  createStuedntSuccess = false;
                  console.error(`Error creating user: ${student.email}`, error);
                }
              }
              await createCustomUser(student);
            }
            return true;
          })
        );
        if (createStuedntSuccess) {
          const newStudentIds = newStudentsData.map((student) => student.email);
          await updateDoc(classDocRef, {
            students: [...classData.students, ...newStudentIds],
          });
          navigate("/ManageClass");
        }
      } else {
        await updateDoc(classDocRef, {
          students: studentsData.map((s) => s.email),
        });
        navigate("/ManageClass");
      }
    } else {
      console.error("Error: Class document does not exist.");
    }
  };

  const handleSubmit = async () => {
    if (selectedTeacher) {
      await createOrUpdateClass();
    } else {
      modal.success("請選擇至少一位教師");
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
    const loggedInUserEmail = user.account;
    setSelectedTeacher(loggedInUserEmail);
    if (useLoggedInUserEmail) {
      setTeacherInput(loggedInUserEmail);
    }
  }, [user.account, useLoggedInUserEmail]);

  return (
    <Body>
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
                  maxLength={20}
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
                maxLength={10}
              />
              <ClassInput
                type="text"
                value={studentEmailInput}
                onChange={(e) => setStudentEmailInput(e.target.value)}
                placeholder="輸入信箱"
                maxLength={256}
              />
              <MainDarkBorderBtn
                onClick={handleAddStudentEmail}
                style={{ cursor: "pointer", marginLeft: "5px" }}
              >
                新增學生
              </MainDarkBorderBtn>
            </StudentTable>
            <p style={{ fontSize: "15px", margin: "0px" }}>
              ⚠️
              未曾註冊之信箱將自動『建立帳號』，系統預設初始『帳號』與『密碼』相同
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
                style={{ width: "100%" }}
                placeholder="輸入信箱"
                maxLength={256}
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
  padding-top: 50px;
`;

const Content = styled.div`
  flex: 1;
  height: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
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

const ExcelTable2007 = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  font-size: 14px;
  border-radius: 20px;
  border: #545454 2px solid;

  th {
    padding: 10px 30px;
    text-align: left;
    font-size: 16px;
    color: #ffffff;
    background-color: #545454;
    border-bottom: solid 2px #545454;
    width: 40%;

    &:first-child {
      border-top-left-radius: 13px;
    }

    &:last-child {
      border-top-right-radius: 13px;
      width: 20%;
    }
  }

  td {
    padding: 10px 30px;
    font-size: 16px;
  }

  tr:last-child {
    td:first-child {
      border-bottom-left-radius: 13px;
    }

    td:last-child {
      border-bottom-right-radius: 13px;
    }
  }
`;

export default EditClass;
