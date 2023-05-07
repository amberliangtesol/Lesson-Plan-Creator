import React, { useState, useEffect, useContext } from "react";
import styled, { keyframes } from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import wow from "./wow.gif";
import badge1 from "../../components/badge1.gif";
import badge2 from "../../components/badge2.gif";
import Header from "../../components/Header";
import StudentMainSidebar from "../../components/StudentMainSidebar";
import Footer from "../../components/Footer";

function Badge() {
  const { user, setUser } = useContext(UserContext);
  const [collectedBadges, setCollectedBadges] = useState([]);
  const [usedBadges, setUsedBadges] = useState([]);
  const [collectedCounts, setCollectedCounts] = useState({});
  const [outdatedCounts, setOutdatedCounts] = useState({});

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
        const collectedCountsLocal = badgeData.collected.reduce((acc, cur) => {
          acc[cur] = (acc[cur] || 0) + 1;
          return acc;
        }, {});
        const outdatedCountsLocal = badgeData.outdated.reduce((acc, cur) => {
          acc[cur] = (acc[cur] || 0) + 1;
          return acc;
        }, {});
        setCollectedCounts(collectedCountsLocal);
        setOutdatedCounts(outdatedCountsLocal);
      }
    }

    fetchBadgeData();
  }, [user]);

  return (
    <Body>
      <Header></Header>
      <Content>
        <Container>
          <StudentMainSidebar></StudentMainSidebar>
          <MainContent>
            <Title>我的徽章</Title>
            <Container1>
              <Wow></Wow>
              <WowText>
                可以用徽章跟老師<WowWords> 兌換獎品 </WowWords>喔！！！
              </WowText>
            </Container1>
            <SubContent>
              <Container2>
                <Badge1></Badge1>
                <BadgeText>
                  目前擁有<WowWords>{collectedCounts["badge1"] || 0}</WowWords>
                  個
                </BadgeText>
                <BadgeText>
                  已經兌換
                  <WowWords>{outdatedCounts["usedbadge1"] || 0}</WowWords>個
                </BadgeText>
              </Container2>
              <Container2>
                <Badge2></Badge2>
                <BadgeText>
                  目前擁有<WowWords>{collectedCounts["badge2"] || 0}</WowWords>
                  個
                </BadgeText>
                <BadgeText>
                  已經兌換
                  <WowWords>{outdatedCounts["usedbadge2"] || 0}</WowWords>個
                </BadgeText>
              </Container2>
            </SubContent>
          </MainContent>
        </Container>
      </Content>
      <Footer></Footer>
    </Body>
  );
}
const Body = styled.div`
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

const SubContent = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: auto;
  margin-right: auto;
  gap: 30px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  margin-top: 0;
  margin-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 50px;
  padding-right: 50px;
`;

const Container1 = styled.div`
  width: 100%;
  margin-bottom: 30px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const Container2 = styled.div`
  max-width: 100%;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-start;
  align-items: center;
  border-radius: 33px;
  padding: 30px 60px;
  box-shadow: rgb(0 0 0 / 40%) 0px 1px 4px 0px;
  position: relative;
  &:hover {
    transform: translateY(-10px);
    transition: all 0.1s ease-in-out;
  }
`;

const BadgeText = styled.p`
  font-size: 18px;
  font-weight: 400;
  line-height: 29px;
  letter-spacing: 0em;
  margin: 0;
`;

const WowText = styled.p`
  font-size: 18px;
  font-weight: 600;
  line-height: 29px;
  letter-spacing: 0em;
  margin: 0;
  color: #666666;
`;

const WowWords = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #f46868;
  padding-right: 3px;
  padding-left: 3px;
`;

const Badge1 = styled.div`
  width: 200px;
  height: 200px;
  background-image: url(${badge1});
  background-size: cover;
  position: relative;
`;

const Badge2 = styled.div`
  width: 200px;
  height: 200px;
  background-image: url(${badge2});
  background-size: cover;
  position: relative;
`;

const Wow = styled.div`
  width: 70px;
  height: 70px;
  background-image: url(${wow});
  background-size: cover;
  position: relative;
`;

export default Badge;
