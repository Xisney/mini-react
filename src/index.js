// import React, { Component, useReducer, useState } from "react";
import { useReducer, useState } from "./kreact/react";
import ReactDOM from "./kreact/react-dom";
// import ReactDOM from "react-dom";

function Test(props) {
  const [count, setCount] = useReducer((x) => x + 1, 0);
  const [state, setState] = useState(0);
  return (
    <p>
      <button
        onClick={() => {
          setState(state + 1);
        }}
      >
        useState:{state}
      </button>
      <button onClick={setCount}>useReducer:{count}</button>
    </p>
  );
}

const jsx = (
  <div>
    <h2>内容</h2>
    <h3>
      ssss<p>swdf</p>
    </h3>
    <a href="https://github.com">github</a>
    <Test name="function" />
  </div>
);

ReactDOM.render(jsx, document.querySelector("#root"));
