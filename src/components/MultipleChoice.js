// MultipleChoice.js
import React, { useState } from 'react';

const MultipleChoice = ({ questionData, onAnswerClick }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleSubmitClick = () => {
    if (selectedOption) {
      onAnswerClick(selectedOption);
    } else {
      alert('請選擇一個答案');
    }
  };

  return (
    <div>
      <h3>Question {questionData.id}:</h3>
      <p>{questionData.question}</p>
      <div>
        {questionData.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            style={selectedOption === option ? { backgroundColor: 'lightyellow' } : {}}
          >
            {option.text}
          </button>
        ))}
        <button onClick={handleSubmitClick}>送出答案</button>
      </div>
    </div>
  );
};

export default MultipleChoice;