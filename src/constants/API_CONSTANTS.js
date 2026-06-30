const API_CONSTANTS = {
  getByCategoryURL: (selectedCategory) =>
    `search?part=snippet&q=${selectedCategory}&order=date&maxResults=50`,
  getSearchResultsURL: (query) =>
    `search?part=snippet&q=${query}&order=date&maxResults=50`,
  getPlaylistByIdURL: (playlistId) => `playlists?part=snippet&id=${playlistId}`,
  getPlaylistItemsURL: (playlistId) =>
    `playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`,
};

export default API_CONSTANTS;
