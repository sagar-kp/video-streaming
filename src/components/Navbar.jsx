import { useEffect, useState } from "react";
import { Logo } from "../assets";
import { useNavigate, useSearchParams } from "react-router-dom";
import cookies from "js-cookie";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useWindowWidth } from "../utils/MyHooks";
import ProgressBar from "./ProgressBar";
import { useAppContext } from "../context/AppContext";

const langCodes = {
  en: "English",
  fr: "Français",
  hi: "हिन्दी",
};

export default function Navbar() {
  const { setNavToggle } = useAppContext();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const windowWidth = useWindowWidth();
  const query = searchParams.get("query");
  const [ipVal, setIpVal] = useState(query ? query : "");
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const currLangCode = cookies.get("i18next") || "en";
  const navigate = useNavigate();
  useEffect(() => {
    setCount((prev) => prev + 1);
  }, [window?.location?.pathname, query]);
  useEffect(() => {
    if (query) setIpVal(query);
  }, [query]);
  return (
    <>
      {count > 1 && window?.location?.pathname !== "/" && <ProgressBar />}
      <div
        className="d-flex position-fixed top-0 w-100 bg-white"
        style={{
          padding: "0.7%",
          zIndex: "10",
        }}
      >
        <i
          className="bi bi-list navbar-ham_icon"
          style={{ fontSize: "25px", marginLeft: !windowWidth < 500 && "10px" }}
          onClick={() => {
            setNavToggle((prev) => !prev);
            if (open) setOpen(false);
          }}
        ></i>
        <img
          className="cursor-pointer"
          src={Logo}
          alt="logo"
          style={{
            width: windowWidth < 500 ? "80px" : "140px",
            marginTop: windowWidth < 500 ? "2px" : "-4px",
            height: windowWidth < 500 ? "30.5px" : "45px",
            paddingLeft: windowWidth >= 500 && "20px",
          }}
          onClick={() => {
            navigate("/");
            if (open) setOpen(false);
          }}
        />
        <div
          className="d-flex"
          style={{
            width: windowWidth < 500 ? "90%" : "50%",
            border: "1px black solid",
            borderRadius: "30px",
            marginLeft: windowWidth < 500 ? "5px" : "50px",
          }}
          onClick={() => {
            if (open) setOpen(false);
          }}
        >
          <input
            className="border-0"
            style={{
              width: windowWidth < 500 ? "85%" : "90%",
              borderStartStartRadius: "30px",
              borderEndStartRadius: "30px",
              paddingLeft: "20px",
              outline: "none",
            }}
            placeholder={t("search", "Search")}
            value={ipVal}
            onChange={(e) => setIpVal(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && ipVal?.length > 1)
                navigate(`/results?query=${ipVal}`);
            }}
          />
          <button
            className="border-0"
            style={{
              width: windowWidth < 500 ? "15%" : "10%",
              borderEndEndRadius: "30px",
              borderStartEndRadius: "30px",
            }}
            onClick={() => {
              navigate(`/results?query=${ipVal}`);
            }}
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
        <div style={{ width: "15%", marginLeft: "2%", marginTop: "0.35%" }}>
          <i
            className="bi bi-translate cursor-pointer"
            style={{ fontSize: "large" }}
            onClick={() => setOpen(!open)}
          ></i>
          {open && (
            <div
              className="navbar-dropdown"
              style={{ right: windowWidth < 950 ? "15%" : "25%" }}
            >
              <div
                className="d-flex align-items-center"
                style={{ margin: "2% 0%" }}
              >
                <i
                  className="bi bi-arrow-left cursor-pointer rounded-circle"
                  onClick={() => setOpen(false)}
                  style={{
                    padding: "0% 2%",
                    fontSize: "x-large",
                    margin: "0% 5%",
                  }}
                ></i>
                {t("chsLang", "Choose Your Language")}
              </div>
              <hr />
              <ul style={{ margin: "3% 0%" }}>
                {Object?.keys(langCodes)?.map((objKey) => (
                  <li
                    className="cursor-pointer list-unstyled"
                    key={objKey}
                    style={{
                      marginLeft: "-30px",
                    }}
                    onClick={() => {
                      i18next?.changeLanguage(objKey);
                      setOpen(false);
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="text-center" style={{ flex: "20%" }}>
                        {
                          <i
                            style={{
                              fontSize: "x-large",
                              color: objKey !== currLangCode && "transparent",
                            }}
                            className="bi bi-check2"
                          ></i>
                        }
                      </div>
                      <div style={{ flex: "80%", fontSize: "15px" }}>
                        {langCodes?.[objKey]}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
