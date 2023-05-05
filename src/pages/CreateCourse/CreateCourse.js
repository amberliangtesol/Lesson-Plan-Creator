import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { UserContext } from "../../UserInfoProvider";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  onSnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { TbCircleNumber1 } from "react-icons/tb";
import { TbCircleNumber2 } from "react-icons/tb";
import { TbCircleNumber3 } from "react-icons/tb";
import modal from "../../components/Modal";

function CreateCourse() {
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

  // Call fetchUserData directly inside the component function
  async function fetchUserData() {
    if (!user.account || user.classNames) return;

    const docRef = doc(db, "users", user.account);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData) {
        // Add this condition to check if userData is defined
        // Fetch class names
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

  useEffect(() => {
    // Call fetchUserData on page load
    fetchUserData();
  }, []);

  useEffect(() => {
    // Set the classList state after the classNames property has been set
    setClassList(user.classNames || []);
  }, [user.classNames]);

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

      // Add a conditional check to make sure the units array is not empty
      if (units.length > 0) {
        setCurrentUnitId(units[0].id);
      }
    };

    fetchSortedUnits();
  }, [lessonId]);

  console.log("classList", classList);

  const UploadIcon = () => {
    return (
      <span
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <BsCloudUpload
          style={{
            color: "#f46868",
            fontSize: "40px",
            position: "absolute",
            top: "52px",
          }}
        />
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
      const imageURL = await uploadImageAndGetURL(imageFile);
      const docRef = await addDoc(collection(db, "lessons"), {
        name: courseName,
        img: imageURL,
        start_date: startTimestamp,
        end_date: endTimestamp,
        classes: classChoose,
      });
      await updateDoc(docRef, {
        id: docRef.id,
      });

      console.log(docRef.id);
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

  function setDropdownHeight() {
    const selectEl = document.querySelector("select");
    selectEl.setAttribute("size", selectEl.length);
  }

  return (
    <Body>
      <Header></Header>
      <Content>
        <Container>
          <MainContent>
            <Container1>
              <BtnContainer>
                <Btnwrapper>
                  <MdOutlineTipsAndUpdates
                    style={{ color: "black", fontSize: "24px" }}
                  />
                  <h3>Tips</h3>
                </Btnwrapper>

                <Btnwrapper style={{ marginTop: "50px" }}>
                  <TbCircleNumber1
                    style={{ color: "#f46868", fontSize: "24px" }}
                  />
                  <StyledParagraph>確認課程總體目標</StyledParagraph>
                </Btnwrapper>

                <Btnwrapper>
                  <TbCircleNumber2
                    style={{ color: "#f46868", fontSize: "24px" }}
                  />
                  <StyledParagraph>切分目標至小單元</StyledParagraph>
                </Btnwrapper>

                <Btnwrapper style={{ marginBottom: "100px" }}>
                  <TbCircleNumber3
                    style={{ color: "#f46868", fontSize: "24px" }}
                  />
                  <StyledParagraph>每個單元一段影片</StyledParagraph>
                </Btnwrapper>

                <MainDarkBorderBtn
                  style={{ width: "104px", alignSelf: "center" }}
                >
                  <Link to="/TeacherMain">回首頁</Link>
                </MainDarkBorderBtn>
              </BtnContainer>
            </Container1>

            <Container2>
              <Title>課程建立</Title>
              <CourseDetail>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <CourseDetailText>縮圖上傳</CourseDetailText>
                  <CourseDetailReminder>
                    * 最佳尺寸為300*150px
                  </CourseDetailReminder>
                </div>
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
                    * ⌘ 或 Ctrl 可多選
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <CourseDetailText>結束時間</CourseDetailText>
                </div>
                <CourseInput
                  type="datetime-local"
                  min={new Date(startTimestamp + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16)}
                  value={new Date(endTimestamp).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEndTimestamp(new Date(e.target.value).getTime())
                  }
                />
              </CourseDetail>
              <MainRedFilledBtn
                type="button"
                onClick={handleCreate}
                style={{
                  width: "100%",
                  marginTop: "30px",
                }}
              >
                單元建立
              </MainRedFilledBtn>
            </Container2>
          </MainContent>
        </Container>
      </Content>
      <Footer></Footer>
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
  background: #ffffff;
  box-shadow: 0px 1px 4px 0px #00000033;
  border-radius: 29px;
  background-image: url(${(props) => props.imageURL});
  background-size: cover;
  background-position: center;
`;

const StyledParagraphTitle = styled.p`
  display: flex;
  align-items: center;
  letter-spacing: 0.04em;
  color: black;
  text-decoration: none;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0em;
  @media screen and (max-width: 1279px) {
  }
`;

const StyledParagraph = styled.p`
  display: flex;
  align-items: center;
  letter-spacing: 0.04em;
  color: black;
  text-decoration: none;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0em;
  @media screen and (max-width: 1279px) {
  }
`;

const Btnwrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  position: relative;
  :first-child {
    border-bottom: 3px solid #f46868;
  }
  @media screen and (max-width: 1279px) {
  }
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

export default CreateCourse;
