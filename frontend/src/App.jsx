import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GeneratorPage from './pages/GeneratorPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GeneratorPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
