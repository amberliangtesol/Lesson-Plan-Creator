import React from "react";
import { useState } from "react";
import styled from "styled-components/macro";

const BoxContainer = styled.div`
  text-align: center;
  display: inline-flex;
  width: 1000px;
  justify-content: space-evenly;
`;

const SingleBox = styled.div`
  cursor: pointer;
`;

function Sorting(props) {
  const correctOrder = props.sorted || [];
  const explanation = props.explanation; // Get the explanation prop
  const [dragId, setDragId] = useState();
  const [boxes, setBoxes] = useState(
    correctOrder.map((id) => ({
      id,
      order: Math.random()
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
      alert("You win!");
      props.onWin(true);
    } else {
      alert(explanation);
      props.onWin(false);
    }
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
          height: "100px"
        }}
      >
        {boxNumber}
      </SingleBox>
    );
  };

  return (
    <>
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
      <button onClick={handleSubmitClick}>送出答案</button>
    </>
  );
}

export default Sorting;
