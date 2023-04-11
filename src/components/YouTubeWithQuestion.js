import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../UserInfoProvider";
import { where, collection, query, orderBy, limit, onSnapshot, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../utils/firebaseApp";
import Sorting from "./Sorting";
import MultipleChoice from "./MultipleChoice";
import Matching from "./Matching/Matching";
import GameMode from "./GameMode";


const YouTubeWithQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentUnitId, setCurrentUnitId] = useState("xXuWMEvkcTMgrwLe7HiE"); 
  const [showNextButton, setShowNextButton] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const questions = useRef([]);
  const interval = useRef(null);
  const playerRef = useRef(null);
  const lessonId = "TupTZ1oEYEs4y583piqh";
  const unitDocPath = `lessons/${lessonId}/units/${currentUnitId}`;
  const [unsubscribeNextUnit, setUnsubscribeNextUnit] = useState(null);


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
      } else if (event.target.getPlayerState() === window.YT.PlayerState.ENDED) {
        setShowNextButton(true);
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

  const updatedQuestions = async (id, isCorrect) => {
    const updated = questions.current.map((q) =>
      q.id === id ? { ...q, answered: true } : q
    );
    questions.current = updated;
    const unitDocRef = doc(db, `${unitDocPath}/students_submission`, user.account);
  
    // Check if the document exists
    const docSnap = await getDoc(unitDocRef);
  
    if (docSnap.exists()) {
      // Update the existing document
      await updateDoc(unitDocRef, {
        "answered": arrayUnion({ [currentQuestion.type]: isCorrect }),
      });
    } else {
      // Create a new document
      await setDoc(unitDocRef, {
        "answered": [{ [currentQuestion.type]: isCorrect }],
      });
    }
  
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

  const handleNextUnitClick = async () => {
    // Fetch the current unit's timestamp
    const currentUnitRef = doc(db, unitDocPath);
    const currentUnitSnap = await getDoc(currentUnitRef);
    const currentUnitTimestamp = currentUnitSnap.data().timestamp;
  
    // Construct the query for the next unit in the units subcollection
    const unitsCollection = collection(db, `lessons/${lessonId}/units`);
    const nextUnitQuery = query(unitsCollection, orderBy("timestamp", "asc"));
  
    // Listen to the query's result and set the currentUnitId to the next unit
    const unsubscribe = onSnapshot(nextUnitQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const nextUnitDoc = querySnapshot.docs.find(
          (doc) => doc.data().timestamp > currentUnitTimestamp
        );
  
        if (nextUnitDoc) {
          const nextUnitId = nextUnitDoc.id;
          setCurrentUnitId(nextUnitId);
          console.log("nextUnitId", nextUnitId);
        } else {
          alert("No more units available.");
        }
      } else {
        alert("No more units available.");
      }
    });
  
    // Set the unsubscribe function
    setUnsubscribeNextUnit(() => unsubscribe);
  };
  
  
  useEffect(() => {
    return () => {
      if (unsubscribeNextUnit) {
        unsubscribeNextUnit();
      }
    };
  }, [unsubscribeNextUnit]);
  

  console.log(currentQuestion);

  return (
    <div>
      <div id="player"></div>
      {showNextButton && (
      <button onClick={handleNextUnitClick}>Go to next unit</button>
    )}
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
