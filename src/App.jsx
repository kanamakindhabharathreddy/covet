import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Converter from './pages/Converter';
import OCR from './pages/OCR';

function App() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="top-glow"></div>
      <Header />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/convert" element={<Converter />} />
          <Route path="/ocr" element={<OCR />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
