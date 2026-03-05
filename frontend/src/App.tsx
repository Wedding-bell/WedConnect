import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PlaceholderPage title="Sign In" />} />
        <Route path="/register" element={<PlaceholderPage title="Get Started" />} />
        <Route path="/help" element={<PlaceholderPage title="Need help?" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
