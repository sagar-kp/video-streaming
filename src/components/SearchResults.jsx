import { useEffect } from "react";
import Sidebar from "./reusables/Sidebar";
import { Link, useSearchParams } from "react-router-dom";
import useWindowWidth from "../hooks/useWindowWidth";
import SetTimePassed from "./SetTimePassed";
import cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "./reusables/LoadingSpinner";
import "./styles/searchResults.css";
import { getKey, getNavigatePath, loadImage } from "../utils/myFunctions";
import { useQuery } from "@tanstack/react-query";
import { getSearchResults } from "../services";
import { Loading } from "../assets";
import PropTypes from "prop-types";

const Img = ({ obj }) => {
  const imageUrl = obj?.snippet?.thumbnails?.high?.url;
  const { data: imgSrc } = useQuery({
    queryKey: ["image", imageUrl],
    queryFn: () => loadImage(imageUrl),
    enabled: Boolean(imageUrl),
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
  });
  return (
    <img
      className={`search-img ${
        obj?.id?.channelId ? "search-img--channel" : "search-img--default"
      }`}
      src={imgSrc ?? Loading}
      alt="thumbnail"
    />
  );
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const windowWidth = useWindowWidth();
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const query = searchParams.get("query");

  const { data, isLoading: loading } = useQuery({
    queryKey: ["search-results", query],
    queryFn: () => getSearchResults(query),
    enabled: Boolean(query),
  });

  const objs = data?.data?.items ?? [];
  const noResults = Boolean(query) && !loading && objs.length === 0;

  useEffect(() => {
    if (query) {
      document.title = `${query} - Vi-Stream`;
    }
  }, [query]);

  if (loading || noResults)
    return (
      <div className="d-flex search-results-container">
        <Sidebar />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="d-flex justify-content-center sr-noresults">
            <h4>{t("noResultsFnd", "No results found")}</h4>
          </div>
        )}
      </div>
    );
  return (
    <div className="d-flex search-results-container">
      <Sidebar />
      <div className="sr-results">
        {objs?.map((obj) => (
          <div
            className={`d-flex ${windowWidth < 700 ? "sr-row" : ""}`}
            key={getKey(obj)}
          >
            <div className="search-img_div text-center sr-col-30">
              <Link to={getNavigatePath(obj)}>
                <Img obj={obj} />
              </Link>
            </div>
            <div className="sr-col-70">
              <Link
                className={`videos-title cursor-pointer d-block ${windowWidth < 750 ? "sr-title-small" : "sr-title"}`}
                to={getNavigatePath(obj)}
              >
                {obj?.snippet?.title}
              </Link>
              {!obj?.id?.hasOwnProperty("channelId") && (
                <div className="sr-meta">
                  {currLangCode === "fr" ? t("ago", "il y a ") : ""}{" "}
                  <SetTimePassed
                    date={new Date(Date.parse(obj?.snippet?.publishedAt))}
                  />{" "}
                  {` ${currLangCode === "fr" ? "" : t("ago", "ago")} `}
                </div>
              )}
              {!obj?.id?.hasOwnProperty("channelId") && (
                <Link
                  className="fw-bold cursor-pointer sr-small-row"
                  to={`/channels?id=${obj?.snippet?.channelId}`}
                >
                  {obj?.snippet?.channelTitle}
                </Link>
              )}
              {obj?.id?.playlistId && (
                <Link
                  className="fw-bold cursor-pointer sr-playlist-link"
                  to={`/playlist?list=${obj?.id?.playlistId}`}
                >
                  {t("viewFullPL", "VIEW FULL PLAYLIST")}
                </Link>
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
    </div>
  );
}

Img.propTypes = {
  obj: PropTypes.shape({
    id: PropTypes.shape({
      channelId: PropTypes.string,
    }),
    snippet: PropTypes.shape({
      thumbnails: PropTypes.shape({
        high: PropTypes.shape({
          url: PropTypes.string,
        }),
      }),
    }),
  }).isRequired,
};
