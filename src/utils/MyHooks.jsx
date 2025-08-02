import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";

export function useWindowWidth() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowWidth, setWindowWidth] = useState(undefined);
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowWidth(window?.innerWidth);
    }
    // Add event listener
    window?.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window?.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowWidth;
}

export const SetTimePassed = ({ date }) => {
  const [retData, setRetData] = useState("");
  const { t } = useTranslation();
  const currLangCode = cookies.get("i18next") || "en";

  useEffect(() => {
    const setTimePassed = (date) => {
      const now = new Date();
      const ms = now - date;
      let val;
      if (ms / 1000 >= 1 && ms / 1000 < 60) {
        val = Math.floor(ms / 1000);
        return `${val} second${val === 1 ? "" : "s"}`;
      } else if (ms / 60000 >= 1 && ms / 60000 < 60) {
        val = Math.floor(ms / 60000);
        return `${val} minute${val === 1 ? "" : "s"}`;
      } else if (ms / 3600000 >= 1 && ms / 3600000 < 24) {
        val = Math.floor(ms / (3600 * 1000));
        return `${val} hour${val === 1 ? "" : "s"}`;
      } else if (ms / (3600000 * 24) >= 1 && ms / (3600 * 24 * 1000) < 30) {
        val = Math.floor(ms / (3600 * 24 * 1000));
        return `${val} day${val === 1 ? "" : "s"}`;
      } else if (
        ms / (3600 * 1000 * 24 * 30) >= 1 &&
        ms / (3600 * 24 * 1000 * 30) < 12
      ) {
        val = Math.floor(ms / (3600 * 24 * 30 * 1000));
        return `${val} month${val === 1 ? "" : "s"}`;
      } else if (ms / (3600 * 1000 * 24 * 30 * 12) >= 1) {
        val = Math.floor(ms / (3600 * 24 * 30 * 1000 * 12));
        return `${val} year${val === 1 ? "" : "s"}`;
      }
      // return "Hi"
    };
    const timePassed = setTimePassed(date);
    const [num, name] = timePassed?.split(" ");
    if (name?.charAt(name?.length - 1) === "s") {
      setRetData(
        num +
          " " +
          t(name?.slice(0, name?.length - 1)) +
          (currLangCode === "hi" || (currLangCode === "fr" && name === "months")
            ? ""
            : "s")
      );
    } else {
      setRetData(num + " " + t(name, name));
    }
  }, [currLangCode]);
  return <>{retData}</>;
};
