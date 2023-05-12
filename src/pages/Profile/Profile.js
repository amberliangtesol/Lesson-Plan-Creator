import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components/macro";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";
import { getAuth, signOut, sendPasswordResetEmail } from "firebase/auth";
import { UserContext } from "../../UserInfoProvider";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { TeacherMainSidebar } from "../../components/Sidebar";
import { StudentMainSidebar } from "../../components/Sidebar";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";
import { NoBorderBtn } from "../../components/Buttons";
import modal from "../../components/Modal";
import teacherprofile from "./ProfileAsset/teacherprofile.png";
import studentprofile from "./ProfileAsset/studentprofile.png";

function Profile() {
  const [imageURL, setImageURL] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [name, setName] = useState("");
  const [classes, setClasses] = useState("");
  const [account, setAccount] = useState("");
  const { user, setUser } = useContext(UserContext);
  const [classNames, setClassNames] = useState([]);

  const navigate = useNavigate();

  const UploadIcon = () => {
    return (
      <span>
        <BsCloudUpload />
      </span>
    );
  };

  const handleChange = async () => {
    try {
      const imageURL = await uploadImageAndGetURL(imageFile);
      await updateDoc(doc(db, "users", user.account), {
        name: name,
        account: account,
        classes: classes,
        image: imageURL,
      });
      modal.success("修改成功");
    } catch (error) {
      modal.success(error.code);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageURL(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageAndGetURL = async (imageFile) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${imageFile.name}`);

    await uploadBytes(storageRef, imageFile);

    const imageURL = await getDownloadURL(storageRef);

    return imageURL;
  };

  useEffect(() => {
    async function fetchUserData() {
      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === "teacher") {
          setImageURL(userData.image || teacherprofile);
        } else if (userData.role === "student") {
          setImageURL(userData.image || studentprofile);
        }
        setName(userData.name || "");
        setAccount(userData.account || "");
        setClasses(userData.classes || []);

        const classNames = await Promise.all(
          userData.classes.map(async (classId) => {
            const classDoc = await getDoc(doc(db, "classes", classId));
            return classDoc.data().name;
          })
        );
        setClassNames(classNames);
      }
    }

    fetchUserData();
  }, [user]);

  function logOut() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser({});
      })
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        modal.success(error.code);
      });
  }

  const handleResetPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, user.account)
      .then(() => {
        modal.success("已寄送密碼重設信至您的信箱");
      })
      .catch((error) => {
        modal.success(error.code);
      });
  };

  return (
    <Body>
      <Content>
        <Container>
          {user.role === "teacher" ? (
            <TeacherMainSidebar />
          ) : (
            <StudentMainSidebar />
          )}
          <MainContent>
            <Title>個人設定</Title>
            <Container2>
              <ProfileImg imageURL={imageURL}>
                <HoverText></HoverText>
                <IconWrapper>
                  <UploadLabel htmlFor="imageUpload">
                    <UploadIcon />
                  </UploadLabel>
                </IconWrapper>
              </ProfileImg>
              <ProfileImgUploadIcon
                id="imageUpload"
                type="file"
                accept="image/*"
                name="上傳"
                cursor="pointer"
                onChange={handleImageUpload}
              ></ProfileImgUploadIcon>
              <ProfileDetail>
                <ProfileDetailContainer>
                  <ProfileText>姓名</ProfileText> {name}
                </ProfileDetailContainer>

                <ProfileDetailContainer>
                  <ProfileText>班級</ProfileText>
                  {classNames && classNames.length > 0
                    ? classNames.join(", ")
                    : "目前尚無班級"}
                </ProfileDetailContainer>

                <ProfileDetailContainer>
                  <ProfileText>帳號</ProfileText> {account}
                </ProfileDetailContainer>

                <ProfileDetailContainer>
                  <ProfileText>密碼</ProfileText>
                  <EditIcon onClick={handleResetPassword}>變更</EditIcon>
                </ProfileDetailContainer>
              </ProfileDetail>
            </Container2>
            <ButtonContainer>
              <MainDarkBorderBtn onClick={logOut}>登出</MainDarkBorderBtn>
              <MainRedFilledBtn type="button" onClick={handleChange}>
                確認
              </MainRedFilledBtn>
            </ButtonContainer>
          </MainContent>
        </Container>
      </Content>
    </Body>
  );
}

const Body = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 50px;
`;

const Content = styled.div`
  flex: 1;
  height: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  margin-top: 90px;
  margin-bottom: 90px;
  padding-right: 30px;
  padding-left: 30px;
`;

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0em;
  margin-top: 0;
  margin-bottom: 30px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 50px;
  padding-right: 50px;
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 33px;
  padding: 40px 80px 10px 80px;
  box-shadow: rgb(0 0 0 / 40%) 0px 1px 4px 0px;
`;

const HoverText = styled.div`
  width: 150px;
  height: 150px;
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
`;

const IconWrapper = styled.span`
  position: absolute;
`;

const ProfileImg = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  box-shadow: rgb(0 0 0 / 50%) 0px 1px 4px 0px;
  background-image: url(${(props) => props.imageURL});
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  position: relative;
  & ${IconWrapper}, & ${HoverText} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: none;
  }
  &:hover ${IconWrapper}, &:hover ${HoverText} {
    display: block;
  }
`;

const ProfileDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const ProfileDetailContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
`;

const ProfileText = styled.div`
  font-size: 18px;
  font-weight: 700;
  line-height: 19px;
  white-space: nowrap;
`;

const UploadLabel = styled.label`
  cursor: pointer;
  font-size: 30px;
  font-weight: 700;
  padding: 40px;
  color: #ffffff;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 30px;
  align-items: center;
  justify-content: center;
`;

const CustomNoBorderBtn = styled(NoBorderBtn)`
  &::before {
    content: "✎";
    color: #f46868;
    margin-right: 5px;
  }
`;

const ProfileImgUploadIcon = styled.input`
  display: none;
`;

const EditIcon = styled(CustomNoBorderBtn)`
  height: 30px;
  width: 80px;
  justify-content: flex-start;
`;

export default Profile;
