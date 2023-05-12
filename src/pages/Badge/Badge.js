import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import wow from "./BadgeAsset/wow.gif";
import badge1 from "./BadgeAsset/badge1.gif";
import badge2 from "./BadgeAsset/badge2.gif";
import { StudentMainSidebar } from "../../components/Sidebar";

function Badge() {
  const { user, setUser } = useContext(UserContext);
  const [collectedBadges, setCollectedBadges] = useState([]);
  const [usedBadges, setUsedBadges] = useState([]);
  const [collectedCounts, setCollectedCounts] = useState({});
  const [outdatedCounts, setOutdatedCounts] = useState({});

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

  const BADGE_TYPE_IMAGES = {
    badge1,
    badge2,
  };

  const Badge = ({ type }) => (
    <Container2>
      <BadgeImage src={BADGE_TYPE_IMAGES[type]}></BadgeImage>
      <BadgeText>
        目前擁有<WowWords>{collectedCounts[type] || 0}</WowWords>個
      </BadgeText>
      <BadgeText>
        已經兌換
        <WowWords>{outdatedCounts[`used${type}`] || 0}</WowWords>個
      </BadgeText>
    </Container2>
  );

  return (
    <Body>
      <Content>
        <Container>
          <StudentMainSidebar />
          <MainContent>
            <Title>我的徽章</Title>
            <Container1>
              <Wow />
              <WowText>
                可以用徽章跟老師<WowWords> 兌換獎品 </WowWords>喔！！！
              </WowText>
            </Container1>
            <SubContent>
              {["badge1", "badge2"].map((badgeType) => (
                <Badge key={badgeType} type={badgeType} />
              ))}
            </SubContent>
          </MainContent>
        </Container>
      </Content>
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

const BadgeImage = styled.div`
  width: 200px;
  height: 200px;
  background-image: url(${(props) => props.src});
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
