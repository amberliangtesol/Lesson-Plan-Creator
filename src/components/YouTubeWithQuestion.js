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
import Header from "./Header";
import Footer from "./Footer";
import { MainDarkBorderBtn } from "./Buttons";
import { MainRedFilledBtn } from "./Buttons";
import { MainDarkFilledBtn } from "./Buttons";
import { HiOutlineHome } from "react-icons/hi";
import Badge1 from "./badge1.gif";
import Badge2 from "./badge2.gif";
import Swal from "sweetalert2";

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
  const [countdown, setCountdown] = useState(null);
  const [currentUnitName, setCurrentUnitName] = useState("");
  const [currentUnitSubtitle, setCurrentUnitSubtitle] = useState("");
  const [currentUnitDescription, setCurrentUnitDescription] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [currentBadge, setCurrentBadge] = useState("");
  const [icon, setIcon] = useState("");
  const [hasShownCongratsModal, setHasShownCongratsModal] = useState(false);

  console.log("currentUnitId", currentUnitId);
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

        // Set the current unit name to the state variable
        setCurrentUnitName(unitData.unitName);
        setCurrentUnitSubtitle(unitData.subtitle);
        setCurrentUnitDescription(unitData.description);

        console.log("sortedUnits", sortedUnits);
        // console.log("Video ID:", unitData.video);

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
      typeof event.target.getPlayerState === "function" &&
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
      window.YT.PlayerState &&
      typeof event.target.getPlayerState === "function" &&
      event.target.getPlayerState() === window.YT.PlayerState.ENDED
    ) {
      setShowNextButton(true);
    }
  };

  useEffect(() => {
    if (
      window.YT &&
      currentQuestion &&
      playerRef.current &&
      typeof playerRef.current.pauseVideo === "function"
    ) {
      playerRef.current.pauseVideo();
    } else if (
      window.YT &&
      !currentQuestion &&
      playerRef.current &&
      typeof playerRef.current.playVideo === "function" &&
      !showCongratsModal
    ) {
      playerRef.current.playVideo();
    }
    return () => {};
  }, [currentQuestion, showCongratsModal]);

  window.onYouTubeIframeAPIReady = () => {
    playerRef.current = new window.YT.Player("player", {
      height: "100%",
      width: "100%",
      // playerVars: {
      //   controls: 0,
      // },
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
    const index = questions.current.findIndex((q) => q.id === id);
    questions.current = updated;
    const unitDocRef = doc(
      db,
      `lessons/${lessonId}/units/${currentUnitId}/students_submission`,
      user.account
    );

    // Check if the document exists
    const docSnap = await getDoc(unitDocRef);

    if (docSnap.exists()) {
      const answered = [...docSnap.data().answered];
      answered[index] = { [currentQuestion.type]: isCorrect };
      // Update the existing document
      await updateDoc(unitDocRef, { answered });
    } else {
      // Create a new document
      await setDoc(unitDocRef, {
        answered: [{ [currentQuestion.type]: isCorrect }],
      });
    }

    setCurrentQuestion(null);
  };

  const updateUserBadgeData = async (badgeId) => {
    const userDocRef = doc(db, "users", user.account);

    // Check if the document exists
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userDocData = docSnap.data();
      const userBadges = userDocData.badge.collected || [];

      // Update the existing document
      await updateDoc(userDocRef, {
        "badge.collected": [...userBadges, badgeId],
      });
    }
  };

  const handleOnAnswer = (isCorrect) => {
    console.log(isCorrect);
    if (isCorrect) {
      updatedQuestions(currentQuestion.id, true);
      // setResultMessage("You win!");
      setIcon("✓");
      if (countdown > 0 && !hasShownCongratsModal) {
        playerRef.current.pauseVideo();
        updateUserBadgeData("badge2");
        setCurrentBadge(Badge2);
        setShowCongratsModal(true); // Show the CongratsModal
        // setHasShownCongratsModal(true); // Update the hasShownCongratsModal state
      }
    } else {
      setResultMessage(currentQuestion.explanation);
      setIcon("✕");
      setCountdown(0);
    }
  };

  const handleAnswerClick = (option) => {
    console.log("handleAnswerClick called");
    handleOnAnswer(option.correct);
  };

  const handleNextClick = () => {
    updatedQuestions(currentQuestion.id, false);
  };

  const handleNextUnitClick = async () => {
    setShowNextButton(false); // Add this line to hide the button when clicked

    // Check if the user has answered all questions in the current unit
    const answeredQuestions = questions.current.filter((q) => q.answered);
    if (answeredQuestions.length === questions.current.length) {
      // Give the user badge1 if they have answered all questions
      updateUserBadgeData("badge1");
      // setCurrentBadge(Badge1);
      // setShowCongratsModal(true);
      // setHasShownCongratsModal(true); // Update the hasShownCongratsModal state
    }

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
          setCurrentQuestion(null);
          setResultMessage("");
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

  const CongratsModal = ({ show, imageUrl }) => {
    console.log("CongratsModal show prop:", show); // Log the value of the show prop
    useEffect(() => {
      if (show) {
        let timerInterval;
        Swal.fire({
          title: "恭喜你獲得徽章!",
          imageUrl,
          imageWidth: 250,
          imageHeight: 250,
          imageAlt: "Badge image",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          padding: "30px",
          willClose: () => {
            setCurrentBadge("");
            setShowCongratsModal(false);
            playerRef.current.playVideo();
            clearInterval(timerInterval);
          },
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.timer) {
          }
        });

        return () => clearInterval(timerInterval);
      }
    }, [show]);

    return <ModalWrapper></ModalWrapper>;
  };

  return (
    <Body>
      <Header></Header>
      <Content>
        <Container>
          <MainContent>
            <Container1>
              <BtnContainer>
                <h3
                  style={{
                    borderBottom: "3px solid #f46868",
                    paddingBottom: "18px",
                  }}
                >
                  單元列表
                </h3>
                {sortedUnits.map((unit, index) => (
                  <h3
                    key={unit.id}
                    style={{
                      color: unit.id === currentUnitId ? "#F46868" : "black",
                      fontWeight: unit.id === currentUnitId ? "700" : "400",
                      alignSelf: "flex-start",
                    }}
                  >
                    Unit {index + 1} : {unit.data.unitName}
                  </h3>
                ))}

                <MainDarkBorderBtn
                  style={{
                    position: "absolute",
                    bottom: "250px",
                  }}
                >
                  <Link to="/StudentMain">回首頁</Link>
                </MainDarkBorderBtn>
              </BtnContainer>
            </Container1>

            <Container2>
              <Title>{currentUnitName}</Title>
              <h4
                style={{
                  marginBottom: "0px",
                }}
              >
                {currentUnitSubtitle}
              </h4>
              <p>{currentUnitDescription}</p>
              <div id="player"></div>
              {showNextButton && (
                <MainDarkFilledBtn
                  onClick={handleNextUnitClick}
                  style={{
                    marginTop: "20px",
                  }}
                >
                  繼續觀看下個單元
                </MainDarkFilledBtn>
              )}
              <CongratsModal show={showCongratsModal} imageUrl={currentBadge} />
              <div></div>
              {currentQuestion && currentQuestion.gameMode && (
                <GameMode countdown={countdown} setCountdown={setCountdown} />
              )}
              {currentQuestion &&
                currentQuestion.type === "multiple-choice" && (
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
                    questionData={currentQuestion}
                    sorted={currentQuestion.sorted}
                    onWin={(isCorrect) => handleOnAnswer(isCorrect)}
                    explanation={currentQuestion.explanation}
                  />
                </div>
              )}
              {currentQuestion && currentQuestion.type === "matching" && (
                <div>
                  <Matching
                    questionData={currentQuestion}
                    cards={currentQuestion.cards}
                    onWin={(isCorrect) => handleOnAnswer(isCorrect)}
                    explanation={currentQuestion.explanation}
                  />
                </div>
              )}
              <div
              // style={{
              //   marginTop: "20px",
              //   color: resultMessage === "You win!" ? "#338168" : "#545454",
              // }}
              >
                {resultMessage}
                {resultMessage !== "" && (
                  <MainDarkFilledBtn
                    onClick={handleNextClick}
                    style={{
                      marginTop: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    繼續播放
                  </MainDarkFilledBtn>
                )}
              </div>
            </Container2>
          </MainContent>
        </Container>
      </Content>

      <Footer></Footer>
    </Body>
  );
};

const ModalWrapper = styled.div`
  display: ${(props) => (props.show ? "block" : "none")};
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`;

const Body = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin-top: 50px;
`;

const Content = styled.div`
  flex: 1;
`;

const Container = styled.div`
  padding-top: 40px;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
`;

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  margin-top: 0;
  margin-bottom: 40px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 50px;
  padding-right: 50px;
`;

const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container1 = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  align-items: center;
  text-align: center;
  background-color: rgb(245, 245, 245);
  min-height: 100vh;
  padding-top: 90px;
`;

const Container2 = styled.div`
  ${
    "" /* display: flex;
  flex-direction: column; */
  }
  padding-top: 50px;
  width: 65vw;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 90px;
  padding-right: 30px;
  padding-left: 30px;
  select {
    pointer-events: auto;
  }
`;

export default YouTubeWithQuestions;
