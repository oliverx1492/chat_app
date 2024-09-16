
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import Home from './components/Home'

function App() {


  // COLOR CODE:
  // #1230AE  (blau)
  // #6C48C5  (violett)
  // #C68FE6  (rosa)
  // #FFF7F7  (pink, weiß)


  return (
    <div className=''>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  )

}

export default App
