import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../utils/firebaseApp";
import { useNavigate } from 'react-router-dom';

const UploadLabel = styled.label`
  cursor: pointer;
`;

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
  select {
    pointer-events: auto;
  }
`;

const VideoImg = styled.div`
  width: 300px;
  height: 150px;
  border: 1px solid black;
  background-image: url(${(props) => props.imageURL});
  background-size: cover;
  background-position: center;
`;

function CreateCourse() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [courseName, setCourseName] = useState("");
  const [classChoose, setClassChoose] = useState([]);
  const [classList, setClassList] = useState([]);
  const [imageFile, setImageFile] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 10);
    setStartDate(now);
    setEndDate(now);
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      const classQuery = query(collection(db, "classes"));
      const unsubscribe = onSnapshot(classQuery, (querySnapshot) => {
        const classes = [];
        querySnapshot.forEach((doc) => {
          classes.push({ id: doc.id, ...doc.data() });
        });
        setClassList(classes);
      });

      return () => {
        unsubscribe();
      };
    };

    fetchClasses();
  }, []);

  const UploadIcon = () => {
    return (
      <span>
        <BsCloudUpload />
      </span>
    );
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

  const handleCreate = async () => {
    try {
      // Upload the image to Firebase Storage and get its URL
      const imageURL = await uploadImageAndGetURL(imageFile); // Replace imageFile with the actual file object

      // Create the document in Firestore with the image URL
      const docRef = await addDoc(collection(db, "lessons"), {
        name: courseName,
        img: imageURL,
        start_date: startDate,
        end_date: endDate,
        classes: classChoose,
      });
      const lessonDocId = docRef.id; 
      navigate(`/create-unit/${lessonDocId}`);

      console.log("Document created with ID: ", docRef.id);
    } catch (e) {
      console.error("Error creating document: ", e);
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

  return (
    <div>
      <h3>課程建立</h3>
      <Container>
        <Container1>
          <BtnContainer>
            <h4>單元列表</h4>
            <Btn>
              <Link to="/TeacherMain">回課程主頁</Link>
            </Btn>
          </BtnContainer>
        </Container1>
        <Container2 style={{ paddingLeft: "50px" }}>
          <h4>縮圖上傳</h4>
          <VideoImg imageURL={imageURL}>
            <UploadLabel htmlFor="imageUpload">
              <UploadIcon />
            </UploadLabel>
          </VideoImg>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            name="上傳"
            cursor="pointer"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          ></input>
          <h4>課程名稱</h4>
          <input
            type="text"
            onChange={(e) => setCourseName(e.target.value)}
          ></input>
          <h4>班級設定</h4>
          <select
            multiple
            value={classChoose}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions).map(
                (option) => option.value
              );
              setClassChoose(selectedOptions);
            }}
          >
            {/* <option value="" disabled>
              選擇班級
            </option> */}
            {classList.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}{" "}
              </option>
            ))}
          </select>

          <h4>開始時間</h4>
          <input
            type="date"
            value={startDate}
            min={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          ></input>
          <h4>結束時間</h4>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          ></input>
          <Btn type="button" onClick={handleCreate}>
            <Link to="/CreateUnit">單元建立</Link>
          </Btn>
        </Container2>
      </Container>
    </div>
  );
}

export default CreateCourse;
