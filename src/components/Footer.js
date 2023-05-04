import styled from "styled-components/macro";
import hat from "./hat.png";

const Container = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f46868;
  position: relative;
  position: fixed;
  bottom: 0;
  z-index: 1000;
  @media screen and (max-width: 1279px) {
  }
`;

const Copywright = styled.p`
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  color: #ffffff;
  @media screen and (max-width: 1279px) {
  }
`;

const Footer = () => {
  return (
    <Container>
      <Copywright>​Copyright © All Rights Reserved.</Copywright>
    </Container>
  );
};

export default Footer;
