import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Instruments from "./pages/instruments/Instruments";
import Boxes from "./pages/boxes/Boxes";
import NotFound from "./pages/notFound/NotFound";
import './App.css'
import CreateBox from "./pages/boxes/CreateBox";

function App() {
  return (
    <main>
      <div className="container">
        <nav>
          <ul>
            <li>
              <NavLink
                to="/Instruments"
                style={({ isActive }) => ({
                  color: isActive ? "#007bff" : "#000",
                  fontWeight: isActive ? "bold" : "normal",
                  textDecoration: "none",
                })}
              >
                Инструменты
              </NavLink>
            </li>
            {" | "}
            <li>
              <NavLink
                to="/Boxes"
                style={({ isActive }) => ({
                  color: isActive ? "#007bff" : "#000",
                  fontWeight: isActive ? "bold" : "normal",
                  textDecoration: "none",
                })}
              >
                Биксы
              </NavLink>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/Instruments" replace />} />
          <Route path="/Instruments" element={<Instruments />} />
          <Route path="/Boxes" element={<Boxes />} />
          <Route path="/Boxes/CreateBox" element={<CreateBox />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
