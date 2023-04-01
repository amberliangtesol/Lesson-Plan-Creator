import React from "react";
import YouTubeWithQuestion from "./components/YouTubeWithQuestion";
import VideoWithQuestion from "./components/VideoWithQuestion";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import { createGlobalStyle } from "styled-components";

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
      {/* <Login />
      <Register /> */}
      {/* <YouTubeWithQuestion /> */}
      <VideoWithQuestion/>
    </>
  );
}

export default App;
