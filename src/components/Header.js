import styled from "styled-components/macro";
import logo from "./logo.png";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const [folded, setFolded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0 && !folded) {
        setFolded(true);
      } else if (window.scrollY === 0 && folded) {
        setFolded(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [folded]);

  return (
    <Container className={folded ? "folded" : ""}>
      <Link to="/">
        <Logo />
      </Link>
    </Container>
  );
};

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
  transition: transform 0.3s ease;
  z-index: 10000;

  &.folded {
    transform: translateY(-100%);
  }
`;

const Logo = styled.div`
  width: 252px;
  height: 51px;
  background-image: url(${logo});
  cursor: pointer;
  @media screen and (max-width: 1279px) {
  }
`;

export default Header;
