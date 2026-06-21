import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const setTimePassed = (date) => {
  if (!date || !(date instanceof Date)) return null;

  const ms = Date.now() - date.getTime();
  const units = [
    { name: "year", ms: 1000 * 60 * 60 * 24 * 30 * 12 },
    { name: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { name: "day", ms: 1000 * 60 * 60 * 24 },
    { name: "hour", ms: 1000 * 60 * 60 },
    { name: "minute", ms: 1000 * 60 },
    { name: "second", ms: 1000 },
  ];

  for (const unit of units) {
    if (ms >= unit.ms) {
      const val = Math.floor(ms / unit.ms);
      return { num: val, unit: unit.name, plural: val !== 1 };
    }
  }
  return { num: 0, unit: "second", plural: false };
};

const SetTimePassed = ({ date }) => {
  const [returnData, setReturnData] = useState("");
  const { t } = useTranslation();
  const currLangCode = cookies.get("i18next") || "en";

  useEffect(() => {
    const res = setTimePassed(date);
    if (!res) {
      setReturnData("");
      return;
    }

    const { num, unit, plural } = res;

    // languages that don't need an appended 's' for the plural form in your app
    const skipPluralAppend =
      currLangCode === "hi" || (currLangCode === "fr" && unit === "month");

    // translate singular form; append 's' when needed (and not in skip list)
    const translated =
      plural && !skipPluralAppend
        ? `${t(unit, unit)}s` // keep existing translation keys pattern
        : t(unit, unit);

    // french uses "il y a" before the value — caller composes that, so return only the value+unit
    setReturnData(`${num} ${translated}`);
  }, [date, currLangCode, t]);

  return <>{returnData}</>;
};

export default SetTimePassed;

SetTimePassed.propTypes = {
  date: PropTypes.instanceOf(Date),
};
