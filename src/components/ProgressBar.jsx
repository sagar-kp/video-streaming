import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ProgressBar() {
  const [percent, setPercent] = useState(0);
  const [searchParams] = useSearchParams();
  const query = searchParams?.get("query");
  useEffect(() => {
    if (globalThis?.location?.pathname !== "/") {
      setPercent(0);
      const id = setInterval(() => {
        setPercent((prev) => prev + 0.2);
      }, 6);
      setTimeout(() => {
        clearInterval(id);
        setPercent(100);
      }, 5000);
    }
  }, [globalThis?.location?.pathname, query]);

  return (
    <div
      className={`position-absolute top-0 w-100 progress-line overflow-hidden ${
        percent > 98 ? "d-none" : ""
      }`}
    >
      <div className="bg-danger" style={{ width: `${percent}%` }} />
    </div>
  );
}
