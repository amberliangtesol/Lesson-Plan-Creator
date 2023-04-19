import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import badge1 from "./badge1.png";
import badge2 from "./badge2.png";
import usedbadge1 from "./usedbadge1.png";
import usedbadge2 from "./usedbadge2.png";
import Header from "../../components/Header";
import StudentMainSidebar from "../../components/StudentMainSidebar";

function Badge() {
  const { user, setUser } = useContext(UserContext);
  const [collectedBadges, setCollectedBadges] = useState([]);
  const [usedBadges, setUsedBadges] = useState([]);

  useEffect(() => {
    async function fetchUserData() {
      if (user.name) return;

      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData) {
          // Add this condition to check if userData is defined
          // Fetch class names
          const classNames = await Promise.all(
            userData.classes.map(async (classId) => {
              const classDoc = await getDoc(doc(db, "classes", classId));
              return classDoc.data() && classDoc.data().name;
            })
          );
          setUser({
            ...user,
            image: userData.image,
            name: userData.name,
            classes: userData.classes,
            classNames,
          });
        }
      }
    }

    fetchUserData();
  }, [user]);

  useEffect(() => {
    async function fetchBadgeData() {
      if (!user.name) return;

      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const badgeData = docSnap.data().badge;
        if (badgeData) {
          setCollectedBadges(badgeData.collected || []);
          setUsedBadges(badgeData.outdated || []);
          console.log("badgeData", badgeData);
        }
      }
    }

    fetchBadgeData();
  }, [user]);

  const renderBadge = (badgeId, index) => {
    switch (badgeId) {
      case "badge1":
        return <img key={`badge1-${index}`} src={badge1} alt="Badge 1" />;
      case "badge2":
        return <img key={`badge2-${index}`} src={badge2} alt="Badge 2" />;
      case "usedbadge1":
        return (
          <img
            key={`usedbadge1-${index}`}
            src={usedbadge1}
            alt="Used Badge 1"
          />
        );
      case "usedbadge2":
        return (
          <img
            key={`usedbadge2-${index}`}
            src={usedbadge2}
            alt="Used Badge 2"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Header></Header>
      <Container>
        <StudentMainSidebar></StudentMainSidebar>
        <div>
          <h3>徽章搜集</h3>
          <Container2 style={{ paddingLeft: "50px" }}>
            <h4>我的徽章</h4>
            <BadgeContainer>
              {collectedBadges.map((badgeId, index) =>
                renderBadge(badgeId, index)
              )}
            </BadgeContainer>
          </Container2>

          <Container2 style={{ paddingLeft: "50px" }}>
            <h4>兌換紀錄</h4>
            <BadgeContainer>
              {usedBadges.map((badgeId, index) => renderBadge(badgeId, index))}
            </BadgeContainer>
          </Container2>
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

const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;
const Container1 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: row;
`;

const ProfileImg = styled.div`
  width: 150px;
  height: 150px;
  border: 1px solid black;
  background-image: url(${(props) => props.imageURL});
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export default Badge;
