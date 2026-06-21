import { Link, Route, Routes } from "react-router-dom";
import CapabilityMapPage from "./pages/CapabilityMapPage";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import EventsPage from "./pages/EventsPage";
import HomePage from "./pages/HomePage";
import MeetingPage from "./pages/MeetingPage";
import PhonePage from "./pages/PhonePage";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Iceberg Digital · Zoom Partner</p>
          <h1>Zoom Capability Lab</h1>
        </div>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/meeting">Meeting</Link>
          <Link to="/events">Events</Link>
          <Link to="/phone">Phone</Link>
          <Link to="/capability-map">Capability Map</Link>
          <Link to="/diagnostics">Diagnostics</Link>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/meeting" element={<MeetingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/phone" element={<PhonePage />} />
          <Route path="/capability-map" element={<CapabilityMapPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
        </Routes>
      </main>
    </div>
  );
}
