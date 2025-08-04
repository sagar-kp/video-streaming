import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  PlaylistDetails,
  Home,
  ChannelDetails,
  Navbar,
  SearchResults,
  VideoDetails,
} from "./components";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<SearchResults />} />
          <Route path="/watch" element={<VideoDetails />} />
          <Route path="/channels" element={<ChannelDetails />} />
          <Route path="/playlist" element={<PlaylistDetails />} />
          <Route
            path="*"
            element={
              <div className="d-flex justify-content-center align-items-center">
                This page isn't available. Sorry about that.
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
