import React, { useState } from "react";
import styled, { keyframes } from "styled-components/macro";

const Matching = (props) => {
  const { cards, questionData } = props;

  const Card = ({ id, name, flipped, matched, clicked }) => {
    return (
      <CardWrapper
        onClick={() => (flipped ? undefined : clicked(name, id))}
        flipped={flipped}
        matched={matched}
      >
        <div className="back">?</div>
        <div className="front">
          <span>{name}</span>
        </div>
      </CardWrapper>
    );
  };

  const shuffle = (array) => {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };

  const [cardList, setCardList] = useState(
    shuffle(cards).map((card, index) => {
      return {
        id: index,
        name: card.text,
        groupId: card.id,
        flipped: false,
        matched: false,
      };
    })
  );

  const [flippedCards, setFlippedCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [clickHistory, setClickHistory] = useState([]);

  const handleClick = (name, groupId, index) => {
    let currentCard = {
      name,
      groupId,
      index,
    };

    setClickHistory([...clickHistory, currentCard]);

    let updateCards = cardList.map((card) => {
      if (card.id === index) {
        card.flipped = true;
      }
      return card;
    });
    let updateFlipped = flippedCards;
    updateFlipped.push(currentCard);
    setFlippedCards(updateFlipped);
    setCardList(updateCards);

    if (flippedCards.length === 2) {
      setTimeout(() => {
        check();
      }, 750);
    }
  };

  const check = () => {
    let updateCards = cardList;
    if (
      flippedCards[0].groupId === flippedCards[1].groupId &&
      flippedCards[0].index !== flippedCards[1].index
    ) {
      updateCards[flippedCards[0].index].matched = true;
      updateCards[flippedCards[1].index].matched = true;
      isGameOver();
    } else {
      updateCards[flippedCards[0].index].flipped = false;
      updateCards[flippedCards[1].index].flipped = false;
    }
    setCardList(updateCards);
    setFlippedCards([]);
  };

  const isGameOver = () => {
    let done = true;
    cardList.forEach((card) => {
      if (!card.matched) done = false;
    });
    setGameOver(done);
    if (done) {
      props.onWin(true);
    }
  };

  return (
    <div
      id="question-container"
      style={{
        marginTop: "20px",
      }}
    >
      <OptionContainer>
        <h3
          style={{
            marginBottom: "0px",
            color: "#F46868",
          }}
        >
          第 {questionData.id} 題
        </h3>
        <p>{questionData.question}</p>
        <div>
          {cardList.map((card, index) => (
            <Card
              key={index}
              id={index}
              name={card.name}
              flipped={card.flipped}
              matched={card.matched}
              clicked={
                flippedCards.length === 2
                  ? () => {}
                  : () => handleClick(card.name, card.groupId, index)
              }
            />
          ))}
        </div>
      </OptionContainer>
    </div>
  );
};

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 5px;
  background-color: #f5f5f5;
  border-radius: 33px;
  width: 100%;
  padding: 30px 60px 50px 60px;
`;

const selected = keyframes`
  0% {
    opacity: 0.2;
  }
  30% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.9;
  }
  70% {
    opacity: 0.2;
  }
  100% {
    opacity: 0.3;
  }
`;

const CardWrapper = styled.div`
  width: 30%;
  user-select: none;
  height: 112px;
  padding: 10px;
  box-sizing: border-box;
  text-align: center;
  margin: 16px;
  transition: 0.6s;
  transform-style: preserve-3d;
  position: relative;
  transform: ${(props) =>
    props.flipped || props.matched ? "rotateY(180deg)" : "none"};

  &.matched .front {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05) inset;
    animation: ${selected} 0.8s 0s ease 1;
    animation-fill-mode: both;
    opacity: 0.2;
  }

  div {
    backface-visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    transition: 0.6s;
    background: #e7e7e7;

    &.back {
      font-size: 50px;
      line-height: 120px;
      cursor: pointer;
      color: #f46868;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.front {
      transform: rotateY(180deg);
      line-height: 110px;
      text-emphasis: none;
    }
  }
`;

export default Matching;
