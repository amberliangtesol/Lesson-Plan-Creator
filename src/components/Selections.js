import styled from "styled-components/macro";

const ColorFilledSelection = styled.Select`
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

const ColorBorderSelection = styled(ColorFilledSelections)`
  background-color: blue;
  color: white;
  @media screen and (max-width: 1279px) {
  }
`;


const Selections = () => {
  return (
    <div>
      <ColorFilledSelection></ColorFilledSelection>
      <ColorBorderSelection></ColorBorderSelection>
    </div>
  );
};

export default Selections;
export { ColorFilledSelections };
export { ColorBorderSelections };

