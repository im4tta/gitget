import { Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ComparePage from './pages/ComparePage'

function App() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-6">
          <NavLink to="/" className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100">
            gitget
          </NavLink>
          <div className="flex items-center gap-4">
            <NavLink to="/" className={linkClass} end>
              Browse
            </NavLink>
            <NavLink to="/compare" className={linkClass}>
              Compare
            </NavLink>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </div>
  )
}

export default App
