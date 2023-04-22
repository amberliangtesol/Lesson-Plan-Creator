import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { AiOutlineCloudUpload as BsCloudUpload } from "react-icons/ai";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  orderBy,
  getDocs,
  addDoc,
  collection,
  query,
  onSnapshot,
  updateDoc,
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

function CreateCourse() {
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
      // Upload the image to Firebase Storage and get its URL
      const imageURL = await uploadImageAndGetURL(imageFile); // Replace imageFile with the actual file object

      // Create the document in Firestore with the image URL
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
                {/* <h4>單元列表</h4>
                {sortedUnits.map((unit, index) => (
                  <p
                    key={unit.id}
                    style={{
                      color: unit.id === currentUnitId ? "red" : "black",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setCurrentUnitId(unit.id);
                    }}
                  >
                    Unit {index + 1}: {unit.data.unitName}
                  </p>
                ))} */}

                <Btnwrapper>
                  <MdOutlineTipsAndUpdates
                    style={{ color: "black", fontSize: "24px" }}
                  />
                  <StyledParagraphTitle>Tips</StyledParagraphTitle>
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

              <MainRedFilledBtn
                type="button"
                onClick={handleCreate}
                style={{ marginLeft: "auto", marginBottom: "30px" }}
              >
                <Link to="/CreateUnit">單元建立</Link>
              </MainRedFilledBtn>

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
                    <option
                      key={`${classItem.id}_${classItem.index}`}
                      value={classItem.id}
                    >
                      {classItem.name}
                    </option>
                  ))}
                </SelectOptions>

                <CourseDetailText>開始時間</CourseDetailText>
                <CourseInput
                  type="datetime-local"
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
                  <CourseDetailReminder>
                    * 請選擇超過建立日期
                  </CourseDetailReminder>
                </div>
                <CourseInput
                  type="datetime-local"
                  value={new Date(endTimestamp).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEndTimestamp(new Date(e.target.value).getTime())
                  }
                />
              </CourseDetail>
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
  margin-bottom: 0;
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
  width: 50vw;
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
