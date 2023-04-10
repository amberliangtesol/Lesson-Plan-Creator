import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";
import { getAuth, signOut } from "firebase/auth";
import { UserContext } from "../../UserInfoProvider";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";

const Btn = styled.button`
  cursor: pointer;
  width: 70px;
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

function TeacherProfile() {
  const [imageURL, setImageURL] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [name, setName] = useState("");
  const [classes, setClasses] = useState("");
  const [account, setAccount] = useState("");

  const { user, setUser } = useContext(UserContext);
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
    if (user) {
      setName(user.name || "");
      setAccount(user.account || "");
      setClasses(user.classes || []);
      setImageURL(user.image || "");
    }
  }, [user]);

  // const fetchUserData = async (email) => {
  //   try {
  //     console.log("here");

  //     const userDocRef = doc(db, "users", email);
  //     const userDocSnapshot = await getDoc(userDocRef);
  
  //     if (userDocSnapshot.exists()) {
  //       const userData = userDocSnapshot.data();
  //       const uid = userData.uid;

  //       if (uid) {
  //         const uidDocRef = doc(db, "users", uid);
  //         const uidDocSnapshot = await getDoc(uidDocRef);
  
  //         if (uidDocSnapshot.exists()) {
  //           const uidData = uidDocSnapshot.data();
  //           setName(uidData.name || "");
  //           setAccount(uidData.account || "");
  //           setClasses(uidData.classes || []);
  //           setImageURL(uidData.image || "");
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //   }
  // };
  
  
  // useEffect(() => {
  //   if (user && user.email) {
  //     fetchUserData(user.email);
  //   }
  // }, [user]);
  
  

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

  return (
    <div>
      <h3>徽章管理</h3>
      <Container>
        <Container1>
          <BtnContainer>
            <Btn>
              <Link to="/TeacherMain">課程主頁</Link>
            </Btn>
            <Btn>
              <Link to="/ManageClass">班級管理</Link>
            </Btn>
            <Btn>
              <Link to="/ManageBadge">徽章管理</Link>
            </Btn>
            <Btn>
              <Link to="/TeacherProfile">個人設定</Link>
            </Btn>
          </BtnContainer>
        </Container1>
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
          <p>
            姓名:{" "}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </p>
          <p>
            帳號:{" "}
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </p>
          <p>
            班級:{" "}
            <input
              type="text"
              value={classes}
              onChange={(e) => setClasses(e.target.value)}
            />
          </p>
          <p>密碼: {user.password || ""}</p>
          <Btn type="button" onClick={handleChange}>
            確認修改
          </Btn>
          <Btn onClick={logOut}>登出</Btn>
        </Container2>
      </Container>
    </div>
  );
}

export default TeacherProfile;