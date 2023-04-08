import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";

const UploadLabel = styled.label`
  cursor: pointer;
`;

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

const VideoImg = styled.div`
  width: 300px;
  height: 150px;
  border: 1px solid black;
  background-image: url(${(props) => props.imageURL});
  background-size: cover;
  background-position: center;
`;


function CreateCourse() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 10);
    setStartDate(now);
    setEndDate(now);
  }, []);

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
          <h4>縮圖上傳</h4>
          <VideoImg imageURL={imageURL}>
          <UploadLabel htmlFor="imageUpload">
            <UploadIcon />
          </UploadLabel>
          </VideoImg>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            name="上傳"
            cursor="pointer"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          ></input>
          <h4>課程名稱</h4>
          <input></input>
          <h4>班級設定</h4>
          <input></input>
          <h4>開始時間</h4>
          <input
            type="date"
            value={startDate}
            min={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          ></input>
          <h4>結束時間</h4>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          ></input>
          <Btn>
            <Link to="/CreateUnit">單元建立</Link>
          </Btn>
        </Container2>
      </Container>
    </div>
  );
}

export default CreateCourse;
