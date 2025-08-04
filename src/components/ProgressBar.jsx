import { useEffect, useState } from "react";
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
      className={`position-absolute top-0 w-100 overflow-hidden ${
        percent > 98 ? "d-none" : ""
      }`}
      style={{
        height: "4px",
        zIndex: 11,
      }}
    >
      <div
        className="bg-danger"
        style={{ width: `${percent}%`, height: "2px" }}
      />
    </div>
  );
}
