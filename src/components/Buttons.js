import styled from "styled-components/macro";

//login & logout page button
const ColorFilledBtn = styled.div`
  cursor: pointer;
  width: 169px;
  height: 40px;
  border-radius: 24px;
  background-color: #f46868;
  color: white;
  font-weight: 700;
  font-size: 20px;
  line-height: 29px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #ffffff;
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

const ColorBorderBtn = styled(ColorFilledBtn)`
  background-color: transparent;
  border: solid 2px #f46868;
  color: #f46868;
  a {
    letter-spacing: 0.1em;
    color: #f46868;
  }
  @media screen and (max-width: 1279px) {
  }
`;

//main page button
const MainRedFilledBtn = styled(ColorFilledBtn)`
  width: 104px;
  color: #f46868;
  a {
    color: #ffffff;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    letter-spacing: 0.055em;
  }
  @media screen and (max-width: 1279px) {
  }
`;

const MainDarkFilledBtn = styled(MainRedFilledBtn)`
  background-color: #545454;
`;

const MainDarkBorderBtn = styled(ColorBorderBtn)`
  background-color: #ffffff;
  width: 104px;
  border: solid 2px #545454;
  a {
    color: #545454;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    letter-spacing: 0.055em;
  }
`;



const Buttons = () => {
  return (
    <div>
      <ColorFilledBtn></ColorFilledBtn>
      <ColorBorderBtn></ColorBorderBtn>
      <MainRedFilledBtn></MainRedFilledBtn>
      <MainDarkBorderBtn></MainDarkBorderBtn>
    </div>
  );
};

export default Buttons;
export { ColorFilledBtn };
export { ColorBorderBtn };
export { MainRedFilledBtn };
export { MainDarkFilledBtn };
export { MainDarkBorderBtn };


