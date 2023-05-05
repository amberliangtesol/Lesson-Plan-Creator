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
import Footer from "../../components/Footer";
import arrow from "../Login/arrow.png";
import Joyride from "react-joyride";

function Badge() {
  const { user, setUser } = useContext(UserContext);
  const [collectedBadges, setCollectedBadges] = useState([]);
  const [usedBadges, setUsedBadges] = useState([]);
  const [runJoyride, setRunJoyride] = useState(false);
  useEffect(() => {
    // Check if the guide state is stored in the local storage
    const guideState = localStorage.getItem("badgeguide");

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
      localStorage.setItem("badgeguide", "true");
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
      showCloseButton: true,
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
            src={badge1}
            alt="Used Badge 1"
            style={{ opacity: 0.5 }}
          />
        );
      case "usedbadge2":
        return (
          <img
            key={`usedbadge2-${index}`}
            src={badge2}
            alt="Used Badge 2"
            style={{ opacity: 0.5 }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Body>
      <Header></Header>
      <Content>
        <Container>
          <StudentMainSidebar></StudentMainSidebar>
          <MainContent>
            <Title>徽章搜集</Title>
            <Container2>
              <h4>我的徽章</h4>
              <BadgeContainer>
                {collectedBadges.map((badgeId, index) =>
                  renderBadge(badgeId, index)
                )}
              </BadgeContainer>
            </Container2>

            <Container2>
              <h4>兌換紀錄</h4>
              <BadgeContainer>
                {usedBadges.map((badgeId, index) =>
                  renderBadge(badgeId, index)
                )}
              </BadgeContainer>
            </Container2>
          </MainContent>
        </Container>
      </Content>

      <Footer></Footer>
    </Body>
  );
}
const Body = styled.div`
  ${"" /* min-height: 100vh; */}
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
  width: 70%;
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
  gap: 20px;
  width: 100%;
  padding: 30px 60px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 33px;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export default Badge;
