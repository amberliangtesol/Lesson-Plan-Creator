import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";

const Btn = styled.button`
  cursor: pointer;
  width: 70px;
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

function StudentProfile() {
  return (
    <div>
      <h3>徽章管理</h3>
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
        <Container2 style={{ paddingLeft: "50px" }}>
          <p>姓名</p>
          <p>帳號</p>
          <p>班級</p>
          <p>密碼</p>
        </Container2>
      </Container>
    </div>
  );
}

export default StudentProfile;
