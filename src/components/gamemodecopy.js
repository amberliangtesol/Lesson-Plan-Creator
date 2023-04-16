import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components/macro";
import monster1 from "./Monster/1.png";
import monster2 from "./Monster/2.png";
import monster3 from "./Monster/3.png";
import monster4 from "./Monster/4.png";
import monster5 from "./Monster/5.png";
import monster6 from "./Monster/6.png";
import monster7 from "./Monster/7.png";
import monster8 from "./Monster/8.png";
import monster9 from "./Monster/9.png";
import monster10 from "./Monster/10.png";
import user from "./Monster/user.png";

const monsterImages = [
  monster1,
  monster2,
  monster3,
  monster4,
  monster5,
  monster6,
  monster7,
  monster8,
  monster9,
  monster10,
];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};


const GameMode = () => {
  const [gamemode, setGamemode] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [npcCountdown, setNpcCountdown] = useState(null);
  const [currentMonster, setCurrentMonster] = useState(monsterImages[0]);

  const randomCountdown = () => {
    return [10, 15, 20][Math.floor(Math.random() * 3)];
  };

  useEffect(() => {
    setCurrentMonster(shuffleArray(monsterImages)[0]);
  }, []);

  useEffect(() => {
    if (gamemode) {
      setCountdown(randomCountdown());
      setNpcCountdown(randomCountdown());
    } else {
      setCountdown(null);
      setNpcCountdown(null);
    }
  }, [gamemode]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (npcCountdown !== null && npcCountdown > 0) {
      const timer = setTimeout(() => {
        setNpcCountdown(npcCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [npcCountdown]);


  return (
    <div>
      {gamemode && (
        <div>
          <CountdownWrapper>剩餘作答時間 {countdown} 秒</CountdownWrapper>
          <ImagesWrapper>
            <div>
              <Sidebar>
                <CountdownBar countdown={countdown} />
              </Sidebar>
              <UserImage src={user} alt="User" />
            </div>
            <div>
              <Sidebar>
                <CountdownBar countdown={npcCountdown} isNpc />
              </Sidebar>
              <NpcImage src={currentMonster} alt="NPC" />
            </div>
          </ImagesWrapper>
        </div>
      )}
    </div>
  );
};

const Sidebar = styled.div`
  position: relative;
  width: 30px;
  height: 100px;
  background-color: lightgray;
  margin-right: 10px;
`;

const countdownAnimation = keyframes`
  0% {
    height: 100%;
  }
  100% {
    height: 0;
  }
`;

const CountdownBar = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: ${(props) => (props.isNpc ? "red" : "blue")};
  animation: ${(props) => props.countdown}s ${countdownAnimation} linear
    forwards;
`;

const NpcImage = styled.img`
  width: 50px;
  height: 50px;
`;

const UserImage = styled.img`
  width: 50px;
  height: 50px;
`;

const ImagesWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 20px 0;
`;

const CountdownWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
`;

export default GameMode;
