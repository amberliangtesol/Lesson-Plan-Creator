import React, { useState, useEffect, useRef } from "react";

const YouTubeWithQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const interval = useRef(null);
  const playerRef = useRef(null);

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

  const onPlayerReady = (event) => {
    const savedTimestamp = 0;
    event.target.seekTo(savedTimestamp);
    event.target.playVideo();
  };

  useEffect(() => {
    const onPlayerStateChange = (event) => {
      if (event.target.getPlayerState() === window.YT.PlayerState.PLAYING) {
        interval.current = setInterval(() => {
          const currentTime = event.target.getCurrentTime();
          localStorage.setItem("videoTimestamp", currentTime);
          if (!currentQuestion) {
            const questionToShow = questions.current.find(
              (q) => currentTime >= q.time && !q.answered
            );
            if (questionToShow) {
              setCurrentQuestion(questionToShow);
            }
          }
        } , 500);
      }
    };

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("player", {
        height: "360",
        width: "640",
        videoId: "jBC41DDFY7A",
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    }

    return () => {
      if (window.YT && window.YT.Player) {
        window.YT.Player.prototype.destroy();
      }
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [currentQuestion]);

  useEffect(() => {
    if (currentQuestion && playerRef.current) {
      playerRef.current.pauseVideo();
    } else if (!currentQuestion && playerRef.current) {
      playerRef.current.playVideo();
    }
    return () => {};
  }, [currentQuestion]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script); 

    return () => {};
  }, [])


  const updatedQuestions  = (id) => {
    const updated = questions.current.map((q) =>
        q.id === id ? { ...q, answered: true } : q);
      questions.current = updated;
      setCurrentQuestion(null);
  }

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
      <div id="player"></div>
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

export default YouTubeWithQuestions;
