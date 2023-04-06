import React, { useState, useEffect } from "react";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import "./EditClass.css";
import { db } from "../../utils/firebaseApp";
import { setDoc, getDoc, doc, updateDoc, collection, getDocs, query, where  } from "firebase/firestore";

function EditClass() {
  const [cols, setCols] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherInput, setTeacherInput] = useState("");
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const teachersQuery = query(collection(db, "users"), where("role", "==", "teacher"));
      const querySnapshot = await getDocs(teachersQuery);
      const teacherEmails = querySnapshot.docs.map((doc) => doc.data().account);
      setTeachers(teacherEmails);
      // console.log("teacherEmails",teacherEmails);
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
        setCols(resp.cols);
        setRows(resp.rows);
      }
    });
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  // const handleTeacherChange = (e) => {
  //   setSelectedTeacher(e.target.value);
  // };
  

  const handleSubmit = async () => {
    const classDocRef = doc(db, "classes", selectedClass);
  
    // Read the current document
    const classDoc = await getDoc(classDocRef);
    let classData;
    if (classDoc.exists()) {
      classData = classDoc.data();
    } else {
      // Create a new document if it doesn't exist
      await setDoc(classDocRef, {
        teachers: [],
        students: [],
        id:selectedClass,
        name:""
      });
      classData = {
        teachers: [],
        students: [],
        id:selectedClass,
        name:""
      };
    }
  
    // Check if classData.teachers is defined
    if (!classData.teachers) {
      // Initialize the teachers field if it's undefined
      await updateDoc(classDocRef, {
        teachers: [],
      });
      classData.teachers = [];
    }
  
    // Update teachers field's array if the teacher is not already in the array
    if (!classData.teachers.includes(selectedTeacher)) {
      await updateDoc(classDocRef, {
        teachers: [...classData.teachers, selectedTeacher],
      });
    }
  
    // Extract email and name columns from the rows (assuming email is in the second column and name in the first column)
    const studentsData = rows.map((row) => ({ email: row[1], name: row[0] }));
  
    // Filter out existing student ids
    const newStudentsData = studentsData.filter((student) => !classData.students.includes(student.email));
  
    // Update students field's array if there are new student ids
    if (newStudentsData.length > 0) {
      const newStudentIds = newStudentsData.map((student) => student.email);
  
      await updateDoc(classDocRef, {
        students: [...classData.students, ...newStudentIds],
      });
  
      // Create user documents for new students
      for (const student of newStudentsData) {
        const userDocRef = doc(db, "users", student.email);
        await setDoc(userDocRef, {
          role: "student",
          id: student.email,
          name: student.name,
          createdBy: selectedTeacher,
          class: selectedClass,
          badge: { collected: [""], outdated: [""] },
        });
      }
    }
  };
  

  return (
    <div>
      <p>EditClass</p>
      <p>選擇班級</p>
      <select value={selectedClass} onChange={handleClassChange}>
        <option value="">選擇班級</option>
        <option value="classA">classA</option>
        <option value="classB">classB</option>
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
      <OutTable
        data={rows}
        columns={cols}
        tableClassName="ExcelTable2007"
        tableHeaderRowClass="heading"
      />
      <button onClick={handleSubmit}>建立帳號</button>
    </div>
  );
}

export default EditClass;

// users collection > users doc > field role as teacher
// users collection > email as doc name > set role field as student
