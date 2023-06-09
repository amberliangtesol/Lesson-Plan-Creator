import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components/macro";
import {
  getDoc,
  doc,
  orderBy,
  getDocs,
  query,
  updateDoc,
  collection,
} from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { MainRedFilledBtn } from "../../components/Buttons";
import { MainDarkBorderBtn } from "../../components/Buttons";
import { NoBorderBtn } from "../../components/Buttons";
import arrow from "./arrow.png";

function chunk(array, chunk) {
  let result = [];
  for (let i = 0; i < array.length; i += chunk) {
    result.push(array.slice(i, i + chunk));
  }
  return result;
}

function EditUnit() {
  const { lessonDocId, lessonId } = useParams();
  const [unitName, setUnitName] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputLink, setInputLink] = useState("");
  const [videoId, setVideoId] = useState("");
  const [explanation, setExplanation] = useState("");
  const [sortedUnits, setSortedUnits] = useState([]);
  const [currentUnitId, setCurrentUnitId] = useState();
  const [lessonData, setLessonData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessonData = async () => {
      const lessonDocRef = doc(db, "lessons", lessonId, "units", currentUnitId);
      const lessonSnapshot = await getDoc(lessonDocRef);
      if (lessonSnapshot.exists()) {
        setLessonData(lessonSnapshot.data());
        setUnitName(lessonSnapshot.data().unitName);
        setSubTitle(lessonSnapshot.data().subtitle);
        setDescription(lessonSnapshot.data().description);
        setInputLink(lessonSnapshot.data().inputLink);
        setVideoId(lessonSnapshot.data().video);
        setExplanation(lessonSnapshot.data().explanation);
        setTotalTestArray(lessonSnapshot.data().test);
      }
    };

    fetchLessonData();
  }, [lessonId, currentUnitId]);

  const createTest = (type) => {
    const init = {
      explanation: "",
      gameMode: "",
      time: "",
      question: "",
    };
    switch (type) {
      case "matching":
        return {
          ...init,
          cards: [
            { id: 1, text: "" },
            { id: 1, text: "" },
          ],
        };
      case "multiple-choice":
        return {
          ...init,
          options: [{ correct: false, text: "" }],
        };
      case "sorting":
        return {
          ...init,
          sorted: [""],
        };
      default:
        return {
          ...init,
        };
    }
  };

  const [totalTestArray, setTotalTestArray] = useState([
    { type: "", data: {} },
  ]);

  const handleUpdate = async () => {
    let id = videoId;
    if (videoId) {
      let url;
      try {
        url = new URL(videoId);
      } catch (e) {}
      if (url) {
        id = url.searchParams.get("v");
      }
    }

    try {
      const lessonDocRef = doc(db, `lessons/${lessonId}/units`, currentUnitId);

      await updateDoc(lessonDocRef, {
        description: description,
        subtitle: subTitle,
        test: totalTestArray.map((item, index) => {
          return {
            ...item,
            data: {
              ...item.data,
              gameMode: item.data.gameMode === "true",
              id: index + 1,
            },
          };
        }),
        unitName: unitName,
        video: id,
        explanation: explanation,
      });
      navigate("/teachermain");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const handleAddTest = (e) => {
    const newTest = createTest();
    setTotalTestArray([...totalTestArray, { type: "", data: newTest }]);
    e.preventDefault();
  };

  const handleAddOption = (index) => {
    const newTotalTestArray = [...totalTestArray];
    const { type, data } = newTotalTestArray[index];

    if (type === "multiple-choice") {
      data.options = [...data.options, { correct: false, text: "" }];
    } else if (type === "sorting") {
      data.sorted = [...data.sorted, ""];
    } else if (type === "matching") {
      const idNum = (data.cards.length + 2) / 2;
      data.cards = [
        ...data.cards,
        { id: idNum, text: "" },
        { id: idNum, text: "" },
      ];
    }
    newTotalTestArray[index] = { type, data };
    setTotalTestArray(newTotalTestArray);
  };

  const handleSelectType = (type, index) => {
    const test = createTest(type, index);
    const newTotalTestArray = [...totalTestArray];
    newTotalTestArray[index] = { type, data: test };
    setTotalTestArray(newTotalTestArray);
  };

  const handleChange = (index, key, value) => {
    const newTotalTestArray = [...totalTestArray];
    const { type, data } = newTotalTestArray[index];
    data[key] = value;
    newTotalTestArray[index] = { type, data };
    setTotalTestArray(newTotalTestArray);
  };

  const handleInputChange = (e) => {
    setVideoId(e.target.value);
  };

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

  return (
    <Body>
      <Content>
        <Container>
          <Container1>
            <BtnContainer>
              <BtnContainerText>單元列表</BtnContainerText>
              {sortedUnits.map((unit, index) => (
                <UnitText
                  key={unit.id}
                  isSelected={unit.id === currentUnitId}
                  onClick={() => {
                    setCurrentUnitId(unit.id);
                  }}
                >
                  單元 {index + 1} : {unit.data.unitName}
                </UnitText>
              ))}
              <MainDarkBorderBtn>
                <Link to="/TeacherMain">回首頁</Link>
              </MainDarkBorderBtn>
            </BtnContainer>
          </Container1>
          <Container2>
            <Title>單元編輯</Title>
            <form>
              <UnitInfo>
                <CourseDetailText>單元名稱</CourseDetailText>
                <CourseInput
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                ></CourseInput>
                <VideoLinkWrapper>
                  <CourseDetailText>影音資料</CourseDetailText>
                  <CourseDetailReminder>
                    * 請檢查YouTube影片權限是否為公開
                  </CourseDetailReminder>
                </VideoLinkWrapper>
                <CourseInput
                  type="text"
                  value={videoId}
                  onChange={handleInputChange}
                  placeholder="請貼上YouTube連結"
                ></CourseInput>

                <CourseDetailText>單元小標</CourseDetailText>
                <CourseInput
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                ></CourseInput>
                <CourseDetailText>補充說明</CourseDetailText>
                <CourseInput
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></CourseInput>
              </UnitInfo>
              <Title>加入測驗</Title>
              <div>
                {totalTestArray.map((item, index) => (
                  <Addtest key={`test_${index}`}>
                    <CourseDetailText>選擇題型</CourseDetailText>
                    <SelectOptions
                      value={item.type}
                      onChange={(e) => handleSelectType(e.target.value, index)}
                    >
                      <option value="">選擇題型</option>
                      <option value="multiple-choice">選擇題</option>
                      <option value="matching">翻翻牌</option>
                      <option value="sorting">排序題</option>
                    </SelectOptions>
                    {item.type === "multiple-choice" && (
                      <div>
                        <TimeInputWrapper>
                          <CourseDetailText>插入時間</CourseDetailText>
                          <CourseDetailReminder>
                            * 請輸入該題目在影片出現的秒數
                          </CourseDetailReminder>
                        </TimeInputWrapper>
                        <CourseInput
                          type="number"
                          min={1}
                          value={item.data.time}
                          onChange={(e) => {
                            let timeArray = [...totalTestArray];
                            timeArray[index].data.time = e.target.value;
                            setTotalTestArray(timeArray);
                          }}
                        />
                        <CourseDetailText>對戰模式</CourseDetailText>
                        <SelectOptions
                          value={item.data.gameMode}
                          onChange={(e) => {
                            let gameModeArray = [...totalTestArray];
                            gameModeArray[index].data.gameMode = e.target.value;
                            setTotalTestArray(gameModeArray);
                          }}
                        >
                          <option value="true">開啟</option>
                          <option value="false">關閉</option>
                        </SelectOptions>
                        <CourseDetailText>問題</CourseDetailText>
                        <CourseInput
                          type="text"
                          value={item.data.question}
                          onChange={(e) => {
                            let questionArray = [...totalTestArray];
                            questionArray[index].data.question = e.target.value;
                            setTotalTestArray(questionArray);
                          }}
                        ></CourseInput>
                        <CourseDetailText>詳解</CourseDetailText>
                        <CourseInput
                          type="text"
                          value={item.data.explanation}
                          onChange={(e) => {
                            let explanationArray = [...totalTestArray];
                            explanationArray[index].data.explanation =
                              e.target.value;
                            setTotalTestArray(explanationArray);
                          }}
                        ></CourseInput>

                        <OptionInputWrapper>
                          <CourseDetailText>選項</CourseDetailText>
                          <CourseDetailReminder>
                            * 請將選項為解答的項目打勾
                          </CourseDetailReminder>
                        </OptionInputWrapper>

                        {(item.data.options || []).map((option, idx) => (
                          <MultipleChoiceQuestion>
                            <CheckboxInput
                              key={`multiple_choice_checkbox_${idx}`}
                              type="checkbox"
                              checked={option.correct}
                              onChange={(e) => {
                                const options = [...item.data.options];
                                options[idx] = {
                                  ...options[idx],
                                  correct: e.target.checked,
                                };
                                handleChange(index, "options", options);
                              }}
                            />
                            <CourseInput
                              key={`multiple_choice_text_${idx}`}
                              type="text"
                              placeholder="輸入選項"
                              value={option.text}
                              onChange={(e) => {
                                const options = [...item.data.options];
                                options[idx] = {
                                  ...options[idx],
                                  text: e.target.value,
                                };
                                handleChange(index, "options", options);
                              }}
                            />
                          </MultipleChoiceQuestion>
                        ))}
                        <NoBorderBtn
                          type="button"
                          onClick={() => handleAddOption(index)}
                        >
                          再加一個選項
                        </NoBorderBtn>
                      </div>
                    )}
                    {item.type === "matching" && (
                      <div>
                        <TimeInputWrapper>
                          <CourseDetailText>插入時間</CourseDetailText>
                          <CourseDetailReminder>
                            * 請輸入該題目在影片出現的秒數
                          </CourseDetailReminder>
                        </TimeInputWrapper>
                        <CourseInput
                          type="number"
                          min={1}
                          value={item.data.time}
                          onChange={(e) => {
                            let timeArray = [...totalTestArray];
                            timeArray[index].data.time = e.target.value;
                            setTotalTestArray(timeArray);
                          }}
                        />
                        <CourseDetailText>對戰模式</CourseDetailText>
                        <SelectOptions
                          value={item.data.gameMode}
                          onChange={(e) => {
                            let gameModeArray = [...totalTestArray];
                            gameModeArray[index].data.gameMode = e.target.value;
                            setTotalTestArray(gameModeArray);
                          }}
                        >
                          <option value="true">開啟</option>
                          <option value="false">關閉</option>
                        </SelectOptions>
                        <CourseDetailText>問題</CourseDetailText>
                        <CourseInput
                          type="text"
                          value={item.data.question}
                          onChange={(e) => {
                            let questionArray = [...totalTestArray];
                            questionArray[index].data.question = e.target.value;
                            setTotalTestArray(questionArray);
                          }}
                        ></CourseInput>
                        <CourseDetailText>詳解</CourseDetailText>
                        <CourseInput
                          type="text"
                          value={item.data.explanation}
                          onChange={(e) => {
                            let explanationArray = [...totalTestArray];
                            explanationArray[index].data.explanation =
                              e.target.value;
                            setTotalTestArray(explanationArray);
                          }}
                        ></CourseInput>
                        <CourseDetailText>配對</CourseDetailText>
                        {chunk(item.data.cards || [], 2).map(
                          (chunkedCards, idx) => {
                            return chunkedCards.map((card, iidx) => (
                              <CourseInput
                                key={`matching_question_${idx}_${iidx}`}
                                type="text"
                                placeholder="輸入對應內容"
                                value={card.text}
                                onChange={(e) => {
                                  const cards = [...item.data.cards];
                                  const current = idx * 2 + iidx;
                                  cards[current] = {
                                    ...cards[current],
                                    text: e.target.value,
                                  };
                                  handleChange(index, "cards", cards);
                                }}
                              />
                            ));
                          }
                        )}
                        <NoBorderBtn
                          type="button"
                          onClick={() => handleAddOption(index)}
                        >
                          再加一個組合
                        </NoBorderBtn>
                      </div>
                    )}
                    {item.type === "sorting" && (
                      <div>
                        <TimeInputWrapper>
                          <CourseDetailText>插入時間</CourseDetailText>
                          <CourseDetailReminder>
                            * 請輸入該題目在影片出現的秒數
                          </CourseDetailReminder>
                        </TimeInputWrapper>
                        <CourseInput
                          type="number"
                          min={1}
                          value={item.data.time}
                          onChange={(e) => {
                            let timeArray = [...totalTestArray];
                            timeArray[index].data.time = e.target.value;
                            setTotalTestArray(timeArray);
                          }}
                        />
                        <CourseDetailText>對戰模式</CourseDetailText>
                        <SelectOptions
                          value={item.data.gameMode}
                          onChange={(e) => {
                            let gameModeArray = [...totalTestArray];
                            gameModeArray[index].data.gameMode = e.target.value;
                            setTotalTestArray(gameModeArray);
                          }}
                        >
                          <option value="true">開啟</option>
                          <option value="false">關閉</option>
                        </SelectOptions>
                        <CourseDetailText>問題</CourseDetailText>
                        <CourseInput
                          type="text"
                          value={item.data.question}
                          onChange={(e) => {
                            let questionArray = [...totalTestArray];
                            questionArray[index].data.question = e.target.value;
                            setTotalTestArray(questionArray);
                          }}
                        ></CourseInput>
                        <CourseDetailText>詳解</CourseDetailText>
                        <CourseInput
                          type="text"
                          value={item.data.explanation}
                          onChange={(e) => {
                            let explanationArray = [...totalTestArray];
                            explanationArray[index].data.explanation =
                              e.target.value;
                            setTotalTestArray(explanationArray);
                          }}
                        ></CourseInput>
                        <CourseDetailText>選項</CourseDetailText>
                        {(item.data.sorted || []).map((sorted, idx) => (
                          <div>
                            <CourseInput
                              key={`sorting_text_${idx}`}
                              type="text"
                              placeholder="請依序輸入排序內容"
                              value={sorted}
                              onChange={(e) => {
                                const sorted = [...item.data.sorted];
                                sorted[idx] = e.target.value;
                                handleChange(index, "sorted", sorted);
                              }}
                            />
                          </div>
                        ))}
                        <NoBorderBtn
                          type="button"
                          onClick={() => handleAddOption(index)}
                        >
                          再加一個順序
                        </NoBorderBtn>
                      </div>
                    )}
                  </Addtest>
                ))}
              </div>
              <AddQuestion onClick={handleAddTest}>再加一題</AddQuestion>
              <SubmitBtn type="button" onClick={handleUpdate}>
                完成送出
              </SubmitBtn>
            </form>
          </Container2>
        </Container>
      </Content>
      <CourseDetailText>單元編輯</CourseDetailText>
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
  text-align: center;
  margin-top: 30px;
  margin-bottom: 30px;
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

const CourseInput = styled.input`
  margin-top: 10px;
  margin-bottom: 10px;
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

const SelectOptions = styled.select`
  width: 100%;
  height: 40px;
  background: #ffffff;
  border-radius: 24px;
  font-size: 18px;
  padding-left: 15px;
  border: none;
  box-shadow: 0px 1px 4px 0px #00000033;
  appearance: none;
  background-image: url(${arrow});
  background-repeat: no-repeat;
  background-position: calc(100% - 20px) center;
  padding-right: 30px;
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

const UnitInfo = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-radius: 33px;
  width: 100%;
  padding: 30px 60px 50px 60px;
`;

const Addtest = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-radius: 33px;
  width: 100%;
  padding: 30px 60px 50px 60px;
  margin-bottom: 20px;
`;

const CheckboxInput = styled.input`
  width: 30px;
  height: 30px;
  background: #ffffff;
  border-radius: 40px;
  font-size: 18px;
  margin-right: 15px;
  border: none;
  outline: none;
  :focus {
    outline: 2px solid #f46868;
  }
  option:checked {
    background-color: #febebe;
  }
`;

const MultipleChoiceQuestion = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SubmitBtn = styled(MainRedFilledBtn)`
  width: 100%;
  margin-top: 20px;
`;

const AddQuestion = styled(MainDarkBorderBtn)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const OptionInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TimeInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const VideoLinkWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BtnContainerText = styled.h3`
  border-bottom: 3px solid #f46868;
  padding-bottom: 18px;
`;

const UnitText = styled.h3`
  color: ${({ isSelected }) => (isSelected ? "#F46868" : "black")};
  font-weight: ${({ isSelected }) => (isSelected ? "700" : "400")};
  align-self: flex-start;
  cursor: pointer;
`;

export default EditUnit;
