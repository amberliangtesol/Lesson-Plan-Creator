import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components/macro";
import { orderBy, getDocs, query, addDoc, collection } from "firebase/firestore";
import { db } from "../../utils/firebaseApp";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";


function chunk(array, chunk) {
  let result = [];
  for (let i = 0; i < array.length; i += chunk) {
    result.push(array.slice(i, i + chunk));
  }
  return result;
}

function CreateUnit() {
  const { lessonDocId } = useParams();
  const { lessonId } = useParams();
  const [unitName, setUnitName] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputLink, setInputLink] = useState("");
  const [videoId, setVideoId] = useState("");
  const [explanation, setExplanation] = useState("");
  const [sortedUnits, setSortedUnits] = useState([]);
  const [currentUnitId, setCurrentUnitId] = useState();
  
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
      setCurrentUnitId(units[0].id);
    };

    fetchSortedUnits();
  }, [lessonId]);


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

  const handleCreate = () => {
    addDoc(collection(db, `lessons/${lessonDocId}/units`), {
      timestamp: new Date().valueOf(),
      description: description,
      subtitle: subTitle,
      test: totalTestArray.map((item, index) => {
        return {
          ...item,
          data: { ...item.data, id: index + 1 },
        };
      }),
      unitName: unitName,
      video: videoId,
      explanation: explanation,
    });
  };

  const handleAddTest = (e) => {
    const newTest = createTest();
    setTotalTestArray([...totalTestArray, { type: "", data: newTest }]);
    e.preventDefault();
  };

  console.log("totalTestArray", { totalTestArray });
  // console.log("testArray", { testArray });

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
    setInputLink(e.target.value);
  };

  const extractVideoId = () => {
    const url = new URL(inputLink);
    const videoId = url.searchParams.get("v");
    setVideoId(videoId);
  };

  return (
    <div>
     <h3>單元建立</h3>
      <Container>
        <Container1>
          <BtnContainer>
            <h4>單元列表</h4>
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
            ))}
            <Btn>
              <Link to="/TeacherMain">回課程主頁</Link>
            </Btn>
          </BtnContainer>
        </Container1>
        <Container2 style={{ paddingLeft: "50px" }}>
      <Link to="/CreateCourse">
        <button type="button" onClick={handleCreate}>
          完成送出
        </button>
      </Link>
      <Link to="/TeacherMain">
        <Btn>回首頁</Btn>
      </Link>      <form>
        <p>單元名稱</p>
        <input
          type="text"
          onChange={(e) => setUnitName(e.target.value)}
        ></input>

        <p>影音資料</p>
        {/* <input
          placeholder="影片檔案"
          type="file"
          onChange={(e) =>
            setVideoSource(URL.createObjectURL(e.target.files[0]))
          }
        ></input> */}
        <input
          type="text"
          value={inputLink}
          onChange={handleInputChange}
          placeholder="請貼上YouTube連結"
        ></input>
        <button type="button" onClick={extractVideoId}>
          確認連結
        </button>
        {/* {videoId && <p>Video ID: {videoId}</p>} */}
        {/* <div id="video-preview">
          {videoSource && (
            <iframe
              title="Video Preview"
              width="560"
              height="315"
              src={videoSource}
              // frameBorder="0"
              allowFullScreen
            ></iframe>
          )}
        </div> */}

        {/* YT預覽有問題 */}

        <p>單元小標</p>
        <input
          type="text"
          onChange={(e) => setSubTitle(e.target.value)}
        ></input>

        <p>補充說明</p>
        <input
          type="text"
          onChange={(e) => setDescription(e.target.value)}
        ></input>

        <p>加入測驗</p>
        <Splict></Splict>

        {totalTestArray.map((item, index) => (
          <div key={`test_${index}`}>
            <p>選擇題型</p>
            <select
              value={item.type}
              onChange={(e) => handleSelectType(e.target.value, index)}
            >
              <option value="">選擇題型</option>
              <option value="multiple-choice">選擇題</option>
              <option value="matching">翻翻牌</option>
              <option value="sorting">排序題</option>
            </select>
            {item.type === "multiple-choice" && (
              <div>
                '選擇題'
                <p>插入時間</p>
                <input
                  type="number"
                  value={item.data.time}
                  onChange={(e) => {
                    let timeArray = [...totalTestArray];
                    timeArray[index].data.time = e.target.value;
                    setTotalTestArray(timeArray);
                  }}
                />
                <p>對戰模式</p>
                <select
                  value={item.data.gameMode}
                  onChange={(e) => {
                    let gameModeArray = [...totalTestArray];
                    gameModeArray[index].data.gameMode = e.target.value;
                    setTotalTestArray(gameModeArray);
                  }}
                >
                  <option value="true">開啟</option>
                  <option value="false">關閉</option>
                </select>
                <p>問題</p>
                <input
                  type="text"
                  value={item.data.question}
                  onChange={(e) => {
                    let questionArray = [...totalTestArray];
                    questionArray[index].data.question = e.target.value;
                    setTotalTestArray(questionArray);
                  }}
                ></input>
                <p>詳解</p>
                <input
                  type="text"
                  value={item.data.explanation}
                  onChange={(e) => {
                    let explanationArray = [...totalTestArray];
                    explanationArray[index].data.explanation = e.target.value;
                    setTotalTestArray(explanationArray);
                  }}
                ></input>
                <p>選項</p>
                <label for="ans">解答</label>
                {(item.data.options || []).map((option, idx) => (
                  <div>
                    <input
                      key={`multiple_choice_checkbox_${idx}`}
                      type="checkbox"
                      checked={option.correct}
                      value="true"
                      onChange={(e) => {
                        const options = [...item.data.options];
                        options[idx] = {
                          ...options[idx],
                          correct: e.target.value,
                        };
                        handleChange(index, "options", options);
                      }}
                    />
                    <input
                      key={`multiple_choice_text_${idx}`}
                      type="text"
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
                  </div>
                ))}
                <button type="button" onClick={() => handleAddOption(index)}>
                  再加一個選項
                </button>
              </div>
            )}
            {item.type === "matching" && (
              <div>
                '翻翻牌'
                <p>插入時間</p>
                <input
                  type="number"
                  value={item.data.time}
                  onChange={(e) => {
                    let timeArray = [...totalTestArray];
                    timeArray[index].data.time = e.target.value;
                    setTotalTestArray(timeArray);
                  }}
                />
                <p>對戰模式</p>
                <select
                  value={item.data.gameMode}
                  onChange={(e) => {
                    let gameModeArray = [...totalTestArray];
                    gameModeArray[index].data.gameMode = e.target.value;
                    setTotalTestArray(gameModeArray);
                  }}
                >
                  <option value="true">開啟</option>
                  <option value="false">關閉</option>
                </select>
                <p>問題</p>
                <input
                  type="text"
                  value={item.data.question}
                  onChange={(e) => {
                    let questionArray = [...totalTestArray];
                    questionArray[index].data.question = e.target.value;
                    setTotalTestArray(questionArray);
                  }}
                ></input>
                <p>詳解</p>
                <input
                  type="text"
                  value={item.data.explanation}
                  onChange={(e) => {
                    let explanationArray = [...totalTestArray];
                    explanationArray[index].data.explanation = e.target.value;
                    setTotalTestArray(explanationArray);
                  }}
                ></input>
                <p>配對</p>
                {chunk(item.data.cards || [], 2).map((chunkedCards, idx) => {
                  return chunkedCards.map((card, iidx) => (
                    <div>
                      <input
                        key={`matching_question_${idx}_${iidx}`}
                        type="text"
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
                    </div>
                  ));
                })}
                <button type="button" onClick={() => handleAddOption(index)}>
                  再加一個選項
                </button>
              </div>
            )}
            {item.type === "sorting" && (
              <div>
                '排序題'
                <p>插入時間</p>
                <input
                  type="number"
                  value={item.data.time}
                  onChange={(e) => {
                    let timeArray = [...totalTestArray];
                    timeArray[index].data.time = e.target.value;
                    setTotalTestArray(timeArray);
                  }}
                />
                <p>對戰模式</p>
                <select
                  value={item.data.gameMode}
                  onChange={(e) => {
                    let gameModeArray = [...totalTestArray];
                    gameModeArray[index].data.gameMode = e.target.value;
                    setTotalTestArray(gameModeArray);
                  }}
                >
                  <option value="true">開啟</option>
                  <option value="false">關閉</option>
                </select>
                <p>問題</p>
                <input
                  type="text"
                  value={item.data.question}
                  onChange={(e) => {
                    let questionArray = [...totalTestArray];
                    questionArray[index].data.question = e.target.value;
                    setTotalTestArray(questionArray);
                  }}
                ></input>
                <p>詳解</p>
                <input
                  type="text"
                  value={item.data.explanation}
                  onChange={(e) => {
                    let explanationArray = [...totalTestArray];
                    explanationArray[index].data.explanation = e.target.value;
                    setTotalTestArray(explanationArray);
                  }}
                ></input>
                <p>選項</p>
                {(item.data.sorted || []).map((sorted, idx) => (
                  <div>
                    <input
                      key={`sorting_text_${idx}`}
                      type="text"
                      value={sorted.text}
                      onChange={(e) => {
                        const sorted = [...item.data.sorted];
                        sorted[idx] = e.target.value;
                        handleChange(index, "sorted", sorted);
                      }}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => handleAddOption(index)}>
                  再加一個選項
                </button>
              </div>
            )}{" "}
          </div>
        ))}

        <button onClick={handleAddTest}>再加一題</button>
      </form>
              </Container2>
      </Container>
    </div>
  );
}

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
  select {
    pointer-events: auto;
  }
`;

const Splict = styled.div`
  width: 500px;
  border-top: 1px solid;
`;

export default CreateUnit;
