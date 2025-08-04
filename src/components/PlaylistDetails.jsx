import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FetchAPI } from "../utils/apiCalls";
import { useWindowWidth } from "../utils/MyHooks";
import Sidebar from "./reusables/Sidebar";
import { VideoCard } from "./VideoDetails";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import { loadImage } from "../utils/myFunctions";
import LoadingSpinner from "./reusables/LoadingSpinner";
import { Loading } from "../assets";

export default function PlaylistDetails() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const currLangCode = cookies.get("i18next") || "en";
  const list = searchParams.get("list");
  const windowWidth = useWindowWidth();
  const [playlist, setPlaylist] = useState({});
  const [playlistVids, setPlaylistVids] = useState([]);
  const [updated, setUpdated] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Vi-Stream";
    setLoading(true);
    FetchAPI(`playlists?part=snippet&id=${list}`)
      .then(({ data }) => {
        if (data?.items) {
          document.title = `${data?.items?.[0]?.snippet?.title} - Vi-Stream`;
          setPlaylist(data?.items?.[0]);
          loadImage(data?.items?.[0]?.snippet?.thumbnails?.medium?.url)
            .then((resp) => setImgSrc(resp))
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    FetchAPI(`playlistItems?part=snippet&playlistId=${list}&maxResults=50`)
      .then(({ data }) => {
        setPlaylistVids(data?.items ? data?.items : []);
        if (data?.items && data?.items?.length > 0) {
          let date = "";
          let diff = [];
          data?.items?.forEach((obj) => {
            diff?.push(Date.now() - Date.parse(obj?.snippet?.publishedAt));
          });
          date = new Date(
            Date.parse(
              data?.items?.[diff?.indexOf(Math.min(...diff))]?.snippet
                ?.publishedAt
            )
          )?.toDateString();
          date = date?.slice(4, 10) + "," + date?.slice(11);
          //console.log(date, diff)
          setUpdated(date);
        } else setUpdated(null);
      })
      .catch(() => {});
  }, [list]);
  return (
    <div className="d-flex" style={{ marginTop: "60px" }}>
      <Sidebar />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={windowWidth > 1080 ? "d-flex" : ""}>
          <div
            className={`text-white`}
            style={{
              flex: windowWidth > 1080 && "30%",
              height: windowWidth > 1080 && "75vh",
              padding: "2%",
              borderRadius: "17px",
              marginTop: "2%",
              backgroundColor: "rgb(48, 17, 114)",
            }}
          >
            <img style={{ borderRadius: "11px" }} src={imgSrc ?? Loading} />
            <div
              style={{
                fontSize: "x-large",
                fontWeight: "800",
                marginTop: "3.5%",
              }}
            >
              {playlist?.snippet?.title}
            </div>
            <div
              className="fw-bold"
              style={{
                fontSize: "small",
                marginTop: "3.5%",
              }}
            >
              {playlist?.snippet?.channelTitle}
            </div>
            {playlistVids?.length > 0 && (
              <div className="d-flex" style={{ fontSize: "11.5px" }}>
                {playlistVids?.length} {t("videos", "videos")} &nbsp;{" "}
                {updated && (
                  <span>{`${currLangCode === "hi" ? updated : ""} ${t(
                    "lastUpdated",
                    "Last updated on"
                  )} ${currLangCode !== "hi" ? updated : ""}`}</span>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              flex: windowWidth > 1080 && "70%",
              marginTop: "2.5%",
              marginLeft: "1%",
            }}
          >
            {playlistVids?.map((obj, idx) => (
              <VideoCard key={obj?.id} det={{ obj, idx }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
