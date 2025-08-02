import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ProgressBar() {
  const [percent, setPercent] = useState(0);
  const [searchParams] = useSearchParams();
  const query = searchParams?.get("query");
  useEffect(() => {
    if (window?.location?.pathname !== "/") {
      setPercent(0);
      const id = setInterval(() => {
        setPercent((prev) => prev + 0.2);
        // console.log("hello")
      }, 6);
      setTimeout(() => {
        clearInterval(id);
        setPercent(100);
      }, 5000);
    }
  }, [window?.location?.pathname, query]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        display: percent > 98 && "none",
        width: "100%",
        height: "4px",
        overflow: "hidden",
      }}
    >
      <div
        style={{ backgroundColor: "red", width: `${percent}%`, height: "2px" }}
      />
    </div>
  );
}
