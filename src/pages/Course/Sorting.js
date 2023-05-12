import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import { MainRedFilledBtn } from "../../components/Buttons";

const SubmitAnsBtn = styled(MainRedFilledBtn)`
  width: 100%;
  margin-top: 10px;
  align-self: flex-end;
`;

const OptionContainerText = styled.h3`
  margin-bottom: 0px;
  color: #f46868;
`;

const QuestionContainer = styled.div`
  margin-top: 20px;
`;

const WrongMark = styled.span`
  color: red;
  font-size: 21px;
  margin-left: 20px;
`;

const CorrectMark = styled.span`
  color: green;
  font-size: 21px;
  margin-left: 20px;
`;

function Sorting(props) {
  const [win, setWin] = useState("");
  const { questionData } = props;
  const correctOrder = props.sorted || [];
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
      setWin(true);
      props.onWin(true);
    } else {
      setWin(false);
      props.onWin(false);
    }
  };

  const Box = ({ boxColor, boxNumber, handleDrag, handleDrop, win }) => {
    const [correct, setCorrect] = useState(false);

    const handleCorrectness = () => {
      if (
        boxNumber ===
        correctOrder[boxes.findIndex((box) => box.id === boxNumber)]
      ) {
        setCorrect(true);
      } else {
        setCorrect(false);
      }
    };

    useEffect(() => {
      handleCorrectness();
    }, [boxes]);

    return (
      <SingleBox
        draggable={true}
        id={boxNumber}
        onDragOver={(ev) => ev.preventDefault()}
        onDragStart={handleDrag}
        onDrop={handleDrop}
      >
        {boxNumber}
        {win !== "" && (
          <>
            {correct ? (
              <CorrectMark> ✔︎ </CorrectMark>
            ) : (
              <WrongMark> ✘ </WrongMark>
            )}
          </>
        )}
      </SingleBox>
    );
  };

  return (
    <QuestionContainer id="question-container">
      <OptionContainer>
        <OptionContainerText>第 {questionData.id} 題</OptionContainerText>
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
                cursor="grab"
                win={win}
              />
            ))}
        </BoxContainer>
        <SubmitAnsBtn onClick={handleSubmitClick}>送出答案</SubmitAnsBtn>
      </OptionContainer>
    </QuestionContainer>
  );
}

const BoxContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  width: 100%;
  justify-content: space-evenly;
`;

const SingleBox = styled.div`
  cursor: pointer;
  background-color: transparent;
  border-radius: 7px;
  color: #666666;
  width: 40%;
  padding: 20px;
  border: 2px solid #666666;
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
