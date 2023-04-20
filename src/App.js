import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import YouTubeWithQuestion from "./components/YouTubeWithQuestion";
import GameMode from "./components/GameMode";
import Matching from "./components/Matching/Matching";
import MultipleChoice from "./components/MultipleChoice";
import Sorting from "./components/Sorting";
import Badge from "./pages/Badge/Badge";
import Course from "./pages/Course/Course";
import CreateCourse from "./pages/CreateCourse/CreateCourse";
import CreateUnit from "./pages/CreateUnit/CreateUnit";
import EditCourse from "./pages/EditCourse/EditCourse";
import EditUnit from "./pages/EditUnit/EditUnit";
import AddClass from "./pages/AddClass/AddClass";
import EditClass from "./pages/EditClass/EditClass";
import Login from "./pages/Login/Login";
import ManageBadge from "./pages/ManageBadge/ManageBadge";
import ManageClass from "./pages/ManageClass/ManageClass";
import TeacherProfile from "./pages/TeacherProfile/TeacherProfile";
import StudentProfile from "./pages/StudentProfile/StudentProfile";
import Register from "./pages/Register/Register";
import Score from "./pages/Score/Score";
import Main from "./pages/Main/Main";
import TeacherMain from "./pages/TeacherMain/TeacherMain";
import StudentMain from "./pages/StudentMain/StudentMain";
import UserInfoProvider from "./UserInfoProvider";
import HoverComputer from "./components/HoverComputer/HoverComputer";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
    body {
    font-family: 'Noto Sans TC';
    margin: 0;
    padding:0;
  }
    #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;    
    position: relative;
    @media screen and (max-width: 1200px) {
    }
  }
`;


function App() {
  return (
    <UserInfoProvider>
      <GlobalStyle />
      <Routes>
        <Route
          path="/youtubewithquestion/:lessonId"
          element={<YouTubeWithQuestion />}
        />
        <Route path="/gamemode" element={<GameMode />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/multiplechoice" element={<MultipleChoice />} />
        <Route path="/sorting" element={<Sorting />} />
        <Route path="/badge" element={<Badge />} />
        <Route path="/course" element={<Course />} />

        <Route path="/createcourse" element={<CreateCourse />} />
        <Route path="/create-unit/:lessonId" element={<CreateUnit />} />

        <Route path="/editcourse/:lessonId" element={<EditCourse />} />
        <Route path="/edit-unit/:lessonId" element={<EditUnit />} />

        <Route path="/addclass" element={<AddClass />} />
        <Route path="/edit-class/:classId" element={<EditClass />} />
        <Route path="/login" element={<Login />} />
        <Route path="/managebadge" element={<ManageBadge />} />
        <Route path="/manageclass" element={<ManageClass />} />
        <Route path="/teacherprofile" element={<TeacherProfile />} />
        <Route path="/studentprofile" element={<StudentProfile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/score/:lessonId" element={<Score />} />
        <Route path="/" element={<Main />} />
        <Route path="/teachermain" element={<TeacherMain />} />
        <Route path="/studentmain" element={<StudentMain />} />
        <Route path="/hovercomputer" element={<HoverComputer />} />
      </Routes>
    </UserInfoProvider>
  );
}

export default App;
