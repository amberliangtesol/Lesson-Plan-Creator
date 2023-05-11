import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getDoc,
  doc,
  orderBy,
  getDocs,
  collection,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";

function EditCourse() {
  const { user, setUser } = useContext(UserContext);
  const { lessonId } = useParams();
  const [startTimestamp, setStartTimestamp] = useState(Date.now());
  const [endTimestamp, setEndTimestamp] = useState(Date.now());
  const [imageURL, setImageURL] = useState("");
  const [courseName, setCourseName] = useState("");
  const [classChoose, setClassChoose] = useState([]);
  const [classList, setClassList] = useState([]);
  const [imageFile, setImageFile] = useState("");
  const [sortedUnits, setSortedUnits] = useState([]);
  const [currentUnitId, setCurrentUnitId] = useState();
  const navigate = useNavigate();
  const now = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    async function fetchUserData() {
      if (!user.account || user.classNames) return;

      const docRef = doc(db, "users", user.account);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData) {
          const classNames = await Promise.all(
            userData.classes.map(async (classId) => {
              const classDoc = await getDoc(doc(db, "classes", classId));
              return {
                id: classId,
                name: classDoc.data() && classDoc.data().name,
              };
            })
          );
          setUser({
            ...user,
            image: userData.image,
            name: userData.name,
            classes: userData.classes,
            classNames,
          });
        }
      }
    }

    fetchUserData();
  }, [user]);

  useEffect(() => {
    setClassList(user.classNames || []);
  }, [user.classNames]);

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

  const uploadImageAndGetURL = async (imageFile) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${imageFile.name}`);

    await uploadBytes(storageRef, imageFile);

    const imageURL = await getDownloadURL(storageRef);

    return imageURL;
  };

  useEffect(() => {
    const fetchLesson = async () => {
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonDoc = await getDoc(lessonRef);

      if (lessonDoc.exists()) {
        const lessonData = lessonDoc.data();
        if (lessonData) {
          setCourseName(lessonData.name);
          setImageURL(lessonData.img);
          setStartTimestamp(lessonData.start_date);
          setEndTimestamp(lessonData.end_date);
          setClassChoose(lessonData.classes);
        }
        console.log("lessonData.classes", lessonData.classes);
      }
    };

    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    const fetchSortedUnits = async () => {
      console.log(`lessons/${lessonId}/units`);
      const unitsCollectionRef = collection(db, `lessons/${lessonId}/units`);
      const unitsQuery = query(unitsCollectionRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(unitsQuery);
      const units = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setSortedUnits(units);

      if (units.length > 0) {
        setCurrentUnitId(units[0].id);
      }
    };

    fetchSortedUnits();
  }, [lessonId]);

  const handleUpdate = async () => {
    try {
      let imgUrl = imageURL;
      if (imageFile) {
        imgUrl = await uploadImageAndGetURL(imageFile);
      }

      const lessonRef = doc(db, "lessons", lessonId);
      await updateDoc(lessonRef, {
        name: courseName,
        img: imgUrl,
        start_date: startTimestamp,
        end_date: endTimestamp,
        classes: classChoose,
      });
      navigate(`/edit-unit/${lessonId}`);
      console.log("Document updated with ID: ", lessonId);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  function setDropdownHeight() {
    const selectEl = document.querySelector("select");
    selectEl.setAttribute("size", selectEl.length);
  }

  return (
    <Body>
      <Content>
        <Container>
          <MainContent>
            <Container1>
              <BtnContainer>
                <h3
                  style={{
                    borderBottom: "3px solid #f46868",
                    paddingBottom: "18px",
                  }}
                >
                  單元列表
                </h3>
                {sortedUnits.map((unit, index) => (
                  <h3
                    key={unit.id}
                    style={{
                      color: unit.id === currentUnitId ? "#F46868" : "black",
                      fontWeight: unit.id === currentUnitId ? "700" : "400",
                      alignSelf: "flex-start",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setCurrentUnitId(unit.id);
                    }}
                  >
                    單元 {index + 1} : {unit.data.unitName}
                  </h3>
                ))}
                <MainDarkBorderBtn>
                  <Link to="/TeacherMain">回首頁</Link>
                </MainDarkBorderBtn>
              </BtnContainer>
            </Container1>

            <Container2>
              <Title>課程編輯</Title>
              <CourseDetail>
                <CourseDetailText>縮圖上傳</CourseDetailText>
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
                <CourseDetailText>課程名稱</CourseDetailText>
                <CourseInput
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                ></CourseInput>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <CourseDetailText>班級設定</CourseDetailText>
                  <CourseDetailReminder>
                    * 按下command或control鍵可多選
                  </CourseDetailReminder>
                </div>

                <SelectOptions
                  style={{ padding: "10px" }}
                  multiple
                  value={classChoose}
                  onChange={(e) => {
                    const selectedOptions = Array.from(
                      e.target.selectedOptions
                    ).map((option) => option.value);
                    setClassChoose(selectedOptions);
                    setDropdownHeight();
                  }}
                >
                  {classList.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </SelectOptions>

                <CourseDetailText>開始時間</CourseDetailText>
                <CourseInput
                  type="datetime-local"
                  min={now}
                  value={new Date(startTimestamp).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setStartTimestamp(new Date(e.target.value).getTime())
                  }
                />
                <CourseDetailText>結束時間</CourseDetailText>
                <CourseInput
                  type="datetime-local"
                  min={new Date(startTimestamp).toISOString().slice(0, 16)}
                  value={new Date(endTimestamp).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEndTimestamp(new Date(e.target.value).getTime())
                  }
                />
              </CourseDetail>
              <MainRedFilledBtn
                type="button"
                onClick={handleUpdate}
                style={{ width: "100%", marginLeft: "auto", marginTop: "30px" }}
              >
                單元編輯
              </MainRedFilledBtn>
            </Container2>
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
  margin-top: 50px;
`;

const Content = styled.div`
  flex: 1;
`;

const Container = styled.div`
  padding-top: 40px;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
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

const UploadLabel = styled.label`
  cursor: pointer;
`;

const BtnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container1 = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  align-items: center;
  text-align: center;
  background-color: rgb(245, 245, 245);
  min-height: 100vh;
  padding-top: 90px;
`;

const Container2 = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 50px;
  width: 65vw;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 90px;
  padding-right: 30px;
  padding-left: 30px;
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

const CourseInput = styled.input`
  width: 100%;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  padding-right: 30px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
  :focus {
    outline: 2px solid #f46868;
  }
  option:checked {
    background-color: #febebe;
  }
`;

const CourseDetail = styled.div`
  width: 100%;
  border-radius: 33px;
  background-color: rgb(245, 245, 245);
  padding: 30px 60px 50px 60px;
`;

const SelectOptions = styled.select`
  width: 100%;
  height: auto;
  background: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
  option:checked {
    background-color: #febebe;
  }
  :focus {
    outline: 2px solid #f46868;
  }
  option:checked {
    background-color: #febebe;
  }
`;

const CourseDetailText = styled.p`
  font-weight: 700;
  font-size: 18px;
  line-height: 19px;
  margin: 15px;
`;

const CourseDetailReminder = styled.p`
  font-weight: 700;
  font-size: 15px;
  line-height: 19px;
  margin: 10px;
  color: #f46868;
`;

export default EditCourse;
