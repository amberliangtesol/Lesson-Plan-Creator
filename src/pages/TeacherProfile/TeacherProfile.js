import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";
import { useState } from "react";

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

const ProfileImg = styled.div`
  width: 150px;
  height: 150px;
  border: 1px solid black;
  background-image: url(${(props) => props.imageURL});
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const IconWrapper = styled.span`
  position: absolute;
`;

const UploadLabel = styled.label`
  cursor: pointer;
`;

function TeacherProfile() {
  const [imageURL, setImageURL] = useState("");

  const UploadIcon = () => {
    return (
      <span>
        <BsCloudUpload />
      </span>
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
        <Container2 style={{ paddingLeft: "50px" }}>
          <ProfileImg imageURL={imageURL}>
            <IconWrapper>
              <UploadLabel htmlFor="imageUpload">
                <UploadIcon />
              </UploadLabel>
            </IconWrapper>
          </ProfileImg>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            name="上傳"
            cursor="pointer"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          ></input>
          <p>姓名</p>
          <p>帳號</p>
          <p>班級</p>
          <p>密碼</p>
          <Btn>確認修改</Btn>
          <Btn>登出</Btn>
        </Container2>
      </Container>
    </div>
  );
}

export default TeacherProfile;
