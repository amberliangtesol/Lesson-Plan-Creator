import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components/macro";
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
import spinnerImage from "./Monster/spinnerImage.png";
import vs from "./Monster/vs.png";

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

const GameMode = ({ countdown, setCountdown }) => {
  const [gamemode, setGamemode] = useState(true);
  const [npcCountdown, setNpcCountdown] = useState(null);
  const [currentMonster, setCurrentMonster] = useState(monsterImages[0]);
  const [initialUserCountdown, setInitialUserCountdown] = useState(null);
  const [initialNpcCountdown, setInitialNpcCountdown] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const randomCountdown = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  useEffect(() => {
    setCurrentMonster(shuffleArray(monsterImages)[0]);
  }, []);

  useEffect(() => {
    if (gamemode) {
      const userCountdown = randomCountdown(10, 20); // For example, user countdown range: 10 - 20 seconds
      const npcCountdown = randomCountdown(5, 25); // For example, NPC countdown range: 5 - 25 seconds
      setCountdown(userCountdown);
      setNpcCountdown(npcCountdown);
      setInitialUserCountdown(userCountdown);
      setInitialNpcCountdown(npcCountdown);
    } else {
      setCountdown(null);
      setNpcCountdown(null);
      setInitialUserCountdown(null);
      setInitialNpcCountdown(null);
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

  useEffect(() => {
    if (countdown === 0) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [countdown]);

  return (
    <div>
      {gamemode && (
        <GameWrapper>
          <Sidebar countdown={countdown}>
            <CountdownBar
              countdown={countdown}
              initialCountdown={initialUserCountdown}
            />
          </Sidebar>
          {showPopup && <PopupText>Times Up!</PopupText>}
          <ImagesWrapper countdown={countdown}>
            <CountdownWrapper countdown={countdown}>
              剩餘作答時間 {countdown} 秒
            </CountdownWrapper>
            <ImageContainer countdown={countdown}>
              <UserImage countdown={countdown} src={user} alt="User" />
              <SpinnerContainer>
                <Vs src={vs} alt="User" />
                <SpinnerImage
                  countdown={countdown}
                  src={spinnerImage}
                  alt="Spinner"
                />
              </SpinnerContainer>
              <NpcImage countdown={countdown} src={currentMonster} alt="NPC" />
            </ImageContainer>
          </ImagesWrapper>

          <Sidebar countdown={countdown}>
            <CountdownBar
              countdown={npcCountdown}
              initialCountdown={initialNpcCountdown}
              isNpc
            />
          </Sidebar>
        </GameWrapper>
      )}
    </div>
  );
};

const GameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 30px 50px;
  background: #d9d9d9;
  border-radius: 33px;
  margin-top: 30px;
`;

const Sidebar = styled.div`
  position: relative;
  width: 30px;
  height: 350px;
  background-color: #ffffff;
  border-radius: 33px;
  margin-right: 10px;
  ${(props) =>
    props.countdown === 0 &&
    css`
      opacity: 20%;
    `}
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
  border-radius: 33px;
  bottom: 0;
  width: 100%;
  height: ${(props) => (props.isNpc ? "100%" : "100%")};
  background-color: ${(props) => (props.isNpc ? "#F46868" : "#F46868")};
  animation: ${(props) => css`
    ${props.initialCountdown}s ${countdownAnimation} linear forwards
  `};
  ${(props) =>
    props.countdown === 0 &&
    css`
      opacity: 20%;
    `}
`;

const ImageContainer = styled.div`
  z-index: 350;
  width: 70%;
  height: 70%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 100px;
  position: relative;
  p {
    font-size: 20px;
    font-weight: 600;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`;

const flyInFromLeft = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0%);
  }
`;

const flyInFromRight = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0%);
  }
`;

const flyInAnimation = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const vsAnimation = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const spinnerRotation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Vs = styled.img`
  position: absolute;
  width: 80px;
  height: 80px;
  z-index: 100;
  animation: ${vsAnimation} 1s ease-out forwards;
`;

const scaleSpinner = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const SpinnerImage = styled.img`
  position: absolute;
  width: 150px;
  height: 150px;
  animation: ${(props) =>
    props.countdown === 0
      ? "none"
      : css`
          ${spinnerRotation} 2s linear infinite,
    ${scaleSpinner} 2s linear infinite;
        `};
`;

const NpcImage = styled.img`
  width: 70%;
  height: 70%;
  animation: ${(props) =>
    props.countdown === 0
      ? "none"
      : css`
          ${flyInFromRight} 1s ease forwards, ${bounce} 1s ease 1s infinite
        `};
`;

const UserImage = styled.img`
  width: 70%;
  height: 70%;
  animation: ${(props) =>
    props.countdown === 0
      ? "none"
      : css`
          ${flyInFromLeft} 1s ease forwards, ${bounce} 2s ease 1s infinite
        `};
`;

const ImagesWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 0;
  align-items: center;
  gap: 50px;
  ${(props) =>
    props.countdown === 0 &&
    css`
      opacity: 20%;
    `}
`;

const shakeAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(0);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
`;

const redShake = css`
  background-color: #f46868;
  animation: ${(props) =>
    props.countdown === 0
      ? "none"
      : css`
          ${shakeAnimation} 0.5s linear infinite
        `};
`;

const CountdownWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  animation: ${flyInAnimation} 1s ease-out forwards;
  background-color: #a3a1a1;
  padding: 10px;
  border-radius: 33px;
  width: 250px;
  color: #ffffff;
  ${(props) => props.countdown !== null && props.countdown <= 5 && redShake}
`;

const popupAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  100% {
    opacity: 1;
    transform: translateY(-50px);
  }
`;

const PopupText = styled.div`
  position: absolute;
  font-size: 40px;
  font-weight: 700;
  color: #a3a1a1;
  animation: ${popupAnimation} 1s ease forwards;
  z-index: 400;
  opacity: 1;
`;

export default GameMode;
