const API_CONSTANTS = {
  getSearchResultsURL: (query) =>
    `search?part=snippet&q=${query}&order=date&maxResults=50`,
  getPlaylistByIdURL: (playlistId) => `playlists?part=snippet&id=${playlistId}`,
  getPlaylistItemsURL: (playlistId) =>
    `playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`,
  getVideoDetailsURL: (videoId) =>
    `videos?part=contentDetails,snippet,statistics&id=${videoId}`,
  getChannelDetailsURL: (channelId) =>
    `channels?part=snippet,statistics&id=${channelId}`,
  getChannelVideosURL: (channelId, maxResults = 50) =>
    `search?part=snippet,id&channelId=${channelId}&order=date&maxResults=${maxResults}`,
  getChannelPlaylistsURL: (channelId, channelTitle, maxResults = 100) => {
    const channelFilter = channelTitle ? "&channel=" + channelTitle : "";
    return (
      "search?part=id,snippet&type=playlist&channelId=" +
      channelId +
      channelFilter +
      "&maxResults=" +
      maxResults
    );
  },
  getCommentsURL: (videoId) =>
    `commentThreads?part=snippet&videoId=${videoId}&maxResults=100`,
};

export default API_CONSTANTS;
