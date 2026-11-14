import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { SimulatePage } from "./features/simulate/SimulatePage";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link className="brand" to="/simular">Gaiapus</Link>
        <nav aria-label="Seções">
          <NavLink to="/simular" className={({ isActive }) => `tab${isActive ? " is-active" : ""}`}>Simular</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/simular" replace />} />
          <Route path="/simular" element={<SimulatePage />} />
          <Route path="*" element={<Navigate to="/simular" replace />} />
        </Routes>
      </main>
    </div>
  );
}
