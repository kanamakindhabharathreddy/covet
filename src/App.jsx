import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Converter from './pages/Converter';
import OCR from './pages/OCR';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col">
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
