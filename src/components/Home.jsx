import { useState, useEffect } from "react";
// import { useWindowWidth } from "../utils/MyHooks";
import { FetchAPI } from "../utils/apiCalls";
import Sidebar from "./reusables/Sidebar";
// import Videos from "./reusables/Card";
import Card from "./reusables/Card";
import { useAppContext } from "../context/AppContext";
import { homePagePlaceholder } from "../utils/placeholderData";

export default function Home() {
  const { selectedCategory } = useAppContext();
  const [objs, setObjs] = useState(homePagePlaceholder.items);
  useEffect(() => {
    document.title = "Vi-Stream";
    setObjs(homePagePlaceholder.items);
    FetchAPI(
      `search?part=snippet&q=${selectedCategory}&order=date&maxResults=50`
    )
      .then(({ data }) => {
        if (data?.items) {
          setObjs(data?.items);
        } else setObjs([]);
      })
      .catch(() => {});
  }, [selectedCategory]);
  return (
    <div className="d-flex" style={{ marginTop: "60px" }}>
      <Sidebar />
      <div className="container">
        <div className="row">
          {objs.map((obj, index) => (
            <Card
              obj={obj}
              channelOn={true}
              key={
                obj?.id?.length
                  ? obj?.id?.hasOwnProperty("videoId")
                    ? obj?.id?.videoId
                    : obj?.id?.hasOwnProperty("playlistId")
                    ? obj?.id?.playlistId
                    : obj?.id?.channelId
                  : index
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
