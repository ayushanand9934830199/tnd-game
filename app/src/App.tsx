import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GameSession from './pages/GameSession'
import Join from './pages/Join'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/session/:id" element={<GameSession />} />
          <Route path="/join" element={<Join />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
