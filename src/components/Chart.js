import React, { useState, useEffect } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import styled from "styled-components/macro";

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 80%;
  margin-bottom: 2rem;

  th,
  td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f2f2f2;
  }
`;

ChartJS.register(...registerables);

const DonutChartsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 80%;
`;

const DonutChartContainer = styled.div`
  width: 25%;
`;

const BarChartContainer = styled.div`
  margin-top: 20px;
  width: 50%;
`;

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
  const finishRates = labels.map((label) => {
    const answered = data[label].filter(
      (q) => Object.values(q)[0] !== ""
    ).length;
    return (answered / data[label].length) * 100;
  });
  const avgFinishRate = finishRates.reduce((a, b) => a + b, 0) / labels.length;
  const answeredZero = labels.filter((label) => {
    const answered = data[label].filter(
      (q) => Object.values(q)[0] !== ""
    ).length;
    return answered === 0;
  }).length;
  const answeredZeroPercentage = (answeredZero / labels.length) * 100;

  // Donut 2
  const correctRates = labels.map((label) => {
    const correct = data[label].filter(
      (q) => Object.values(q)[0] === true
    ).length;
    return (correct / data[label].length) * 100;
  });
  const avgCorrectRate =
    correctRates.reduce((a, b) => a + b, 0) / labels.length;

  // Donut 3
  const notFinished = labels.filter((label) => {
    const answered = data[label].filter(
      (q) => Object.values(q)[0] !== ""
    ).length;
    return answered < data[label].length;
  }).length;
  const below50CorrectRate = labels.filter((label) => {
    const correct = data[label].filter(
      (q) => Object.values(q)[0] === true
    ).length;
    const correctRate = (correct / data[label].length) * 100;
    return correctRate < 50;
  }).length;
  const notFinishedPercentage = (notFinished / labels.length) * 100;
  const below50CorrectRatePercentage =
    (below50CorrectRate / labels.length) * 100;

  return [
    {
      datasets: [
        {
          data: [
            avgFinishRate,
            100 - avgFinishRate - answeredZeroPercentage,
            answeredZeroPercentage,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(200, 200, 200, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
        },
      ],
      labels: ["完成率", "未完成者", "未作答者"],
    },
    {
      datasets: [
        {
          data: [avgCorrectRate, 100 - avgCorrectRate],
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
          data: [
            notFinishedPercentage,
            below50CorrectRatePercentage,
            100 - notFinishedPercentage - below50CorrectRatePercentage,
          ],
          backgroundColor: [
            "rgba(255, 206, 86, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(200, 200, 200, 0.6)",
          ],
        },
      ],
      labels: ["未完成者", "正確率低於50者", "其他"],
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
    const students = Object.keys(data);
    if (students.length === 0) {
      return null;
    }

    const numQuestions = data[students[0]] ? data[students[0]].length : 0;

    return (
      <StyledTable>
        <thead>
          <tr>
            <th>Student</th>
            {Array.from({ length: numQuestions }, (_, i) => (
              <th key={`question-${i}`}>Question {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
    {students.map((student) => (
      <tr key={student}>
        <td>{student}</td>
        {data[student] &&
          data[student].map((q, i) => (
            <td
              key={`answer-${i}`}
              style={{
                color:
                  Object.values(q)[0] === true
                    ? "black"
                    : Object.values(q)[0] === false
                    ? "red"
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

export default Chart;
