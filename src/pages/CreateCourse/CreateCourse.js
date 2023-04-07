import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";

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

function CreateCourse() {
  return (
    <div>
      <h3>課程建立</h3>
      <Container>
        <Container1>
          <BtnContainer>
          <h4>單元列表</h4>
          <Btn>
              <Link to="/TeacherMain">回課程主頁</Link>
            </Btn>
          </BtnContainer>
        </Container1>
        <Container2 style={{ paddingLeft: "50px" }}>
          <h4>課程名稱</h4>
          <input></input>
          <h4>班級設定</h4>
          <input></input>
          <h4>開課時間</h4>
          <input></input>
          <Btn>
            <Link to="/CreateUnit">單元建立</Link>
          </Btn>
        </Container2>
      </Container>
    </div>
  );}

export default CreateCourse;
