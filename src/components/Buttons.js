import styled from "styled-components/macro";

//login & logout page button
const ColorFilledBtn = styled.div`
  cursor: pointer;
  min-width: 169px;
  height: 40px;
  border-radius: 24px;
  background-color: #f46868;
  color: #ffffff;
  font-weight: 700;
  font-size: 20px;
  line-height: 29px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  a {
    letter-spacing: 0.1em;
    text-decoration: none;
    color: #ffffff;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
  @media screen and (max-width: 1279px) {
  }
`;

const ColorBorderBtn = styled.div`
  border: solid 2px #f46868;
  cursor: pointer;
  min-width: 169px;
  height: 40px;
  border-radius: 24px;
  background-color: transparent;
  color: #f46868;
  font-weight: 700;
  font-size: 20px;
  line-height: 29px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  a {
    letter-spacing: 0.1em;
    text-decoration: none;
    color: #f46868;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
  @media screen and (max-width: 1279px) {
  }
`;

//main page button
const MainRedFilledBtn = styled.div`
  cursor: pointer;
  min-width: 104px;
  height: 40px;
  border-radius: 24px;
  background-color: #f46868;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  line-height: 29px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  a {
    letter-spacing: 0.055em;
    text-decoration: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
  @media screen and (max-width: 1279px) {
  }
`;

const MainDarkFilledBtn = styled(MainRedFilledBtn)`
  background-color: #545454;
`;

const MainDarkBorderBtn = styled.div`
  border: solid 2px #545454;
  cursor: pointer;
  min-width: 104px;
  height: 40px;
  border-radius: 24px;
  background-color: #ffffff;
  color: #545454;
  font-weight: 700;
  font-size: 16px;
  line-height: 29px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  a {
    color: #545454;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    letter-spacing: 0.055em;
    text-decoration: none;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
`;

const NoBorderBtn = styled.div`
  cursor: pointer;
  min-width: 104px;
  height: 40px;
  border-radius: 24px;
  color: #545454;
  font-weight: 700;
  font-size: 16px;
  line-height: 29px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  &::before {
    content: "✚";
    color: #f46868;
    margin-right: 5px;
  }

  &:hover {
    transform: scale(1.1);
  }

  a {
    color: #545454;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    letter-spacing: 0.055em;
    text-decoration: none;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
`;

const MultipleChoiceOptionCard = styled.div`
  cursor: pointer;
  min-width: 100px;
  height: 50px;
  border-radius: 7px;
  background-color: transparent;
  color: #666666;
  border: solid 2px #666666;
  font-weight: 400;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  &:focus,
  &.selected {
    background-color: transparent;
    border-color: #f46868;
  }

  a {
    letter-spacing: 0.1em;
    text-decoration: none;
    color: #ffffff;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }

  @media screen and (max-width: 1279px) {
  }
`;

const Buttons = () => {
  return (
    <div>
      <ColorFilledBtn></ColorFilledBtn>
      <ColorBorderBtn></ColorBorderBtn>
      <MainRedFilledBtn></MainRedFilledBtn>
      <MainDarkBorderBtn></MainDarkBorderBtn>
      <NoBorderBtn></NoBorderBtn>
      <MultipleChoiceOptionCard></MultipleChoiceOptionCard>
    </div>
  );
};

export default Buttons;
export { ColorFilledBtn };
export { ColorBorderBtn };
export { MainRedFilledBtn };
export { MainDarkFilledBtn };
export { MainDarkBorderBtn };
export { NoBorderBtn };
export { MultipleChoiceOptionCard };
