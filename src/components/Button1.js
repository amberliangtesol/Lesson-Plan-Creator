import styled from "styled-components/macro";

const StyledButton = styled.div`
cursor: pointer;
width: 104px;
height: 41px;
border-radius: 33px;
background-color: #F46868;
color: white;
${'' /* a {
  text-decoration: none;
  color: #000000;
  &:hover,
  &:link,
  &:active {
    text-decoration: none;
  }
} */}
`;

const ConfirmButton = styled(StyledButton)`
background-color: blue;
color: white;
`;

const Button1 = ({childrean}) => {
  return <StyledButton>{childrean}</StyledButton>;
};

export default Button1;
export {ConfirmButton};


//minwidth限制寬度＋padding推寬度不要寫死
//presentational component傳什麼prop就顯示什麼（不會有任何state，符合pure function） vs container components邏輯