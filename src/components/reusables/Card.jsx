import SetTimePassed from "../SetTimePassed";
import { Link } from "react-router-dom";
import cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { getKey, getNavigatePath, loadImage } from "../../utils/myFunctions";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../../assets";
import "../styles/card.css";
import PropTypes from "prop-types";

export default function Card({ obj, channelOn }) {
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const isPathnameChannels = globalThis.location?.pathname === "/channels";
  const link = getNavigatePath(obj);
  const imageUrl = obj?.snippet?.thumbnails?.medium?.url;

  const { data: imgSrc } = useQuery({
    queryKey: ["image", imageUrl],
    queryFn: () => loadImage(imageUrl),
    enabled: Boolean(imageUrl),
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
  });
  return (
    <div
      key={getKey(obj)}
      className={`col-md-4 col-xl-${channelOn ? "4" : "3"} col-xxl-2 col-lg-${
        channelOn ? "4" : "3"
      } col-sm-6 col-xs-6 col-xxs-12 p-2`}
    >
      <Link
        to={link}
        className={`${obj?.id?.channelId ? "text-center d-block" : ""}`}
      >
        <img
          className={`cursor-pointer ${imgSrc ? "" : "fade-animation"} card-image ${
            obj?.id?.channelId ? "card-img-channel" : ""
          }`}
          src={imgSrc ?? Loading}
          alt="thumbnails"
        />
      </Link>
      <Link
        className={`videos-title fw-bold cursor-pointer ${obj?.id?.channelId ? "text-center" : ""} card-title ${
          isPathnameChannels ? "card-title-channels" : "card-title-default"
        }`}
        to={link}
      >
        {obj?.snippet?.title}
      </Link>
      {channelOn && (
        <Link
          className={`cursor-pointer channel-link d-block ${obj?.id?.channelId ? "videos-title" : "over"} ${
            isPathnameChannels
              ? "channel-desc-channels"
              : "channel-desc-default"
          }`}
          to={`/channels?id=${obj?.snippet?.channelId}`}
        >
          {obj?.id?.channelId
            ? obj?.snippet?.description
            : obj?.snippet?.channelTitle}
        </Link>
      )}
      {obj?.id?.playlistId && (
        <Link
          className="playlist-link"
          to={`/playlist?list=${obj?.id?.playlistId}`}
        >
          {isPathnameChannels
            ? t("viewFullPL", "View full playlist")
            : t("viewFullPL", "VIEW FULL PLAYLIST")?.toUpperCase()}
        </Link>
      )}
      {obj?.id?.videoId && obj?.snippet?.publishedAt && (
        <div
          className={`card-time ${
            isPathnameChannels ? "card-time-channels" : "card-time-default"
          }`}
        >
          {currLangCode === "fr" ? t("ago", "il y a ") : ""}{" "}
          <SetTimePassed
            date={new Date(Date.parse(obj?.snippet?.publishedAt))}
          />{" "}
          {` ${currLangCode === "fr" ? "" : t("ago", "ago")} `}
        </div>
      )}
      <div></div>
    </div>
  );
}

Card.propTypes = {
  obj: PropTypes.shape({
    id: PropTypes.shape({
      videoId: PropTypes.string,
      playlistId: PropTypes.string,
      channelId: PropTypes.string,
    }),
    snippet: PropTypes.shape({
      thumbnails: PropTypes.shape({
        medium: PropTypes.shape({
          url: PropTypes.string,
        }),
      }),
      title: PropTypes.string,
      description: PropTypes.string,
      channelTitle: PropTypes.string,
      publishedAt: PropTypes.string,
      channelId: PropTypes.string,
    }),
  }),
  channelOn: PropTypes.bool,
};
