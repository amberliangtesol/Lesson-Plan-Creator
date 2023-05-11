import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import UserInfoProvider, { UserContext } from "./UserInfoProvider";

import Course from "./pages/Course/Course";
import Badge from "./pages/Badge/Badge";
import CreateCourse from "./pages/CreateCourse/CreateCourse";
import CreateUnit from "./pages/CreateUnit/CreateUnit";
import EditCourse from "./pages/EditCourse/EditCourse";
import EditUnit from "./pages/EditUnit/EditUnit";
import CreateClass from "./pages/CreateClass/CreateClass";
import EditClass from "./pages/EditClass/EditClass";
import Login from "./pages/Login/Login";
import ManageBadge from "./pages/ManageBadge/ManageBadge";
import ManageClass from "./pages/ManageClass/ManageClass";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";
import Score from "./pages/Score/Score";
import Main from "./pages/Main/Main";
import TeacherMain from "./pages/TeacherMain/TeacherMain";
import StudentMain from "./pages/StudentMain/StudentMain";
import Header from "./components/Header";
import Footer from "./components/Footer";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
    body {
    font-family: 'Noto Sans TC', sans-serif;
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
  .swal2-title {
    font-size: 24px;
    padding: 0;
  }
  .swal2-image {
    margin-top: 0;
    margin-bottom: 0;
  }
`;

const TeacherRouter = () => {
  const { user, isLoading } = useContext(UserContext);
  if (!isLoading && !user.role) {
    return <Navigate to="/login" replace />;
  }
  if (user.role && user.role !== "teacher") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const StudentRouter = () => {
  const { user, isLoading } = useContext(UserContext);
  if (!isLoading && !user.role) {
    return <Navigate to="/login" replace />;
  }
  if (user.role && user.role !== "student") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const ShareRouter = () => {
  const { user, isLoading } = useContext(UserContext);
  if (!isLoading && !user.role) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <UserInfoProvider>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ShareRouter />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<StudentRouter />}>
          <Route path="/studentmain" element={<StudentMain />} />
          <Route path="/badge" element={<Badge />} />
          <Route path="/course/:lessonId" element={<Course />} />
        </Route>

        <Route element={<TeacherRouter />}>
          <Route path="/teachermain" element={<TeacherMain />} />
          <Route path="/createcourse" element={<CreateCourse />} />
          <Route path="/create-unit/:lessonId" element={<CreateUnit />} />
          <Route path="/createunit" element={<CreateUnit />} />
          <Route path="/editcourse/:lessonId" element={<EditCourse />} />
          <Route path="/edit-unit/:lessonId" element={<EditUnit />} />
          <Route path="/editunit/:lessonId" element={<EditUnit />} />
          <Route path="/createclass" element={<CreateClass />} />
          <Route path="/edit-class/:classId" element={<EditClass />} />
          <Route path="/score/:lessonId" element={<Score />} />
          <Route path="/score" element={<Score />} />
          <Route path="/managebadge" element={<ManageBadge />} />
          <Route path="/manageclass" element={<ManageClass />} />
        </Route>
      </Routes>
      <Footer />
    </UserInfoProvider>
  );
}

export default App;
