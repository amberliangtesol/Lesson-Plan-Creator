//更新存擋後才能render下一個單元
//更新存擋後才能render下一個單元

import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../UserInfoProvider";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDocs,
} from "firebase/firestore";
import { db } from "../utils/firebaseApp";
import Sorting from "./Sorting";
import MultipleChoice from "./MultipleChoice";
import Matching from "./Matching/Matching";
import GameMode from "./GameMode";
import styled from "styled-components/macro";
import { Link } from "react-router-dom";

const YouTubeWithQuestions = () => {
  const { lessonId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentUnitId, setCurrentUnitId] = useState();
  const [showNextButton, setShowNextButton] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const questions = useRef([]);
  const interval = useRef(null);
  const playerRef = useRef(null);
  const [unsubscribeNextUnit, setUnsubscribeNextUnit] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [sortedUnits, setSortedUnits] = useState([]);

  useEffect(() => {
    const fetchSortedUnits = async () => {
      console.log(`lessons/${lessonId}/units`);
      const unitsCollectionRef = collection(db, `lessons/${lessonId}/units`);
      const unitsQuery = query(unitsCollectionRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(unitsQuery);
      const units = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setSortedUnits(units);
      setCurrentUnitId(units[0].id);
    };

    fetchSortedUnits();
  }, [lessonId]);

  useEffect(() => {
    const fetchUnitData = async () => {
      const docRef = doc(db, `lessons/${lessonId}/units/${currentUnitId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const unitData = docSnap.data();
        questions.current = unitData.test.map((question) => {
          return {
            ...question.data,
            type: question.type,
          };
        });

        console.log(unitData);
        console.log("Video ID:", unitData.video);

        if (playerRef.current && playerReady) {
          playerRef.current.cueVideoById({ videoId: unitData.video });
          playerRef.current.playVideo();
        }
      }
    };

    if (currentUnitId) {
      fetchUnitData();
    }

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [currentUnitId, lessonId, playerReady]);

  const onPlayerStateChange = (event) => {
    if (
      window.YT &&
      window.YT.PlayerState &&
      event.target.getPlayerState() === window.YT.PlayerState.PLAYING
    ) {
      interval.current = setInterval(() => {
        const currentTime = event.target.getCurrentTime();
        localStorage.setItem("videoTimestamp", currentTime);
        localStorage.setItem("lessonid", lessonId);
        localStorage.setItem("currentUnitId", currentUnitId);
        if (!currentQuestion) {
          const questionToShow = questions.current.find(
            (q) => currentTime >= q.time && !q.answered
          );
          if (questionToShow) {
            setCurrentQuestion(questionToShow);
          }
        }
      }, 500);
    } else if (
      window.YT &&
      event.target.getPlayerState() === window.YT.PlayerState.ENDED
    ) {
      setShowNextButton(true);
    }
  };

  useEffect(() => {
    if (window.YT && currentQuestion && playerRef.current) {
      playerRef.current.pauseVideo();
    } else if (window.YT && !currentQuestion && playerRef.current) {
      playerRef.current.playVideo();
    }
    return () => {};
  }, [currentQuestion]);

  window.onYouTubeIframeAPIReady = () => {
    playerRef.current = new window.YT.Player("player", {
      height: "360",
      width: "640",
      events: {
        onReady: () => {
          setPlayerReady(true);
        },
        onStateChange: onPlayerStateChange,
        onError: (event) => {
          console.error("YouTube Player Error:", event.data);
        },
      },
    });
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.id = "youtubeAPI";
    document.body.appendChild(script);

    return () => {
      if (window.YT && window.YT.Player) {
        window.YT.Player.prototype.destroy();
        window.YT = null;
      }
      document.getElementById("youtubeAPI").remove();
    };
  }, []);

  const updatedQuestions = async (id, isCorrect) => {
    const updated = questions.current.map((q) =>
      q.id === id ? { ...q, answered: true } : q
    );
    questions.current = updated;
    const unitDocRef = doc(
      db,
      `lessons/${lessonId}/units/${currentUnitId}/students_submission`,
      user.account
    );

    // Check if the document exists
    const docSnap = await getDoc(unitDocRef);

    if (docSnap.exists()) {
      // Update the existing document
      await updateDoc(unitDocRef, {
        answered: arrayUnion({ [currentQuestion.type]: isCorrect }),
      });
    } else {
      // Create a new document
      await setDoc(unitDocRef, {
        answered: [{ [currentQuestion.type]: isCorrect }],
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
    setShowNextButton(false); // Add this line to hide the button when clicked
    // Fetch the current unit's timestamp
    const currentUnitRef = doc(
      db,
      `lessons/${lessonId}/units/${currentUnitId}`
    );
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

  console.log("currentQuestion", currentQuestion);

  return (
    <div>
      <h3>課程畫面</h3>
      <Container>
        <Container1>
          <BtnContainer>
            <h4>單元列表</h4>
            {sortedUnits.map((unit, index) => (
              <p
                key={unit.id}
                style={{
                  color: unit.id === currentUnitId ? "red" : "black",
                }}
              >
                Unit {index + 1}: {unit.data.unitName}
              </p>
            ))}
            <Btn>
              <Link to="/StudentMain">回課程主頁</Link>
            </Btn>
          </BtnContainer>
        </Container1>
        <Container2 style={{ paddingLeft: "50px" }}>
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
                onWin={(isCorrect) =>
                  updatedQuestions(currentQuestion.id, isCorrect)
                }
                explanation={currentQuestion.explanation}
              />
            </div>
          )}
          {currentQuestion && currentQuestion.type === "matching" && (
            <div>
              <Matching
                cards={currentQuestion.cards}
                onWin={() => updatedQuestions(currentQuestion.id, true)}
                explanation={currentQuestion.explanation}
              />
            </div>
          )}
        </Container2>
      </Container>
    </div>
  );
};

const Btn = styled.button`
  cursor: pointer;
  width: 100px;
  height: 25px;
  a {
    text-decoration: none;
    color: #000000;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
`;

const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;
const Container1 = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
  select {
    pointer-events: auto;
  }
`;

export default YouTubeWithQuestions;
