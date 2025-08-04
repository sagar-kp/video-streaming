import { useNavigate } from "react-router-dom";
import { explore } from "../../assets";
import { useWindowWidth } from "../../utils/MyHooks";
import "../components.css";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/AppContext";

export default function Sidebar({ marginTopFromProps }) {
  const { navToggle, selectedCategory, setSelectedCategory } = useAppContext();
  const windowWidth = useWindowWidth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div
      className={`bg-white zindex-2 ${
        windowWidth < 600 || window?.location?.pathname === "/watch"
          ? "position-absolute"
          : ""
      } ${windowWidth < 600 && navToggle ? "d-none" : ""}`}
      style={{
        padding: "8px",
        marginTop: marginTopFromProps && marginTopFromProps,
      }}
    >
      <span
        className={`${
          (windowWidth >= 600 && navToggle) || (windowWidth < 600 && !navToggle)
            ? "d-block"
            : "d-none"
        }`}
        style={{
          fontSize: "19px",
          paddingLeft: "8px",
        }}
      >
        {t("explore", "Explore")}
      </span>
      {explore.map((obj, index) => (
        <div
          className={`sidebar-icon_btn_div ${
            !(
              (windowWidth >= 600 && navToggle) ||
              (windowWidth < 600 && !navToggle)
            )
              ? "flex-column"
              : ""
          } ${
            !(
              (windowWidth >= 600 && navToggle) ||
              (windowWidth < 600 && !navToggle)
            )
              ? "text-center"
              : ""
          }`}
          key={index}
          style={{
            backgroundColor:
              selectedCategory === obj?.searchTerm &&
              window?.location?.pathname ===
                "/" /*&&((windowWidth>=600&&navToggle)||(windowWidth<600&&!navToggle))*/ &&
              "rgb(177, 177, 177)",
            //display:((windowWidth>=600&&navToggle)||(windowWidth<600&&!navToggle))&&"flex",
            // justifyContent:!((windowWidth>=600&&navToggle)||(windowWidth<600&&!navToggle))&&"flex-end",
            // alignItems:!((windowWidth>=600&&navToggle)||(windowWidth<600&&!navToggle))&&"center"
          }}
          onClick={() => {
            setSelectedCategory(obj?.searchTerm);
            navigate("/");
          }}
        >
          <div
            style={{
              paddingRight:
                ((windowWidth >= 600 && navToggle) ||
                  (windowWidth < 600 && !navToggle)) &&
                "8px",
              paddingLeft:
                ((windowWidth >= 600 && navToggle) ||
                  (windowWidth < 600 && !navToggle)) &&
                "2px",
              // WebkitTextStroke: selectedCategory===obj.name&&0.7,
              // color:(selectedCategory===obj.name)&&"brown",
              // WebkitFilter: selectedCategory===obj.name&&"invert(100%)",
              // filter:selectedCategory===obj.name&&"invert(100%)"
              // backgroundColor:selectedCategory===obj.name&&"black"
            }}
          >
            {obj?.icon}
          </div>
          <div
            style={{
              /*display:((windowWidth>=600&&navToggle)||(windowWidth<600&&!navToggle))?"block":"none",*/
              fontSize:
                !(
                  (windowWidth >= 600 && navToggle) ||
                  (windowWidth < 600 && !navToggle)
                ) && "x-small",
            }}
          >
            {t(obj?.name?.toLowerCase()?.split(" ")?.join("_"), obj?.name)}
          </div>
        </div>
      ))}
    </div>
  );
}
