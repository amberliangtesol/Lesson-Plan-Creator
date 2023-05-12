// MultipleChoice.js
import React, { useState } from "react";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MultipleChoiceOptionCard } from "../../components/Buttons";
import styled from "styled-components/macro";
import modal from "../../components/Modal";

const MultipleChoice = ({ questionData, onAnswerClick }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setSubmitted] = useState(false);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleSubmitClick = () => {
    if (selectedOption) {
      onAnswerClick(selectedOption);
      setSubmitted(true);
    } else {
      modal.success("請選擇一個答案");
    }
  };

  return (
    <QuestionContainer id="question-container">
      <OptionContainer>
        <OptionContainerText>第 {questionData.id} 題</OptionContainerText>
        <p>{questionData.question}</p>
        {questionData.options.map((option, index) => (
          <MultipleChoiceOptionCard
            key={index}
            onClick={() => handleOptionClick(option)}
            className={selectedOption === option ? "selected" : ""}
            correct={option.correct}
          >
            {option.text}
            {isSubmitted && selectedOption ? (
              option.correct ? (
                <CorrectMark> ✔︎ </CorrectMark>
              ) : (
                <WrongMark> ✘ </WrongMark>
              )
            ) : (
              ""
            )}
          </MultipleChoiceOptionCard>
        ))}
        <SubmitAnsBtn onClick={handleSubmitClick}>送出答案</SubmitAnsBtn>
      </OptionContainer>
    </QuestionContainer>
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

const SubmitAnsBtn = styled(MainRedFilledBtn)`
  width: 100%;
  margin-top: 10px;
  align-self: flex-end;
`;

const WrongMark = styled.span`
  color: red;
  font-size: 24px;
  margin-left: 20px;
`;

const CorrectMark = styled.span`
  color: green;
  font-size: 24px;
  margin-left: 20px;
`;

const OptionContainerText = styled.h3`
  margin-bottom: 0px;
  color: #f46868;
`;

const QuestionContainer = styled.div`
  margin-top: 20px;
`;

export default MultipleChoice;
