import { useState, useEffect } from "react";
import { FetchAPI } from "../utils/apiCalls";
import Sidebar from "./reusables/Sidebar";
import Card from "./reusables/Card";
import { useAppContext } from "../context/AppContext";
import { homePagePlaceholder } from "../utils/placeholderData";
import { getKey } from "../utils/myFunctions";

export default function Home() {
  const { selectedCategory } = useAppContext();
  const [objects, setObjects] = useState(homePagePlaceholder.items);
  useEffect(() => {
    document.title = "Vi-Stream";
    setObjects(homePagePlaceholder.items);
    FetchAPI(
      `search?part=snippet&q=${selectedCategory}&order=date&maxResults=50`,
    )
      .then(({ data }) => {
        if (data?.items) {
          setObjects(data?.items);
        } else setObjects([]);
      })
      .catch(() => {});
  }, [selectedCategory]);
  return (
    <div className="d-flex home-margin">
      <Sidebar />
      <div className="container">
        <div className="row">
          {objects.map((obj, index) => (
            <Card obj={obj} channelOn={true} key={getKey(obj, index)} />
          ))}
        </div>
      </div>
    </div>
  );
}
