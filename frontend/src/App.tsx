import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import LeaguePredictorPage from './pages/LeaguePredictorPage'
import MyPredictionPage from './pages/MyPredictionPage'
import OthersPredictionPage from './pages/OthersPredictionPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/predict" element={<LeaguePredictorPage />} />
          <Route path="/predict/my" element={<MyPredictionPage />} />
          <Route path="/predict/others" element={<OthersPredictionPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
