import React, {useState} from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div className="flex">
      <div>
        Count: {count}
      </div>
      <button onClick={() => setCount(count + 1)} className="btn btn-primary m-2">
        Increment
      </button>
      <button onClick={() => setCount(count - 1)} className="btn btn-primary m-2">
        Decrement
      </button>
    </div>
  );
};

export default Counter;