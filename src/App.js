import React from "react";
import { Route, Routes } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

import VideoWithQuestion from "./components/VideoWithQuestion";
import YouTubeWithQuestion from "./components/YouTubeWithQuestion";
import GameMode from "./components/GameMode";
import Matching from "./components/Matching";
import MultipleChoice from "./components/MultipleChoice";
import Sorting from "./components/Sorting";
import Badge from "./pages/Badge/Badge";
import Course from "./pages/Course/Course";
import CreateCourse from "./pages/CreateCourse/CreateCourse";
import CreateUnit from "./pages/CreateUnit/CreateUnit";
import EditClass from "./pages/EditClass/EditClass";
import Login from "./pages/Login/Login";
import ManageBadge from "./pages/ManageBadge/ManageBadge";
import ManageClass from "./pages/ManageClass/ManageClass";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";
import Score from "./pages/Score/Score";
import TeacherMain from "./pages/TeacherMain/TeacherMain";
import StudentMain from "./pages/StudentMain/StudentMain";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
    body {
    font-family: 'Noto Sans TC', sans-serif;
  }
    #root {
    min-height: 100vh;
            position: relative;
    @media screen and (max-width: 1200px) {
    }
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/videowithquestion" element={<VideoWithQuestion />} />
        <Route path="/youtubewithquestion" element={<YouTubeWithQuestion />} />
        <Route path="/gamemode" element={<GameMode />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/multiplechoice" element={<MultipleChoice />} />
        <Route path="/sorting" element={<Sorting />} />
        <Route path="/badge" element={<Badge />} />
        <Route path="/course" element={<Course />} />
        <Route path="/CreateCourse" element={<CreateCourse />} />
        <Route path="/CreateUnit" element={<CreateUnit />} />
        <Route path="/editclass" element={<EditClass />} />
        <Route path="/login" element={<Login />} />
        <Route path="/managebadge" element={<ManageBadge />} />
        <Route path="/manageclass" element={<ManageClass />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/score" element={<Score />} />
        <Route path="/teachermain" element={<TeacherMain />} />
        <Route path="/studentmain" element={<StudentMain />} />
      </Routes>
    </>
  );
}

export default App;
