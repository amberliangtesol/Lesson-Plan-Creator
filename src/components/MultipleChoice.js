// MultipleChoice.js
import React from 'react';

const MultipleChoice = ({ questionData, onAnswerClick }) => {
  return (
    <div>
      <h3>Question {questionData.id}:</h3>
      <p>{questionData.question}</p>
      <div>
        {(questionData.options).map((option, index) => (
          <button key={index} onClick={() => onAnswerClick(option)}>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoice;