import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CrmPage from './pages/CrmPage';
import SmashPage from './pages/SmashPage';

function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090C13 0%, #161C2E 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@900&family=Inter:wght@400;500;600;700&display=swap');
        .home-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 100%; max-width: 360px; text-decoration: none; transition: all 0.25s; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .home-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.22); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
        .home-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg,#2D6BE4,#06C8E8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '12px' }}>
          DEMOS INTERACTIVOS
        </div>
        <div style={{ color: '#8EA4C8', fontSize: '16px' }}>Selecciona un demo para explorar</div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/crm" className="home-card">
          <div style={{ fontSize: '56px' }}>🏢</div>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '22px', fontWeight: '900', color: '#EEF2FF', textAlign: 'center' }}>OmniCore AI</div>
          <div style={{ fontSize: '13px', color: '#8EA4C8', textAlign: 'center', lineHeight: '1.5' }}>CRM Omnicanal Comercial · Pipeline · WhatsApp · Chatbot IA · Agentes · VoIP · Analítica</div>
          <div className="home-badge" style={{ background: 'rgba(45,107,228,0.15)', color: '#60A5FA', border: '1px solid rgba(45,107,228,0.3)' }}>Demo Interactiva</div>
        </Link>

        <Link to="/smash" className="home-card">
          <div style={{ fontSize: '56px' }}>🍔</div>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '22px', fontWeight: '900', color: '#EEF2FF', textAlign: 'center' }}>Smash Burger RD</div>
          <div style={{ fontSize: '13px', color: '#8EA4C8', textAlign: 'center', lineHeight: '1.5' }}>WhatsApp API · Bot IA · Seguimiento de pedidos estilo Rappi · Analytics · Agentes</div>
          <div className="home-badge" style={{ background: 'rgba(52,199,89,0.15)', color: '#34C759', border: '1px solid rgba(52,199,89,0.3)' }}>Demo en Vivo</div>
        </Link>
      </div>

      <div style={{ marginTop: '48px', color: '#4A6080', fontSize: '12px' }}>
        Powered by <strong style={{ color: '#8EA4C8' }}>Claude AI · OmniCore</strong>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/smash" element={<SmashPage />} />
      </Routes>
    </BrowserRouter>
  );
}
