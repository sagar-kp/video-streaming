import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  PlaylistDetails,
  Home,
  ChannelDetails,
  Navbar,
  SearchResults,
  VideoDetails,
} from "./components";
import { AppProvider } from "./context/AppContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
