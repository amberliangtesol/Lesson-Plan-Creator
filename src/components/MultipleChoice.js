// MultipleChoice.js
import React, { useState } from "react";
import { MainRedFilledBtn } from "./Buttons";
import { MultipleChoiceOptionCard } from "./Buttons";
import styled from "styled-components/macro";

const MultipleChoice = ({ questionData, onAnswerClick }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleSubmitClick = () => {
    if (selectedOption) {
      onAnswerClick(selectedOption);
    } else {
      alert("請選擇一個答案");
    }
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
        {questionData.options.map((option, index) => (
          <MultipleChoiceOptionCard
            key={index}
            onClick={() => handleOptionClick(option)}
            style={
              selectedOption === option
                ? { backgroundColor: "lightyellow" }
                : {}
            }
            className={selectedOption === option ? "selected" : ""}
          >
            {option.text}
          </MultipleChoiceOptionCard>
        ))}
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
      </OptionContainer>
    </div>
  );
};

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

export default MultipleChoice;
