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
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../UserInfoProvider";
import Header from "../../components/Header";
import TeacherMainSidebar from "../../components/TeacherMainSidebar";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";
import { RiFileExcel2Line } from "react-icons/ri";
import { MdOutlineSchool } from "react-icons/md";
import Joyride from "react-joyride";
import modal from "../../components/Modal";

const HiddenFileInput = styled.input.attrs({ type: "file" })`
  display: none;
`;

const CustomFileInputButton = styled(MainDarkBorderBtn)`
  /* Add any custom styles you want for the input button */
`;

function AddClass() {
  const navigate = useNavigate();
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
  const [runJoyride, setRunJoyride] = useState(false);
  useEffect(() => {
    // Check if the guide state is stored in the local storage
    const guideState = localStorage.getItem("addclassguide");

    if (guideState === "true") {
      // If the guide state is true, don't show the Joyride guide
      setRunJoyride(false);
    } else {
      // If the guide state is not true (first time or false), show the Joyride guide
      setRunJoyride(true);
    }
  }, []);

  // Joyride callback function to handle onFinish or onSkip event
  const handleJoyrideCallback = (data) => {
    const { status } = data;

    if (status === "finished" || status === "skipped") {
      // If the user finishes or skips the Joyride guide, set the guide state to true in local storage
      localStorage.setItem("addclassguide", "true");
    }
  };

  const [steps] = useState([
    {
      target: ".classNameInput",
      content: (
        <>
          <span
            style={{
              fontWeight: "bold",
              color: "#f46868",
            }}
          >
            Step1 輸入班級
          </span>
          <br />
          請輸入班級名稱
        </>
      ),
      disableBeacon: true,
      continuous: true,
      showSkipButton: true,
      showCloseButton: true,
      type: "continuous",
      // hideCloseButton: true,
      // showProgress: true,
      // showNextButton: true,
    },
    {
      target: ".studentTable",
      content: (
        <>
          <span
            style={{
              fontWeight: "bold",
              color: "#f46868",
            }}
          >
            Step2 新增學生
          </span>
          <br />
          可以『手動輸入姓名與帳號』
          <br />
          或以『上傳excel檔案』方式新增學生
        </>
      ),
      disableBeacon: true,
      hideCloseButton: true,
      showNextButton: true,
      // showSkipButton: true,
      // hideBackButton: true,
    },
    {
      target: ".teacherTable",
      content: (
        <>
          <span
            style={{
              fontWeight: "bold",
              color: "#f46868",
            }}
          >
            Step3 指派教師
          </span>
          <br />
          請輸入已註冊之教師帳號
        </>
      ),
      disableBeacon: true,
      hideCloseButton: true,
      showNextButton: true,
      // hideBackButton: true,
      // showSkipButton: true,
    },
  ]);

  const joyrideStyles = {
    options: {
      primaryColor: "#f46868",
      borderRadius: "25px",
    },
    buttonSkip: {
      backgroundColor: "#ffffff",
      color: "#f46868",
      borderRadius: "25px",
      paddingLeft: "15px",
      paddingRight: "15px",
      border: "2px #f46868 solid",
    },
    buttonNext: {
      backgroundColor: "#f46868",
      color: "#ffffff",
      borderRadius: "25px",
      paddingLeft: "15px",
      paddingRight: "15px",
      border: "none",
      cursor: "pointer",
    },
    tooltip: {
      backgroundColor: "#ffffff",
      borderRadius: "25px",
      textAlign: "left",
    },
    tooltipContainer: {
      textAlign: "center",
    },
    buttonBack: {
      backgroundColor: "#f46868",
      color: "#ffffff",
      borderRadius: "25px",
      paddingLeft: "15px",
      paddingRight: "15px",
      border: "none",
    },
    buttonPrimary: {
      backgroundColor: "#ffffff",
      border: "none",
    },
    buttonClose: {
      backgroundColor: "#ffffff",
      color: "#f46868",
      borderRadius: "25px",
      border: "none",
      ariaLabel: "Next",
    },
    tooltipTitle: {
      color: "#ffffff",
      fontSize: "24px",
      fontWeight: "bold",
    },
    tooltipContent: {
      fontSize: "18px",
    },
  };

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

  const fileHandler = (event) => {
    let fileObj = event.target.files[0];

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        modal.success(err);
      } else {
        let updatedCols = [...resp.cols];
        updatedCols[0].name = "姓名";
        updatedCols[1].name = "帳號";
        setCols(updatedCols);
        setRows([...rows, ...resp.rows]);
      }
    });
  };

  // console.log("selectedTeachers", selectedTeachers);
  // console.log("Selected teacher:", selectedTeacher);

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
    async function createCustomUser(student) {
      const functions = getFunctions();
      const createCustomUserFunction = httpsCallable(
        functions,
        "createCustomUser"
      );

      const result = await createCustomUserFunction({
        email: student.email,
        photoURL: student.photoURL || "",
        password: student.email,
        name: student.name,
        selectedTeacher: selectedTeacher,
      });
      if (result.data.success) {
        modal.success("成功建立學生帳號");
      } else {
        modal.success(`${student.email}帳號建立失敗`);
        throw new Error("create student account error !");
      }
    }

    const studentsData = rows.map((row) => ({ email: row[1], name: row[0] }));
    let createStuedntSuccess = false;

    try {
      if (studentsData.length > 0) {
        await Promise.all(
          studentsData.map(async (student) => {
            const userDocRef = doc(db, "users", student.email);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
              await createCustomUser(student);
            }
            return true;
          })
        );
        createStuedntSuccess = true;
      }
    } catch (e) {
      console.log(e);
    }

    if (createStuedntSuccess) {
      const newClassId = await createNewClass();
      const classDocRef = doc(db, "classes", newClassId);
      const classDoc = await getDoc(classDocRef);
      const classData = classDoc.data();
      await updateDoc(classDocRef, {
        students: [
          ...classData.students,
          ...studentsData.map((student) => student.email),
        ],
      });

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
          if (!classData.teachers.includes(teacher)) {
            await updateDoc(classDocRef, {
              teachers: [...classData.teachers, ...selectedTeachers],
            });
          }
          return true;
        })
      );

      await Promise.all(
        studentsData.map(async (student) => {
          const userDocRef = doc(db, "users", student.email);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            await updateDoc(userDocRef, {
              ...userDoc.data(),
              classes: [classDocRef.id],
            });
          }
          return true;
        })
      );
      navigate("/ManageClass");
    }
  };

  const handleSubmit = async () => {
    if (selectedTeacher) {
      await createOrUpdateClass();
      // navigate("/ManageClass");
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
      <Joyride
        steps={steps}
        styles={joyrideStyles}
        run={runJoyride} // Use the runJoyride state to control when to show the Joyride guide
        callback={handleJoyrideCallback} // Add the callback function to handle onFinish or onSkip event
      />
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
                className="classNameInput"
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
              className="studentTable"
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
              className="teacherTable"
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
              新增班級
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
