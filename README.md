<div align="center">
  <a href="https://lesson-plan-creator.web.app/" style="margin-bottom:20px; display:block;">
    <img src="./src/components/Asset/logo.png" alt="Logo" width="200px">
  </a>

![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/eslint-config-prettier/peer/eslint) ![License](https://img.shields.io/badge/License-MIT-blue)

  <p align="center">
    <a href="https://www.linkedin.com/in/amber-liang-b935a1136/">About Me</a>
    |
    <a href="https://lesson-plan-creator.web.app/">EduTube</a>
    |
    <a href="https://youtu.be/BENZstmD930">Demo</a>
  </p>
</div>

# EduTube

[EduTube](https://lesson-plan-creator.web.app/) is an interactive video lesson platform for teachers to insert questions at specific timestamps in YouTube videos, featuring a competitive game mode and badge collection to activate students' motivation.

## About

- Applied `React / React Router` for SPA, utilizing `useContext` for **global state management**.
- Applied `Styled-Components` to write CSS in JS efficiently.
- Designed `Firestore` data structures for managing course data and student information through **CRUD operations**.
- Incorporated image upload features through `Firebase Storage`.
- Leveraged `Firebase-admin functions` deployed to `Cloud Functions`, **teachers can create student accounts** by triggering the function.
- Controlled **video playback behavior** using the `YouTube IFrame Player API`, such as player controls, video playback functionality, pause functionality.
- Created **user tours** using the `react-joy-ride library`.
- Allowed teachers to upload and edit student data through **excel file** using the `react-excel-renderer library`.
- **Visualized student performance** data using the `Chart.js library`.

## Built with

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Styled Components](https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white) ![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)

**Libraries**

- react-joy-ride library
- react-excel-renderer library
- react-icons
- sweetalert2

### Flow chart

![flow chart](./src/components/Asset/readme/flowchart.png)

### Demo

1. Homepage animations and introductory videos enhance user experience.  
   ![main page](./src/components/Asset/readme/demo_mainpage.gif)
2. Student interface's game mode rewards correct answers with badges.
   ![game mode](./src/components/Asset/readme/demo_gamemode.gif)
3. Teacher interface has a course creation feature with three question types to choose from.
   ![create course](./src/components/Asset/readme/demo_createcourse.gif)
4. Teachers can view student performance data through a dedicated section with chart options in their interface.
   ![manage score](./src/components/Asset/readme/demo_score.gif)
5. Teacher interface allows class creation, with options to manually add students or upload a list from Excel. Student accounts are created and managed by teachers; thus unregistered students automatically get an account.  
   ![create class](./src/components/Asset/readme/demo_createclass.gif)
6. Teacher interface has a badge redemption feature; students without badges can't redeem.
   ![redeem badge](./src/components/Asset/readme/demo_redeembadge.gif)
