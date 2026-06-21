import { useEffect, useState } from "react";
import { Logo } from "../assets";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import cookies from "js-cookie";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import useWindowWidth from "../hooks/useWindowWidth";
import ProgressBar from "./ProgressBar";
import { useAppContext } from "../context/AppContext";
import "./styles/navbar.css";

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
  const [inputValue, setInputValue] = useState(query ?? "");
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const currLangCode = cookies.get("i18next") || "en";
  const navigate = useNavigate();
  useEffect(() => {
    setCount((prev) => prev + 1);
  }, [globalThis?.location?.pathname, query]);
  useEffect(() => {
    if (query) setInputValue(query);
  }, [query]);
  return (
    <>
      {count > 1 && globalThis?.location?.pathname !== "/" && <ProgressBar />}
      <div className={`navbar-fixed`}>
        <button
          className="ham_button"
          onClick={() => {
            setNavToggle((prev) => !prev);
            if (open) setOpen(false);
          }}
        >
          <i
            className={`bi bi-list navbar-ham_icon ${
              windowWidth >= 500 ? "navbar-ham-margin" : ""
            }`}
          ></i>
        </button>
        <Link
          to="/"
          onClick={() => {
            if (open) setOpen(false);
          }}
        >
          <img
            className={`logo ${
              windowWidth < 500 ? "logo-small" : "logo-large"
            } ${windowWidth >= 500 ? "logo-padding" : ""}`}
            src={Logo}
            alt="logo"
          />
        </Link>
        <div
          className={`d-flex search-wrap ${
            windowWidth < 500 ? "small" : "large"
          }`}
        >
          <input
            className={`border-0 search-input ${
              windowWidth < 500 ? "small" : "large"
            }`}
            placeholder={t("search", "Search")}
            value={inputValue}
            onMouseDown={() => setOpen(false)}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && inputValue?.length > 1)
                navigate(`/results?query=${inputValue}`);
            }}
          />
          <button
            className={`border-0 search-btn ${
              windowWidth < 500 ? "small" : "large"
            }`}
            onClick={() => {
              setOpen(false);
              navigate(`/results?query=${inputValue}`);
            }}
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
        <div className="nav-actions">
          <button className="translate-button" onClick={() => setOpen(!open)}>
            <i className="bi bi-translate translate-icon"></i>
          </button>
          {open && (
            <div
              className={`navbar-dropdown ${
                windowWidth < 950 ? "right-medium" : "right-large"
              }`}
            >
              <div className="d-flex align-items-center lang-div">
                <button
                  className="dropdown-back-button"
                  onClick={() => setOpen(false)}
                >
                  <i className="bi bi-arrow-left dropdown-back"></i>
                </button>
                {t("chsLang", "Choose Your Language")}
              </div>
              <hr />
              <ul className="lang-list">
                {Object?.keys(langCodes)?.map((objKey) => (
                  <li
                    className="cursor-pointer list-unstyled lang-item"
                    key={objKey}
                  >
                    <button
                      onClick={() => {
                        i18next?.changeLanguage(objKey);
                        setOpen(false);
                      }}
                      className="lang-row"
                    >
                      <div className="check-wrap">
                        <i
                          className={`bi bi-check2 check-icon ${
                            objKey === currLangCode ? "" : "selected"
                          }`}
                        ></i>
                      </div>
                      <div className="lang-text">{langCodes?.[objKey]}</div>
                    </button>
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
