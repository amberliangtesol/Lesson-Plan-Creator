import styled from "styled-components/macro";
import hat from "./hat.png";

const Container = styled.div`
  width: 100%;
  height: 66px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f46868;
  position: relative;
  position: fixed;
  bottom:0;
  z-index: 1000;
  @media screen and (max-width: 1279px) {
  }
`;

const Copywright = styled.p`
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #ffffff;
  @media screen and (max-width: 1279px) {
  }
`;

const Hat = styled.div`
  width: 105px;
  height: 135px;
  background-image: url(${hat});
  position: absolute;
  right: 0px;
  top: -104px;
  @media screen and (max-width: 1279px) {
  }
`;


const Footer = () => {
  return (
    <Container>
      <Hat></Hat>
      <Copywright>​Copyright © All Rights Reserved.</Copywright>
    </Container>
  );
};

export default Footer;
