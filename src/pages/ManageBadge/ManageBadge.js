import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import badge from "./badge.png";
import { UserContext } from "../../UserInfoProvider";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import Header from "../../components/Header";
import TeacherMainSidebar from "../../components/TeacherMainSidebar";

function ManageBadge() {
  const { user, setUser } = useContext(UserContext);
  const [classNames, setClassNames] = useState([]);
  const [classDetails, setClassDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // First useEffect for fetching and setting user data
  useEffect(() => {
    async function fetchUserData() {
      if (user.name) return;

      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser({
          ...user,
          image: userData.image,
          name: userData.name,
          classes: userData.classes,
        });
      }
    }
    fetchUserData();
  }, [user.account]);

  // Second useEffect for fetching and setting class details
  useEffect(() => {
    async function fetchClassDetails() {
      if (!user.classes) return;

      const classDetails = await Promise.all(
        user.classes.map(async (classId) => {
          const classDoc = await getDoc(doc(db, "classes", classId));
          const classData = classDoc.data();

          if (!classData) {
            console.warn(`Class data not found for class ID: ${classId}`);
            return null;
          }

          return {
            name: classData.name,
            id: classData.id,
          };
        })
      );
      setClassDetails(classDetails.filter(Boolean));
      setIsLoading(false);
    }
    fetchClassDetails();
  }, [user.classes]);

  const ContainerContent = ({ description }) => {
    const [selectedClass, setSelectedClass] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedBadge, setSelectedBadge] = useState("");

    useEffect(() => {
      async function fetchStudents() {
        if (!selectedClass) {
          setStudents([]);
          setSelectedStudent("");
          setSelectedBadge("");
          return;
        }

        const classesCollectionRef = collection(db, "classes");
        const querySnapshot = await getDocs(
          query(classesCollectionRef, where("name", "==", selectedClass))
        );

        if (!querySnapshot.empty) {
          const classData = querySnapshot.docs[0].data();
          setStudents(classData.students);
        } else {
          setStudents([]);
        }
      }

      fetchStudents();
    }, [selectedClass]);

    const redeemBadge = async (student, badge) => {
      const badgeMapping = {
        準時完成作業: "badge1",
        挑戰打怪成功: "badge2",
      };

      const badgeCode = badgeMapping[badge];

      const studentRef = doc(db, "users", student);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const studentBadgeData = studentSnap.data().badge;
        const collected = Array.isArray(studentBadgeData.collected)
          ? studentBadgeData.collected
          : [];
        const outdated = Array.isArray(studentBadgeData.outdated)
          ? studentBadgeData.outdated
          : [];

        const badgeIndex = collected.indexOf(badgeCode);

        if (badgeIndex > -1) {
          const updatedCollected = [
            ...collected.slice(0, badgeIndex),
            ...collected.slice(badgeIndex + 1),
          ];
          const updatedOutdated = [...outdated, `used${badgeCode}`];

          await updateDoc(studentRef, {
            badge: {
              collected: updatedCollected,
              outdated: updatedOutdated,
            },
          });

          alert("徽章已兌換");
        } else {
          alert("該學生無該徽章");
        }
      } else {
        alert("學生資料不存在");
      }
    };

    return (
      <Container2 style={{ paddingLeft: "50px" }}>
        <p>選擇班級</p>
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedStudent("");
            setSelectedBadge("");
          }}
          style={{ width: "150px" }}
        >
          <option value="">選擇班級</option>
          {classDetails.map((classItem, index) => (
            <option key={index} value={classItem.name}>
              {classItem.name}
            </option>
          ))}
        </select>
        <p>選擇學生</p>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          style={{ width: "150px" }}
        >
          <option value="">選擇學生</option>
          {students.map((student, index) => (
            <option key={index} value={student}>
              {student}
            </option>
          ))}
        </select>
        <p>兌換徽章</p>
        <select
          value={selectedBadge}
          onChange={(e) => setSelectedBadge(e.target.value)}
          style={{ width: "150px" }}
        >
          <option value="">選擇徽章</option>
          <option value="準時完成作業">準時完成作業</option>
          <option value="挑戰打怪成功">挑戰打怪成功</option>
        </select>
        <Btn
          style={{ marginBottom: "30px" }}
          onClick={() => redeemBadge(selectedStudent, selectedBadge)}
        >
          確認兌換
        </Btn>
      </Container2>
    );
  };

  return (
    <div>
      <Header></Header>

      <Container>
        <TeacherMainSidebar></TeacherMainSidebar>
        <div>
          <h3>徽章管理</h3>
          <ContainerContent />
        </div>
      </Container>
    </div>
  );
}

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


const Container = styled.div`
  display: flex;
  flex-direction: row;
`;


const Container2 = styled.div`
  display: flex;
  flex-direction: column;
`;


export default ManageBadge;
