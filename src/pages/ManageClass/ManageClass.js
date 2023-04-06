import React from "react";
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';

const CreateCourseBtn = styled.button`
  cursor: pointer;
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

function ManageClass() {
  return (
    <div>
      <p>ManageClass</p>
      <CreateCourseBtn>
        <Link to='/editclass'>建立課程</Link>
      </CreateCourseBtn>
    </div>
  );
}

export default ManageClass;
