import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import PortfolioBuilder from './pages/PortfolioBuilder.jsx'
import PortfolioPreview from './pages/PortfolioPreview.jsx'
import Interview from './pages/Interview.jsx'
import Report from './pages/Report.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/portfolio/build" element={<PortfolioBuilder />} />
          <Route path="/portfolio/preview" element={<PortfolioPreview />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
