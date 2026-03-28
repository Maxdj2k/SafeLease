import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PropertyDetailPage from './pages/PropertyDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell hub-app-root">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
