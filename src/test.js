import React from "react";
import { useState } from "react";
import styled from "styled-components/macro";

const Splict = styled.div`
  width: 500px;
  border-top: 1px solid;
`;

function CreateUnit() {
  const [unitName, setUnitName] = useState("");
  const [videoSource, setVideoSource] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeStamp, setTimeStamp] = useState("");
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [optionsState, setOptionsState] = useState("");
  const [optionContent, setOptionContent] = useState({
    correct: false,
    text: "",
  });

  const [totalTestArray, setTotalTestArray] = useState([
    { type: "", data: {} },
  ]);
  const [testArray, setTestArray] = useState([{ correct: false, text: "" }]);

  const handleCreate = () => {
    //setDoc
  };

  // function convertToSeconds(timeStamp) {
  //   const [hours, minutes, seconds] = timeStamp.split(":").map(parseFloat);
  //   if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
  //     return NaN;
  //   }
  //   const totalSeconds = hours * 60 * 60 + minutes * 60 + seconds;
  //   return totalSeconds;
  // }

  // function handleChange(event) {
  //   const input = event.target.value;
  //   setTimeStamp(input);
  //   console.log(input);
  //   setTotalSeconds(convertToSeconds(input));
  // }
  console.log({ totalTestArray });

  const handleAddOption = (e) => {
    e.preventDefault();
    setTestArray([...testArray, { correct: false, text: "" }]);
  };

  const handleAddTest = (e) => {
    setTotalTestArray([...totalTestArray, { type: "", data: {} }]);
    e.preventDefault();
  };

  return (
    <div>
      <button type="button" onClick={handleCreate}>
        完成送出
      </button>
      <form>
        <p>單元名稱</p>
        <input
          type="text"
          onChange={(e) => setUnitName(e.target.value)}
        ></input>

        <p>影音資料</p>
        <input
          placeholder="影片檔案"
          type="file"
          onChange={(e) =>
            setVideoSource(URL.createObjectURL(e.target.files[0]))
          }
        ></input>
        <input
          placeholder="影片連結"
          type="link"
          onChange={(e) =>
            setVideoSource(
              `https://www.youtube.com/embed/${e.target.value.split("=")[1]}`
            )
          }
        ></input>
        <div id="video-preview">
          {videoSource && (
            <iframe
              width="560"
              height="315"
              src={videoSource}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          )}
        </div>
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
          <div>
            <p>選擇題型</p>
            <select
              value={item.type}
              onChange={(e) => {
                let typeArray = [...totalTestArray];
                typeArray[index].type = e.target.value;
                setTotalTestArray(typeArray);
              }}
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
                  type="text"
                  value={item.data.time}
                  onChange={(e) => {
                    let timeArray = [...totalTestArray];
                    timeArray[index].data.time = e.target.value;
                    setTimeStamp(timeArray);
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
                    setQuestion(e.target.value)
                  }}
                ></input>
                <p>詳解</p>
                <input
                  type="text"
                  onChange={(e) => {
                    let explanationArray = [...totalTestArray];
                    explanationArray[index].data.explanation = e.target.value;
                    setExplanation(e.target.value)
                  }}
                ></input>
                <p>選項</p>
                <label for="correctAns">解答</label>
                {testArray.map((item, index) => (
                  <div>
                    <input
                      type="checkbox"
                      checked={item.correct}
                      value="true"
                      onChange={(e) => {
                        let updateArray = [...testArray];
                        updateArray[index].correct = e.target.checked;
                        setTestArray(updateArray);
                      }}
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        let updateArray = [...testArray];
                        updateArray[index].text = e.target.value;
                        setTestArray(updateArray);
                      }}
                    />
                  </div>
                ))}
                <button onClick={handleAddOption}>再加一個選項</button>
              </div>
            )}

            {item.type === "matching" && "翻翻牌"}

            {item.type === "sorting" && "排序題"}
          </div>
        ))}

        <button onClick={handleAddTest}>再加一題</button>
      </form>
    </div>
  );
}

export default CreateUnit;