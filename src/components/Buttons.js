import styled from "styled-components/macro";

const ColorFilledBtn = styled.div`
  cursor: pointer;
  width: 104px;
  height: 41px;
  border-radius: 33px;
  background-color: #f46868;
  color: white;
  ${
    "" /* a {
  text-decoration: none;
  color: #000000;
  &:hover,
  &:link,
  &:active {
    text-decoration: none;
  }
} */
  }
  @media screen and (max-width: 1279px) {
  }
`;

const ColorBorderBtn = styled(ColorFilledBtn)`
  background-color: blue;
  color: white;
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

