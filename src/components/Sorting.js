import React from "react";
import { useState } from "react";
import styled from "styled-components/macro";
import { MainRedFilledBtn } from "./Buttons";

function Sorting(props) {
  const [resultMessage, setResultMessage] = useState("");
  const [win, setWin] = useState("");
  const { sorted, questionData, onWin } = props; // destructure props here
  const correctOrder = props.sorted || [];
  const explanation = props.explanation; // Get the explanation prop
  const [dragId, setDragId] = useState();
  const [boxes, setBoxes] = useState(
    correctOrder.map((id) => ({
      id,
      order: Math.random(),
    }))
  );

  const handleDrag = (ev) => {
    setDragId(ev.currentTarget.id);
  };

  const checkWin = (boxes) => {
    const sortedBoxes = boxes.slice().sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedBoxes.length; i++) {
      if (sortedBoxes[i].id !== correctOrder[i]) {
        return false;
      }
    }
    return true;
  };

  const handleDrop = (ev) => {
    const dragBox = boxes.find((box) => box.id === dragId);
    const dropBox = boxes.find((box) => box.id === ev.currentTarget.id);

    const dragBoxOrder = dragBox.order;
    const dropBoxOrder = dropBox.order;

    const newBoxState = boxes.map((box) => {
      if (box.id === dragId) {
        box.order = dropBoxOrder;
      }
      if (box.id === ev.currentTarget.id) {
        box.order = dragBoxOrder;
      }
      return box;
    });

    setBoxes(newBoxState);
  };

  const handleSubmitClick = () => {
    if (checkWin(boxes)) {
      setResultMessage("You win!");
      setWin(true);
      props.onWin(true);
    } else {
      setResultMessage(questionData.explanation);
      setWin(false);
    }
  };

  const handleNextClick = () => {
    props.onWin(win);
  };

  const Box = ({ boxColor, boxNumber, handleDrag, handleDrop }) => {
    return (
      <SingleBox
        draggable={true}
        id={boxNumber}
        onDragOver={(ev) => ev.preventDefault()}
        onDragStart={handleDrag}
        onDrop={handleDrop}
        style={{
          backgroundColor: boxColor,
          border: "1px solid",
          borderColor: boxColor,
          borderRadius: "5px",
          color: "#FFF",
          width: "30%",
          height: "100px",
        }}
      >
        {boxNumber}
      </SingleBox>
    );
  };

  return (
    <div id="question-container">
      <OptionContainer>
        <h3
          style={{
            marginBottom: "0px",
            color: "#F46868",
          }}
        >
          第 {questionData.id} 題
        </h3>
        <p>{questionData.question}</p>
        <BoxContainer>
          {boxes
            .sort((a, b) => a.order - b.order)
            .map((box) => (
              <Box
                key={box.id}
                boxColor="#3f3f3a"
                boxNumber={box.id}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
              />
            ))}
        </BoxContainer>
        <MainRedFilledBtn
          onClick={handleSubmitClick}
          style={{
            width: "104px",
            height: "40px",
            marginTop: "10px",
            alignSelf: "flex-end",
          }}
        >
          送出答案
        </MainRedFilledBtn>
        <div
          style={{
            marginTop: "20px",
            color: resultMessage === "You win!" ? "green" : "red",
          }}
        >
          {resultMessage}
          {resultMessage !== "" && (
            <MainRedFilledBtn onClick={handleNextClick}>
              下一題
            </MainRedFilledBtn>
          )}
        </div>
      </OptionContainer>
    </div>
  );
}

const BoxContainer = styled.div`
  text-align: center;
  display: inline-flex;
  width: 1000px;
  justify-content: space-evenly;
`;

const SingleBox = styled.div`
  cursor: pointer;
`;

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 5px;
  background-color: #f5f5f5;
  border-radius: 33px;
  width: 100%;
  padding: 30px 60px 50px 60px;
`;

export default Sorting;
