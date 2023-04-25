import React, { useState, useEffect, useRef, useContext } from "react";
import styled, { keyframes, css } from "styled-components/macro";
import spinnerImage from "./Monster/spinnerImage.png";
import Badge1 from "./badge1.gif";
import Badge2 from "./badge2.gif";

const CongratsModal = ({ show, onTimeout }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onTimeout();
      }, 2000);

      return () => clearTimeout(timer); // Cleanup on unmount or when show changes
    }
  }, [show, onTimeout]);

  const text = "恭喜你得到徽章";
  const wavyTextElements = text.split("").map((char, index) => (
    <WavyText key={index} delay={index * 0.1}>
      {char}
    </WavyText>
  ));

  return (
    <ModalWrapper show={show}>
      <ModalContent>
        <YourSvg />
        <div>{wavyTextElements}</div>
      </ModalContent>
    </ModalWrapper>
  );
};

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ModalWrapper = styled.div`
  display: ${(props) => (props.show ? "block" : "none")};
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  animation: ${fadeInAnimation} 0.3s ease-in-out;
`;

const wavyTextAnimation = keyframes`
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-5px);
  }
  50% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
  }
`;

const WavyText = styled.span`
  display: inline-block;
  animation: ${wavyTextAnimation} 0.4s ease-in-out;
  animation-delay: ${(props) => props.delay}s;
  animation-iteration-count: 1;
  font-size: 23px;
  font-weight: 500;
  color: #545454;
`;

const ModalContent = styled.div`
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40vw;
  height: 40vh;
  border-radius: 33px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const YourSvg = styled.div`
  width: 300px;
  height: 300px;
  background-image: url(${Badge2});
  background-size: contain;
  background-repeat: no-repeat;
  border: 0px solid #ffffff;
`;

export default CongratsModal;
