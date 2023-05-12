import React, { useState, useEffect, useRef, useContext } from "react";
import styled from "styled-components/macro";
import { db } from "../../utils/firebaseApp";
import { UserContext } from "../../UserInfoProvider";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import Swal from "sweetalert2";
import modal from "../../components/Modal";
import Sorting from "./Sorting";
import MultipleChoice from "./MultipleChoice";
import Matching from "./Matching";
import GameMode from "./GameMode";
import Badge1 from "./CourseAsset/badge1.gif";
import Badge2 from "./CourseAsset/badge2.gif";
import winbgm from "./CourseAsset/winsound.mp3";
import losebgm from "./CourseAsset/losesound.mp3";
import gamebgm from "./CourseAsset/gamesound.mp3";
import { MainDarkBorderBtn } from "../../components/Buttons";
import { MainDarkFilledBtn } from "../../components/Buttons";

const Course = () => {
  const { lessonId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentUnitId, setCurrentUnitId] = useState();
  const [showNextButton, setShowNextButton] = useState(false);
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
  const [hasShownCongratsModal, setHasShownCongratsModal] = useState(false);
  const questions = useRef([]);
  const interval = useRef(null);
  const playerRef = useRef(null);
  const refCurrentQuestion = useRef(null);
  const winsound = useRef(new Audio(winbgm));
  const losesound = useRef(new Audio(losebgm));
  const gamesound = useRef(new Audio(gamebgm));

  useEffect(() => {
    const fetchSortedUnits = async () => {
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

        setCurrentUnitName(unitData.unitName);
        setCurrentUnitSubtitle(unitData.subtitle);
        setCurrentUnitDescription(unitData.description);

        if (playerRef.current && playerReady) {
          playerRef.current.cueVideoById({ videoId: unitData.video });
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
        if (!refCurrentQuestion.current) {
          const questionToShow = questions.current.find(
            (q) => currentTime >= q.time && !q.answered
          );
          if (questionToShow) {
            if (questionToShow.gameMode) {
              gamesound.current.play();
              gamesound.current.volume = 0.5;
            } else {
              gamesound.current.pause();
              gamesound.currentTime = 0;
            }
            refCurrentQuestion.current = questionToShow;
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
      !showCongratsModal &&
      resultMessage === ""
    ) {
      playerRef.current.playVideo();
      playerRef.current.volume = 0.5;
    }
    return () => {};
  }, [currentQuestion, resultMessage, showCongratsModal]);

  window.onYouTubeIframeAPIReady = () => {
    playerRef.current = new window.YT.Player("player", {
      height: "100%",
      width: "100%",
      playerVars: {
        controls: 0,
        rel: 0,
        showinfo: 0,
        fs: 0,
        disablekb: 1,
        modestbranding: 1,
      },
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

    const docSnap = await getDoc(unitDocRef);

    if (docSnap.exists()) {
      const answered = [...docSnap.data().answered];
      answered[index] = { [currentQuestion.type]: isCorrect };
      await updateDoc(unitDocRef, { answered });
    } else {
      await setDoc(unitDocRef, {
        answered: [{ [currentQuestion.type]: isCorrect }],
      });
    }
  };

  const updateUserBadgeData = async (badgeId) => {
    const userDocRef = doc(db, "users", user.account);

    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userDocData = docSnap.data();
      const userBadges = userDocData.badge.collected || [];

      await updateDoc(userDocRef, {
        "badge.collected": [...userBadges, badgeId],
      });
    }
  };

  const handleOnAnswer = (isCorrect) => {
    gamesound.current.pause();
    setResultMessage(currentQuestion.explanation);
    setCountdown(0);
    if (isCorrect) {
      winsound.current.play();
      winsound.current.volume = 0.5;
      updatedQuestions(currentQuestion.id, true);
      if (countdown > 0 && !hasShownCongratsModal) {
        playerRef.current.pauseVideo();
        updateUserBadgeData("badge2");
        setCurrentBadge(Badge2);
        setShowCongratsModal(true);
      }
    } else {
      losesound.current.play();
      losesound.current.volume = 0.5;
      updatedQuestions(currentQuestion.id, false);
    }
  };

  const handleAnswerClick = (option) => {
    handleOnAnswer(option.correct);
  };

  const handleNextClick = () => {
    setResultMessage("");
    refCurrentQuestion.current = null;
    setCurrentQuestion(null);
  };

  const handleNextUnitClick = async () => {
    setShowNextButton(false);
    const answeredQuestions = questions.current.filter((q) => q.answered);
    if (
      answeredQuestions.length === questions.current.length &&
      !hasShownCongratsModal
    ) {
      updateUserBadgeData("badge1");
      // setCurrentBadge(Badge1);
      // setShowCongratsModal(true);
    }

    const currentUnitRef = doc(
      db,
      `lessons/${lessonId}/units/${currentUnitId}`
    );
    const currentUnitSnap = await getDoc(currentUnitRef);
    const currentUnitTimestamp = currentUnitSnap.data().timestamp;

    const unitsCollection = collection(db, `lessons/${lessonId}/units`);
    const nextUnitQuery = query(unitsCollection, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(nextUnitQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const nextUnitDoc = querySnapshot.docs.find(
          (doc) => doc.data().timestamp > currentUnitTimestamp
        );

        if (nextUnitDoc) {
          const nextUnitId = nextUnitDoc.id;
          refCurrentQuestion.current = null;
          setCurrentQuestion(null);
          setResultMessage("");
          setCurrentUnitId(nextUnitId);
        } else {
          modal.backToMain("課程結束");
        }
      } else {
        modal.backToMain("課程結束");
      }
    });

    setUnsubscribeNextUnit(() => unsubscribe);
  };

  useEffect(() => {
    return () => {
      if (unsubscribeNextUnit) {
        unsubscribeNextUnit();
      }
    };
  }, [unsubscribeNextUnit]);

  useEffect(() => {
    if (countdown === 0 && currentQuestion && currentQuestion.gameMode) {
      gamesound.current.pause();
      gamesound.currentTime = 0;
    } else if (
      countdown > 0 &&
      gamesound.current.paused &&
      currentQuestion &&
      currentQuestion.gameMode
    ) {
      gamesound.current.play();
      gamesound.current.volume = 0.5;
    }
  }, [countdown, currentQuestion]);

  const CongratsModal = ({ show, imageUrl }) => {
    useEffect(() => {
      if (show) {
        let timerInterval;
        Swal.fire({
          title: "恭喜你獲得徽章!",
          imageUrl,
          imageWidth: 250,
          imageHeight: 250,
          imageAlt: "Badge image",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          padding: "30px",
          willClose: () => {
            setCurrentBadge("");
            setShowCongratsModal(false);
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
      <Content>
        <Container>
          <MainContent>
            <Container1>
              <BtnContainer>
                <BtnContainerText>單元列表</BtnContainerText>
                {sortedUnits.map((unit, index) => (
                  <UnitText
                    key={unit.id}
                    isSelected={unit.id === currentUnitId}
                  >
                    單元 {index + 1} : {unit.data.unitName}
                  </UnitText>
                ))}

                <BackToMainBtn>
                  <Link to="/StudentMain">回首頁</Link>
                </BackToMainBtn>
              </BtnContainer>
            </Container1>

            <Container2>
              <Title>{currentUnitName}</Title>
              <UnitSubtitleText>{currentUnitSubtitle}</UnitSubtitleText>
              <p>{currentUnitDescription}</p>
              <div id="player"></div>
              {showNextButton && (
                <NextUnitBtn onClick={handleNextUnitClick}>
                  繼續觀看下個單元
                </NextUnitBtn>
              )}
              <CongratsModal show={showCongratsModal} imageUrl={currentBadge} />
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
                    onNext={handleNextClick}
                  />
                </div>
              )}
              <ExplanationWrapper>
                {resultMessage}
                {resultMessage !== "" && (
                  <ContinuePlayBtn onClick={handleNextClick}>
                    繼續播放
                  </ContinuePlayBtn>
                )}
              </ExplanationWrapper>
            </Container2>
          </MainContent>
        </Container>
      </Content>
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
  padding: 90px 50px;
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
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

const ContinuePlayBtn = styled(MainDarkFilledBtn)`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const ExplanationWrapper = styled.div`
  margin-top: 20px;
`;

const NextUnitBtn = styled(MainDarkFilledBtn)`
  margin-top: 20px;
  padding: 5px;
`;

const BackToMainBtn = styled(MainDarkBorderBtn)`
  margin-top: 150px;
  width: 104px;
  align-self: center;
`;

const UnitSubtitleText = styled.h4`
  margin-bottom: 0px;
`;

const UnitText = styled.h3`
  color: ${({ isSelected }) => (isSelected ? "#F46868" : "black")};
  font-weight: ${({ isSelected }) => (isSelected ? "700" : "400")};
  align-self: flex-start;
  cursor: not-allowed;
`;

const BtnContainerText = styled.h3`
  border-bottom: 3px solid #f46868;
  padding-bottom: 18px;
`;

export default Course;
