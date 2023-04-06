import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseApp";
import Sorting from "./Sorting";
import Matching from "./Matching/Matching";


const YouTubeWithQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  // const questions = useRef([
  //   {
  //     id: 1,
      // time: 5,
  //     type: "muliple-choice",
  //     question: "AppWorks School最帥ㄉ前端導師是誰?",
  //     options: [
  //       { text: "谷哥", correct: true },
  //       { text: "子華", correct: false },
  //       { text: "小賴", correct: false },
  //     ],
  //     explanation: "詳解",
  //   },
  // ]);
  const questions = useRef([]);
  const interval = useRef(null);
  const playerRef = useRef(null);

  const onPlayerReady = (event) => {
    // const savedTimestamp = 0;
    // event.target.seekTo(savedTimestamp);
    // event.target.playVideo();

    if (questions.current.length === 0) {
      const docRef = doc(db, "lessons/jy18UZ2iaa7Tcmdi8Zmt/units/unit1");
      getDoc(docRef).then((docSnap) => {
        questions.current = docSnap.data().test.map((question) => {
          return {
            ...question.data,
            type: question.type,
          };
        });
        console.log(docSnap.data());
        // https://developers.google.com/youtube/iframe_api_reference?hl=zh-tw
        playerRef.current.loadVideoById({ videoId: docSnap.data().video });
        playerRef.current.playVideo();
      });
    }
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
        }, 500);
      }
    };

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("player", {
        height: "360",
        width: "640",
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

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
  }, []);

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
      <div id="player"></div>
      {currentQuestion && currentQuestion.type === "multiple-choice" && (
        <div>
          <h3>Question {currentQuestion.id}:</h3>
          <p>{currentQuestion.question}</p>
          <div>
            {(currentQuestion.options).map((option, index) => (
              <button key={index} onClick={() => handleAnswerClick(option)}>
                {option.text}
              </button>
            ))}
            <button>submit</button>
          </div>
        </div>
      )}
      {currentQuestion && currentQuestion.type === "sorting" && (
        <div>
          <Sorting
            sorted={currentQuestion.sorted}
            onWin={() => updatedQuestions(currentQuestion.id)}
          />
        </div>
      )}
      {currentQuestion && currentQuestion.type === "matching" &&  (
        <div>
          <Matching cards={currentQuestion.cards} />
        </div>
      )}
    </div>
  );
};

export default YouTubeWithQuestions;
