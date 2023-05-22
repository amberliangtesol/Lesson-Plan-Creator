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
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
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

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    setClassList(user.classNames || []);
  }, [user.classNames]);

  useEffect(() => {
    const fetchSortedUnits = async () => {
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

  const UploadIcon = () => {
    return (
      <IconWrapper>
        <Icon />
      </IconWrapper>
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
      if (!imageFile) {
        modal.success("請上傳課程縮圖");
        return;
      }
      if (!courseName) {
        modal.success("請輸入課程名稱");
        return;
      }
      if (classChoose.length === 0) {
        modal.success("請設定班級");
        return;
      }
      if (!startTimestamp) {
        modal.success("請選擇開始時間");
        return;
      }
      if (!endTimestamp) {
        modal.success("請選擇結束時間");
        return;
      }
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
      const lessonDocId = docRef.id;
      navigate(`/create-unit/${lessonDocId}`);
    } catch (e) {
      console.error("Error creating document: ", e);
    }
  };

  const uploadImageAndGetURL = async (imageFile) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${imageFile.name}`);

    await uploadBytes(storageRef, imageFile);

    const imageURL = await getDownloadURL(storageRef);

    return imageURL;
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
                <Btnwrapper>
                  <TipsIcon />
                  <h3>Tips</h3>
                </Btnwrapper>

                <TargetBtnwrapper>
                  <NumOneIcon />
                  <StyledParagraph>確認課程總體目標</StyledParagraph>
                </TargetBtnwrapper>

                <Btnwrapper>
                  <NumTwoIcon />
                  <StyledParagraph>切分目標至小單元</StyledParagraph>
                </Btnwrapper>

                <SeperateUnitBtnwrapper>
                  <NumThreeIcon />
                  <StyledParagraph>每個單元一段影片</StyledParagraph>
                </SeperateUnitBtnwrapper>

                <BackToMain>
                  <Link to="/TeacherMain">回首頁</Link>
                </BackToMain>
              </BtnContainer>
            </Container1>

            <Container2>
              <Title>課程建立</Title>
              <CourseDetail>
                <ImgUploadWrapper>
                  <CourseDetailText>縮圖上傳</CourseDetailText>
                  <CourseDetailReminder>
                    * 最佳尺寸為300*150px
                  </CourseDetailReminder>
                </ImgUploadWrapper>
                <VideoImg imageURL={imageURL}>
                  <UploadLabel htmlFor="imageUpload">
                    <UploadIcon />
                  </UploadLabel>
                </VideoImg>
                <CourseImgInput
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  name="上傳"
                  cursor="pointer"
                  onChange={handleImageUpload}
                ></CourseImgInput>
                <CourseDetailText>課程名稱</CourseDetailText>
                <CourseInput
                  type="text"
                  onChange={(e) => setCourseName(e.target.value)}
                  maxLength={20}
                  placeholder="字數上限20字"
                ></CourseInput>
                <ClassSelectWrapper>
                  <CourseDetailText>班級設定</CourseDetailText>
                  <CourseDetailReminder>
                    * ⌘ 或 Ctrl 可多選
                  </CourseDetailReminder>
                </ClassSelectWrapper>
                <SelectOptions
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
                <EndTimeWrapper>
                  <CourseDetailText>結束時間</CourseDetailText>
                </EndTimeWrapper>
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
              <CreateUnitBtn type="button" onClick={handleCreate}>
                單元建立
              </CreateUnitBtn>
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
  padding-left: 50px;
  padding-right: 50px;
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
  padding: 10px;
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

const SeperateUnitBtnwrapper = styled(Btnwrapper)`
  margin-bottom: 100px;
`;

const TargetBtnwrapper = styled(Btnwrapper)`
  margin-top: 50px;
`;

const CreateUnitBtn = styled(MainRedFilledBtn)`
  width: 100%;
  margin-top: 30px;
`;

const EndTimeWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ClassSelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CourseImgInput = styled.input`
  display: none;
`;

const ImgUploadWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BackToMain = styled(MainDarkBorderBtn)`
  width: 104px;
  align-self: center;
`;

const NumThreeIcon = styled(TbCircleNumber3)`
  color: #f46868;
  font-size: 24px;
`;

const NumTwoIcon = styled(TbCircleNumber2)`
  color: #f46868;
  font-size: 24px;
`;

const NumOneIcon = styled(TbCircleNumber1)`
  color: #f46868;
  font-size: 24px;
`;

const TipsIcon = styled(MdOutlineTipsAndUpdates)`
  color: black;
  font-size: 24px;
`;

const IconWrapper = styled.span`
  display: flex;
  justify-content: center;
  position: relative;
`;

const Icon = styled(BsCloudUpload)`
  color: #f46868;
  font-size: 40px;
  position: absolute;
  top: 52px;
`;

export default CreateCourse;
