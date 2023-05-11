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
    <div
      id="question-container"
      style={{
        marginTop: "20px",
      }}
    >
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
            className={selectedOption === option ? "selected" : ""}
            correct={option.correct}
          >
            {option.text}
            {isSubmitted && selectedOption ? (
              option.correct ? (
                <span
                  style={{
                    color: "green",
                    fontSize: "24px",
                    marginLeft: "20px",
                  }}
                >
                  {" "}
                  ✔︎{" "}
                </span>
              ) : (
                <span
                  style={{ color: "red", fontSize: "24px", marginLeft: "20px" }}
                >
                  {" "}
                  ✘{" "}
                </span>
              )
            ) : (
              ""
            )}
          </MultipleChoiceOptionCard>
        ))}
        <MainRedFilledBtn
          onClick={handleSubmitClick}
          style={{
            width: "100%",
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
