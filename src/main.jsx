import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'

// Lazy load components for code splitting
const App = lazy(() => import('./App.jsx'))
const Success = lazy(() => import('./Success.jsx'))
const Test = lazy(() => import('./Test.jsx'))

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '1.2rem',
    color: '#56897C'
  }}>
    Loading...
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/success" element={<Success />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Suspense>
    </Router>
  </StrictMode>,
)
