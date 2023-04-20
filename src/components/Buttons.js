import styled from "styled-components/macro";

const ColorFilledBtn = styled.div`
  cursor: pointer;
  width: 169px;
  height: 40px;
  border-radius: 24px;
  background-color: #f46868;
  color: white;
  font-weight: 700;
  font-size: 24px;
  line-height: 29px;
  display:flex;
  justify-content: center;
  align-items: center;
  text-align: center;
a {
  text-decoration: none;
  color: #000000;
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
  color: #f46868;
}
  @media screen and (max-width: 1279px) {
  }
`;

const Buttons = () => {
  return (
    <div>
      <ColorFilledBtn></ColorFilledBtn>
      <ColorBorderBtn></ColorBorderBtn>
    </div>
  );
};

export default Buttons;
export { ColorFilledBtn };
export { ColorBorderBtn };
