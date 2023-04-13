import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";


function Badge() {
  return (
    <div>
      <h3>徽章搜集</h3>
      <Container>
        <Container1>
          <BtnContainer>
            <Btn>
              <Link to="/StudentMain">課程主頁</Link>
            </Btn>
            <Btn>
              <Link to="/Badge">徽章搜集</Link>
            </Btn>
            <Btn>
              <Link to="/StudentProfile">個人設定</Link>
            </Btn>
          </BtnContainer>
        </Container1>
        <Container2 style={{ paddingLeft: "50px" }}></Container2>
      </Container>
    </div>
  );
}

const Btn = styled.button`
  cursor: pointer;
  width: 100px;
  height: 25px;
  a {
    text-decoration: none;
    color: #000000;
    &:hover,
    &:link,
    &:active {
      text-decoration: none;
    }
  }
`;

const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;
const Container1 = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
`;


export default Badge;
