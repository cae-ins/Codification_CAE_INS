import React from 'react'
import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './screen/Home'
import ResponsiveAppBar from './components/Topbar'
import ComponentFooter from './components/Footer'
function App() {
  return (    
    
  <BrowserRouter>
    <div className='main mainContainer'>
      <ResponsiveAppBar/>
      <Routes>
        <Route path="/" element={<Home model="emplois" />} />
        <Route path="/emplois" element={<Home model="emplois" />} />
        <Route path="/accueil" element={<Home model="emplois" />} />
        <Route path="/products" element={<Home model="produits" />} />
        <Route path="/activites" element={<Home model="activités" />} />
      </Routes>
      <ComponentFooter/>
    </div>
  </BrowserRouter>
    
  )
}
export default App