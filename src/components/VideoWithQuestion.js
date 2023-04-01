import React, { useState, useEffect, useRef } from "react";

const VideoWithQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const interval = useRef(null);
  const playerRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file.type.startsWith("video/mp4")) {
      setVideoSrc(URL.createObjectURL(file));
    } else {
      alert("Please upload an mp4 video file.");
    }
  };

  const questions = useRef([
    {
      id: 1,
      time: 5,
      type: "muliple-choice",
      questionText: "AppWorks School最帥ㄉ前端導師是誰?",
      options: [
        { text: "谷哥", correct: true },
        { text: "子華", correct: false },
        { text: "小賴", correct: false }
      ],
      description: "詳解"
    },
    {
      id: 2,
      // answered: true,
      time: 10,
      type: "muliple-choice",
      questionText: "AppWorks Schoolㄉ校長是誰?",
      options: [
        { text: "Shirney", correct: true },
        { text: "Tiffany", correct: false },
        { text: "Tyler", correct: false }
      ],
      description: "詳解"
    }
]);

  useEffect(() => {
    const onPlayerStateChange = () => {
      if (!playerRef.current.paused) {
        interval.current = setInterval(() => {
          const currentTime = playerRef.current.currentTime;
          if (!currentQuestion) {
            const questionToShow = questions.current.find(
              (q) => currentTime >= q.time && !q.answered
            );
            if (questionToShow) {
              setCurrentQuestion(questionToShow);
            }
          }
        }, 500);
      } else {
        clearInterval(interval.current);
      }
    };

    if (playerRef.current) {
      playerRef.current.addEventListener("play", onPlayerStateChange);
      playerRef.current.addEventListener("pause", onPlayerStateChange);
      playerRef.current.addEventListener("timeupdate", onPlayerStateChange);

      return () => {
        playerRef.current.removeEventListener("play", onPlayerStateChange);
        playerRef.current.removeEventListener("pause", onPlayerStateChange);
        playerRef.current.removeEventListener("timeupdate", onPlayerStateChange);
        clearInterval(interval.current);
      };
    }
  }, [currentQuestion, playerRef]);

  useEffect(() => {
    if (currentQuestion && playerRef.current && !playerRef.current.paused) {
      playerRef.current.pause();
    } else if (!currentQuestion && playerRef.current && playerRef.current.paused) {
      playerRef.current.play();
    }
  }, [currentQuestion]);

  const updatedQuestions = (id) => {
    const updated = questions.current.map((q) =>
      q.id === id ? { ...q, answered: true } : q
    );
    questions.current = updated;
    setCurrentQuestion(null);
  };

  const handleAnswerClick = (option) => {
    if (option.correct) {
      alert("Congratulations! Correct answer.");
      updatedQuestions(currentQuestion.id);
    } else {
      alert("Aww, try again!");
      updatedQuestions(currentQuestion.id);
    }
  };

  return (
    <div>
      <input type="file" accept="video/mp4" onChange={handleVideoUpload} />
      {videoSrc && (
        <video
          id="player"
          src={videoSrc}
          controls
          ref={playerRef}
          width="640"
          height="360"
        ></video>
      )}
      {currentQuestion && (
        <div>
          <h3>Question {currentQuestion.id}:</h3>
          <p>{currentQuestion.questionText}</p>
          <div>
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswerClick(option)}>
                {option.text}
              </button>
            ))}
            <button>submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoWithQuestions;
