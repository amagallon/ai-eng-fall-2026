import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <nav aria-label="Main navigation">
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
