import { useState, useEffect } from "react";
// import { useWindowWidth } from "../utils/MyHooks";
import { FetchAPI } from "../utils/apiCalls";
import Sidebar from "./reusables/Sidebar";
// import Videos from "./reusables/Card";
import Card from "./reusables/Card";
import { useAppContext } from "../context/AppContext";
import LoadingSpinner from "./reusables/LoadingSpinner";

export default function Home() {
  const { selectedCategory } = useAppContext();
  const [objs, setObjs] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    document.title = "Vi-Stream";
    setLoading(true);
    FetchAPI(
      `search?part=snippet&q=${selectedCategory}&order=date&maxResults=50`
    )
      .then(({ data }) => {
        setLoading(false);
        if (data?.items) {
          let arr1 = [],
            arr2 = [];
          data?.items.forEach((obj) =>
            obj?.id?.hasOwnProperty("videoId")
              ? arr1?.push(obj)
              : arr2?.push(obj)
          );

          setObjs(data?.items);
        } else setObjs([]);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [selectedCategory]);
  return (
    <div className="d-flex" style={{ marginTop: "60px" }}>
      <Sidebar />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="container" style={{}}>
          <div className="row">
            {objs.map((obj) => (
              <Card
                obj={obj}
                channelOn={true}
                key={
                  obj?.id?.hasOwnProperty("videoId")
                    ? obj?.id?.videoId
                    : obj?.id?.hasOwnProperty("playlistId")
                    ? obj?.id?.playlistId
                    : obj?.id?.channelId
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
