import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import YouTubeWithQuestion from "./components/YouTubeWithQuestion";
import Badge from "./pages/Badge/Badge";
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
import UserInfoProvider, { UserContext } from "./UserInfoProvider";

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
  const { user } = useContext(UserContext);
  if (user.role && user.role !== "teacher") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

const StudentRouter = () => {
  const { user } = useContext(UserContext);
  if (user.role && user.role !== "student") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <UserInfoProvider>
      <GlobalStyle />
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<StudentRouter />}>
          <Route path="/studentmain" element={<StudentMain />} />
          <Route path="/badge" element={<Badge />} />
          <Route path="/studentprofile" element={<StudentProfile />} />
          <Route
            path="/youtubewithquestion/:lessonId"
            element={<YouTubeWithQuestion />}
          />
        </Route>

        <Route element={<TeacherRouter />}>
          <Route path="/teachermain" element={<TeacherMain />} />
          <Route path="/createcourse" element={<CreateCourse />} />
          <Route path="/create-unit/:lessonId" element={<CreateUnit />} />
          <Route path="/createunit" element={<CreateUnit />} />
          <Route path="/editcourse/:lessonId" element={<EditCourse />} />
          <Route path="/edit-unit/:lessonId" element={<EditUnit />} />
          <Route path="/editunit/:lessonId" element={<EditUnit />} />
          <Route path="/addclass" element={<AddClass />} />
          <Route path="/edit-class/:classId" element={<EditClass />} />
          <Route path="/score/:lessonId" element={<Score />} />
          <Route path="/score" element={<Score />} />
          <Route path="/managebadge" element={<ManageBadge />} />
          <Route path="/manageclass" element={<ManageClass />} />
          <Route path="/teacherprofile" element={<TeacherProfile />} />
        </Route>
      </Routes>
    </UserInfoProvider>
  );
}

export default App;
