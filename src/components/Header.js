import styled from "styled-components/macro";
import logo from "./logo.png";
import { Link } from "react-router-dom";

const Container = styled.div`
  width: 100%;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.1));
  background-color: #ffffff;
  position: fixed;
  top: 0;
  z-index: 10000;
`;

const Logo = styled.div`
  width: 252px;
  height: 51px;
  background-image: url(${logo});
  cursor: pointer;
  @media screen and (max-width: 1279px) {
  }
`;

const Header = () => {
  return (
    <Container>
      <Link to="/">
        <Logo />
      </Link>
    </Container>
  );
};

export default Header;
