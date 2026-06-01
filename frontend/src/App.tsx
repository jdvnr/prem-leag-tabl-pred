import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import PredictionPage from './pages/PredictionPage';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/predict" element={<PredictionPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
