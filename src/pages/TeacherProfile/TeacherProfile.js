import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";
import { getAuth, signOut, sendPasswordResetEmail } from "firebase/auth";
import { UserContext } from "../../UserInfoProvider";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import Header from "../../components/Header";
import TeacherMainSidebar from "../../components/TeacherMainSidebar";

function TeacherProfile() {
  const [imageURL, setImageURL] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [name, setName] = useState("");
  const [classes, setClasses] = useState("");
  const [account, setAccount] = useState("");
  const { user, setUser } = useContext(UserContext);
  const [classNames, setClassNames] = useState([]);

  console.log(user.uid);

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
      // Upload the image to Firebase Storage and get its URL
      const imageURL = await uploadImageAndGetURL(imageFile); // Replace imageFile with the actual file object

      // Create the document in Firestore with the image URL
      await updateDoc(doc(db, "users", user.account), {
        name: name,
        account: account,
        classes: classes,
        image: imageURL,
      });
      console.log("修改成功");
    } catch (error) {
      console.error(error);
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

    // Upload the image to Firebase Storage
    await uploadBytes(storageRef, imageFile);

    // Get the download URL
    const imageURL = await getDownloadURL(storageRef);

    return imageURL;
  };

  useEffect(() => {
    async function fetchUserData() {
      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setImageURL(userData.image || "");
        setName(userData.name || "");
        setAccount(userData.account || "");
        setClasses(userData.classes || []);

        // Fetch class names
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
        console.log(" Sign-out successful");
      })
      .then(() => {
        setUser({});
      })
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleResetPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, user.account)
      .then(() => {
        console.log("Password reset email sent");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <Header></Header>

      <Container>
        <TeacherMainSidebar></TeacherMainSidebar>
        <div>
          <h3>個人設定</h3>
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
            <p>姓名: {name}</p>
            <p>帳號: {account}</p>
            <p>班級: {classNames.join(", ")}</p>
            <Btn onClick={handleResetPassword}>密碼變更</Btn>
            <Btn type="button" onClick={handleChange}>
              確認修改
            </Btn>
            <Btn onClick={logOut}>登出</Btn>
          </Container2>
        </div>
      </Container>
    </div>
  );
}

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

export default TeacherProfile;
