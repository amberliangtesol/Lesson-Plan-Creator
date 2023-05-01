import React, { useState, useEffect } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import styled from "styled-components/macro";

const processDonutData = (data) => {
  const labels = Object.keys(data);

  if (labels.length === 0) {
    return [
      { datasets: [], labels: [] },
      { datasets: [], labels: [] },
      { datasets: [], labels: [] },
    ];
  }

  // Donut 1
  const unfinished = labels.filter((student) => {
    return data[student].some((e) => Object.keys(e).length === 0);
  });
  const unfinishedRate = (unfinished.length / labels.length) * 100;
  // const finishRates = labels.map((label) => {
  //   const answered = data[label].filter(
  //     (q) => Object.values(q)[0] !== "" || Object.values(q)[0] !== "未答" // Add condition for "未答"
  //   ).length;
  //   const finishRate = (answered / data[label].length) * 100;
  //   return isNaN(finishRate) ? 0 : finishRate; // If there's no answer, set the finish rate to 0
  // });
  // const avgFinishRate = finishRates.reduce((a, b) => a + b, 0) / labels.length;
  // const answeredZero = labels.filter((label) => {
  //   const answered = data[label].filter(
  //     (q) => Object.values(q)[0] !== "" || Object.values(q)[0] !== "未答" // Add condition for "未答"
  //   ).length;
  //   return answered === 0;
  // }).length;
  // const answeredZeroPercentage = (answeredZero / labels.length) * 100;

  // Donut 2
  const finished = labels.length - unfinished.length;
  const results = labels.map((student) => {
    const correctCnt = data[student].filter((s) => {
      return Object.values(s)[0];
    });
    return (correctCnt.length / data[student].length) * 100;
  });
  const correctRate =
    results.reduce((acc, cur) => acc + cur, 0) /
    results.filter((r) => r > 0).length;
  // const finishedAnswered = finished *

  // const correctRates = labels.map((label) => {
  //   const correct = data[label].filter(
  //     (q) => Object.values(q)[0] === true
  //   ).length;
  //   const correctRate = (correct / data[label].length) * 100;
  //   return isNaN(correctRate) ? 0 : correctRate; // If there's no answer, set the correct rate to 0
  // });
  // const avgCorrectRate =
  //   correctRates.reduce((a, b) => a + b, 0) / labels.length;

  // Donut 3
  const specialStudent = results.filter((r) => r > 0 && r < 50);

  // const notFinished = labels.filter((label) => {
  //   const answered = data[label].filter(
  //     (q) => Object.values(q)[0] !== "" || Object.values(q)[0] !== "未答" // Add condition for "未答"
  //   ).length;
  //   return answered < data[label].length;
  // }).length;
  // const below50CorrectRate = labels.filter((label) => {
  //   const correct = data[label].filter(
  //     (q) => Object.values(q)[0] === true
  //   ).length;
  //   const correctRate = (correct / data[label].length) * 100;
  //   return correctRate < 50;
  // }).length;
  // const notFinishedPercentage = (notFinished / labels.length) * 100;
  // const below50CorrectRatePercentage =
  //   (below50CorrectRate / labels.length) * 100;

  return [
    {
      datasets: [
        {
          data: [unfinishedRate, 100 - unfinishedRate],
          backgroundColor: [
            "rgba(200, 200, 200, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
        },
      ],
      labels: ["未完成", "已完成"],
    },
    {
      datasets: [
        {
          data: [correctRate, 100 - correctRate],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(200, 200, 200, 0.6)",
          ],
        },
      ],
      labels: ["平均正確率", "平均錯誤率"],
    },
    {
      datasets: [
        {
          data: [unfinished.length, specialStudent.length],
          backgroundColor: [
            "rgba(255, 206, 86, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
        },
      ],
      labels: ["未完成者", "正確率低於50者"],
    },
  ];
};

const Chart = ({ data }) => {
  const [chartData, setChartData] = useState(null);
  const [donutData1, setDonutData1] = useState(null);
  const [donutData2, setDonutData2] = useState(null);
  const [donutData3, setDonutData3] = useState(null);

  useEffect(() => {
    const [d1, d2, d3] = processDonutData(data);
    setDonutData1(d1);
    setDonutData2(d2);
    setDonutData3(d3);
  }, [data]);

  const renderTable = () => {
    const studentIds = Object.keys(data);
    if (studentIds.length === 0) {
      return null;
    }

    const numQuestions = data[studentIds[0]] ? data[studentIds[0]].length : 0;

    return (
      <StyledTable>
        <thead>
          <tr>
            <th>學生帳號</th>
            {Array.from({ length: numQuestions }, (_, i) => (
              <th key={`question-${i}`}>第{i + 1}題</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {studentIds.map((studentId) => (
            <tr key={studentId}>
              <td>{studentId}</td>
              {data[studentId] &&
                data[studentId].map((q, i) => (
                  <td
                    key={`answer-${i}`}
                    style={{
                      color:
                        Object.values(q)[0] === true
                          ? "#545454"
                          : Object.values(q)[0] === false
                          ? "#f46868"
                          : "lightgray",
                    }}
                  >
                    {Object.values(q)[0] === true
                      ? "答對"
                      : Object.values(q)[0] === false
                      ? "答錯"
                      : "未答"}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    );
  };

  return (
    <div>
      <DonutChartsContainer>
        {donutData1 && (
          <DonutChartContainer>
            <Doughnut data={donutData1} />
            <p style={{ textAlign: "center" }}>作業完成率</p>
          </DonutChartContainer>
        )}
        {donutData2 && (
          <DonutChartContainer>
            <Doughnut data={donutData2} />
            <p style={{ textAlign: "center" }}>答題正確率</p>
          </DonutChartContainer>
        )}
        {donutData3 && (
          <DonutChartContainer>
            <Doughnut data={donutData3} />
            <p style={{ textAlign: "center" }}>需特別關注學生</p>
          </DonutChartContainer>
        )}
      </DonutChartsContainer>
      {chartData && (
        <BarChartContainer>
          <Bar data={chartData} />
        </BarChartContainer>
      )}
      {renderTable()}
    </div>
  );
};

const StyledTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  font-size: 14px;
  margin-top: 50px;

  td {
    padding: 8px;
    text-align: center;
  }

  th {
    padding: 15px 30px;
    text-align: center;
    font-size: 16px;
    color: #000000;
    border-bottom: dashed 2px #e4e1e1;
    font-weight: 500;
  }
`;

ChartJS.register(...registerables);

const DonutChartsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`;

const DonutChartContainer = styled.div`
  width: 25%;
`;

const BarChartContainer = styled.div`
  margin-top: 20px;
  width: 50%;
`;

export default Chart;
