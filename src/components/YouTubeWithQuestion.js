import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../UserInfoProvider";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../utils/firebaseApp";
import Sorting from "./Sorting";
import MultipleChoice from "./MultipleChoice";
import Matching from "./Matching/Matching";
import GameMode from "./GameMode";

const YouTubeWithQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const [studentAnswered, setStudentAnswered] = useState([]);
  const questions = useRef([]);
  const interval = useRef(null);
  const playerRef = useRef(null);
  const unitDocPath = "lessons/jy18UZ2iaa7Tcmdi8Zmt/units/unit1";

  const onPlayerReady = (event) => {
    if (questions.current.length === 0) {
      const docRef = doc(db, unitDocPath);
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

  const updatedQuestions = (id, isCorrect) => {
    const updated = questions.current.map((q) =>
      q.id === id ? { ...q, answered: true } : q
    );
    questions.current = updated;
    const unitDocRef = doc(db, `${unitDocPath}/students_submission`, user.account);
    setDoc(unitDocRef, {
      "answered": {
        [currentQuestion.type]: isCorrect,
      },
    }, { merge: true });
    setCurrentQuestion(null);
  };

  const handleAnswerClick = (option) => {
    if (option.correct) {
      alert("Congratulations! Correct answer.");
      updatedQuestions(currentQuestion.id, true);
    } else {
      alert(currentQuestion.explanation);
      updatedQuestions(currentQuestion.id, false);
    }
  };

  return (
    <div>
      <div id="player"></div>
      {currentQuestion && currentQuestion.gameMode && <GameMode />}
      {currentQuestion && currentQuestion.type === "multiple-choice" && (
        <div>
        <MultipleChoice
          questionData={currentQuestion}
          onAnswerClick={handleAnswerClick}
        />
        </div>
      )}
      {currentQuestion && currentQuestion.type === "sorting" && (
        <div>
          <Sorting
            sorted={currentQuestion.sorted}
            onWin={() => updatedQuestions(currentQuestion.id, true)}
          />
        </div>
      )}
      {currentQuestion && currentQuestion.type === "matching" && (
        <div>
          <Matching
            cards={currentQuestion.cards}
            onWin={() => updatedQuestions(currentQuestion.id, true)}
          />
        </div>
      )}
    </div>
  );
};

export default YouTubeWithQuestions;
