import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components/macro";
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
import { TeacherMainSidebar } from "../../components/Sidebar";
import { MainRedFilledBtn } from "../../components/Buttons";
import arrow from "./arrow.png";
import modal from "../../components/Modal";

function ManageBadge() {
  const { user, setUser } = useContext(UserContext);
  const [classDetails, setClassDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      if (!selectedClass) {
        modal.success("請選擇班級");
        return;
      }

      if (!selectedStudent) {
        modal.success("請選擇學生");
        return;
      }

      if (!selectedBadge) {
        modal.success("請選擇徽章");
        return;
      }

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
          modal.success("徽章已兌換");
        } else {
          modal.success("該學生無該徽章");
        }
      } else {
        modal.success("學生資料不存在");
      }
    };

    return (
      <Container2>
        <SelectOptions
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedStudent("");
            setSelectedBadge("");
          }}
        >
          <option value="" disabled>
            選擇班級
          </option>
          {classDetails.map((classItem, index) => (
            <option key={index} value={classItem.name}>
              {classItem.name}
            </option>
          ))}
        </SelectOptions>
        <SelectOptions
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="" disabled>
            選擇學生
          </option>
          {students.map((student, index) => (
            <option key={index} value={student}>
              {student}
            </option>
          ))}
        </SelectOptions>
        <SelectOptions
          value={selectedBadge}
          onChange={(e) => setSelectedBadge(e.target.value)}
        >
          <option value="" disabled>
            選擇徽章
          </option>
          <option value="準時完成作業">準時完成作業</option>
          <option value="挑戰打怪成功">挑戰打怪成功</option>
        </SelectOptions>
        <ConfirmBtn
          onClick={() => {
            redeemBadge(selectedStudent, selectedBadge);
            setSelectedClass("");
            setSelectedStudent("");
            setSelectedBadge("");
          }}
        >
          確認兌換
        </ConfirmBtn>
      </Container2>
    );
  };

  return (
    <Body>
      <Content>
        <Container>
          <TeacherMainSidebar></TeacherMainSidebar>
          <MainContent>
            <Title>徽章管理</Title>
            <ContainerContent />
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

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  margin-top: 0;
  margin-bottom: 50px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 50px;
  padding-right: 50px;
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: center;
`;

const SelectOptions = styled.select`
  width: 360px;
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
  background-position: calc(100% - 20px) center;
  padding-right: 30px;
  :focus {
    outline: 2px solid #f46868;
  }
  option:checked {
    background-color: #febebe;
  }
`;

const ConfirmBtn = styled(MainRedFilledBtn)`
  font-size: 16px;
`;

export default ManageBadge;
