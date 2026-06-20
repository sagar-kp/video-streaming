import { useEffect, useState } from "react";
import { FetchAPI } from "../utils/apiCalls";
import Sidebar from "./reusables/Sidebar";
import { useNavigate, useSearchParams } from "react-router-dom";
import useWindowWidth from "../hooks/useWindowWidth";
import SetTimePassed from "./SetTimePassed";
import cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "./reusables/LoadingSpinner";
import "./styles/searchResults.css";
import { getNavigatePath } from "../utils/myFunctions";

export default function SearchResults() {
  const [objs, setObjs] = useState([]);
  const [searchParams] = useSearchParams();
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const [noResults, setNoResults] = useState(false);
  const query = searchParams.get("query");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (query) {
      document.title = `${query} - Vi-Stream`;
      setLoading(true);
      FetchAPI(`search?part=snippet&q=${query}&order=date&maxResults=50`)
        .then(({ data }) => {
          if (data?.items) {
            setNoResults(false);

            setObjs(data?.items);
          } else {
            setNoResults(true);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else setNoResults(true);
  }, [query]);
  return (
    <div className="d-flex search-results-container">
      <Sidebar />
      {loading ? (
        <LoadingSpinner />
      ) : noResults ? (
        <div className="d-flex justify-content-center sr-noresults">
          <h4>{t("noResultsFnd", "No results found")}</h4>
        </div>
      ) : (
        <div className="sr-results">
          {objs.map((obj, index) => (
            <div
              className={`d-flex ${windowWidth < 700 ? "sr-row" : ""}`}
              key={index}
            >
              <div className="search-img_div text-center sr-col-30">
                <img
                  className={`search-img ${
                    obj?.id?.channelId
                      ? "search-img--channel"
                      : "search-img--default"
                  }`}
                  src={obj?.snippet?.thumbnails?.high?.url}
                  alt="thumbnail"
                  onClick={() => navigate(getNavigatePath(obj))}
                />
              </div>
              <div className="sr-col-70">
                <div
                  className={`videos-title cursor-pointer ${windowWidth < 750 ? "sr-title-small" : "sr-title"}`}
                  onClick={() => navigate(getNavigatePath(obj))}
                >
                  {obj?.snippet?.title}
                </div>
                {!obj?.id?.hasOwnProperty("channelId") && (
                  <div className="sr-meta">
                    {currLangCode === "fr" ? t("ago", "il y a ") : ""}{" "}
                    <SetTimePassed
                      date={new Date(Date.parse(obj?.snippet?.publishedAt))}
                    />{" "}
                    {` ${currLangCode !== "fr" ? t("ago", "ago") : ""} `}
                  </div>
                )}
                {!obj?.id?.hasOwnProperty("channelId") && (
                  <div
                    className="fw-bold cursor-pointer sr-small-row"
                    onClick={() =>
                      navigate(`/channels?id=${obj?.snippet?.channelId}`)
                    }
                  >
                    {obj?.snippet?.channelTitle}
                  </div>
                )}
                {obj?.id?.playlistId && (
                  <div
                    className="fw-bold cursor-pointer sr-playlist-link"
                    onClick={() =>
                      navigate(`/playlist?list=${obj?.id?.playlistId}`)
                    }
                  >
                    {t("viewFullPL", "VIEW FULL PLAYLIST")}
                  </div>
                )}
                {obj?.id?.hasOwnProperty("channelId") && (
                  <div className="videos-title fw-normal sr-description">
                    {obj?.snippet?.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
