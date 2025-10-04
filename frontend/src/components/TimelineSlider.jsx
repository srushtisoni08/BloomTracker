import React, { useState } from "react";

const TimelineSlider = () => {
  const [month, setMonth] = useState(6);
  return (
    <div className="my-6 text-center">
      <input
        type="range"
        min="0"
        max="11"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="w-3/4"
      />
      <p>Viewing Month: {month}</p>
    </div>
  );
};

export default TimelineSlider;
