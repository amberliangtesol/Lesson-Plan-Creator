import React from "react";
import { useState, useEffect } from "react";
import "./Matching.css";
import styled from "styled-components/macro";

const Card = ({ id, name, flipped, matched, clicked }) => {
  return (
    <div
      onClick={() => (flipped ? undefined : clicked(name, id))}
      className={
        "card" + (flipped ? " flipped" : "") + (matched ? " matched" : "")
      }
    >
      <div className="back">?</div>
      <div className="front">
        <span>{name}</span>
      </div>
    </div>
  );
};

const Matching = (props) => {
  // remove destructuring of questionData
  const { cards, questionData, explanation, onWin } = props; // destructure props here

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

    // Log click
    setClickHistory([...clickHistory, currentCard]);

    //update card is flipped
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

    //if 2 cards are flipped, check if they are a match
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
  };

  // const GameOver = () => {
  //   return (
  //     <div className="centered">
  //       <h1>Congrats!</h1>
  //     </div>
  //   );
  // };

  // const GameOver = () => {
  //   alert("you win!");
  //   props.onWin();
  // };

  useEffect(() => {
    if (gameOver && typeof onWin === "function") {
      // access onWin from props
      onWin(); // call onWin function
    }
  }, [gameOver]);

  return (
    <div id="question-container">
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
        <div className="game-board">
          {!gameOver &&
            cardList.map((card, index) => (
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
        {gameOver && <WinMessage>{questionData.explanation}</WinMessage>}
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

const WinMessage = styled.div`
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-size: 1.5rem;
  margin-top: 20px;
`;

export default Matching;
