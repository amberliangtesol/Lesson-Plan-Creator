import React from "react";
import Chart from "../../components/Chart";

function Score() {
  const data = {
    student1: [{ sorting: false }, { multiple_choice: false }, { matching: true }, { matching: "" }],
    student2: [{ sorting: "" }, { multiple_choice: "" }, { matching: "" }, { matching: "" }],
    student3: [{ sorting: true }, { multiple_choice: false }, { matching: true }, { matching: true }],
    student4: [{ sorting: false }, { multiple_choice: true }, { matching: true }, { matching: "" }],
  };  

  return (
    <div >
      <Chart data={data} />
    </div>

    );
}

export default Score;
