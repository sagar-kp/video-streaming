import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PlaylistDetails, Home, ChannelDetails, Navbar, SearchResults, VideoDetails } from './components'


function App() {
  const [navToggle, setNavToggle] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("React JS")
  //console.log(navToggle)
  return (
    <BrowserRouter>
      <Navbar navToggle={navToggle} setNavToggle={setNavToggle} />
      <Routes>
        <Route path='/' element={  
          <Home navToggle={navToggle} 
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          />
        }/>
        <Route path="/results" element={
          <SearchResults navToggle={navToggle} 
            setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory}
          />        
        }/>
        <Route path="/watch" element={
          <VideoDetails navToggle={navToggle} setNavToggle={setNavToggle}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          />
        }/>
        <Route path="/channels" element={  
          <ChannelDetails navToggle={navToggle}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          />
        }/>
        <Route path="/playlist" element={
          <PlaylistDetails navToggle={navToggle}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          />
        }/>
        <Route path="*" element={
          <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
            This page isn't available. Sorry about that.
          </div>
        }/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
