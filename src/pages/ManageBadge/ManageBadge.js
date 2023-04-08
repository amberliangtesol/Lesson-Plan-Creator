import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import badge from "./badge.png";


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

const Badge = styled.div`
  width: 86px;
  height: 86px;
  background-image: url(${badge});
  cursor: pointer;
`;

function ManageBadge() {
  return (
    <div>
      <h3>徽章管理</h3>
      <Container>
        <Container1>
          <BtnContainer>
            <Btn>
              <Link to="/TeacherMain">課程主頁</Link>
            </Btn>
            <Btn>
              <Link to="/ManageClass">班級管理</Link>
            </Btn>
            <Btn>
              <Link to="/ManageBadge">徽章管理</Link>
            </Btn>
            <Btn>
              <Link to="/TeacherProfile">個人設定</Link>
            </Btn>
          </BtnContainer>
        </Container1>
        <Container2 style={{ paddingLeft: "50px"}}>
        <Badge/><p>連續答對三題</p>
        <p>選擇班級</p>
        <input></input>
        <p>選擇學生</p>
        <input></input>
        <Btn style={{ marginBottom: "30px"}}>確認兌換</Btn>
        </Container2>

        <Container2 style={{ paddingLeft: "50px"}}>
        <Badge/><p>準時完成作業</p>
        <p>選擇班級</p>
        <input></input>
        <p>選擇學生</p>
        <input></input>
        <Btn style={{ marginBottom: "30px"}}>確認兌換</Btn>
        </Container2>

        <Container2 style={{ paddingLeft: "50px"}}>
        <Badge/><p>挑戰打怪成功</p>
        <p>選擇班級</p>
        <input></input>
        <p>選擇學生</p>
        <input></input>
        <Btn style={{ marginBottom: "30px"}}>確認兌換</Btn>
        </Container2>
      </Container>
    </div>
  );
}

export default ManageBadge;
