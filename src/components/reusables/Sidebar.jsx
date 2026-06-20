import { useNavigate } from "react-router-dom";
import { explore } from "../../assets";
import useWindowWidth from "../../hooks/useWindowWidth";
import "../components.css";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/AppContext";
import "../styles/sidebar.css";

export default function Sidebar({ marginTopFromProps }) {
  const { navToggle, selectedCategory, setSelectedCategory } = useAppContext();
  const windowWidth = useWindowWidth();
  const pathname = globalThis.location.pathname;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const showItems =
    (windowWidth >= 600 && navToggle) || (windowWidth < 600 && !navToggle);

  return (
    <div
      className={`bg-white zindex-2 ${
        windowWidth < 600 || pathname === "/watch" ? "position-absolute" : ""
      } ${windowWidth < 600 && navToggle ? "d-none" : ""} sidebar`}
      style={marginTopFromProps ? { marginTop: marginTopFromProps } : {}}
    >
      <span className={`${showItems ? "d-block" : "d-none"} explore-title`}>
        {t("explore", "Explore")}
      </span>
      {explore.map((obj, index) => (
        <div
          className={`sidebar-icon_btn_div ${
            showItems ? "" : "flex-column text-center"
          } ${
            selectedCategory === obj?.searchTerm && pathname === "/"
              ? "selected-cat"
              : ""
          }`}
          key={index}
          onClick={() => {
            setSelectedCategory(obj?.searchTerm);
            navigate("/");
          }}
        >
          <div className={`${showItems ? "icon-padding" : ""}`}>
            {obj?.icon}
          </div>
          <div className={`${showItems ? "" : "label-small"}`}>
            {t(obj?.name?.toLowerCase()?.split(" ")?.join("_"), obj?.name)}
          </div>
        </div>
      ))}
    </div>
  );
}
