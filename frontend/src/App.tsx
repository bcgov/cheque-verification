import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Faq from "./pages/FAQ";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bcgov-background-light-gray)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<Faq />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
