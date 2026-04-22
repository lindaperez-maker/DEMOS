import { useState, useEffect, useRef, useCallback } from 'react';
import '../smash.css';

const INITIAL_MSGS = [];

const BOT_REPLIES = {
  greet: "¡Qué bueno tenerte por acá! 🍔\n\n¿Desde qué zona nos escribes hoy?\n1️⃣ Mirador Norte\n2️⃣ Arroyo Hondo\n3️⃣ Naco / Piantini\n4️⃣ Rep. Colombia",
  zone: "📍 *Sede Naco / Piantini* seleccionada.\nCosto de delivery estimado: *RD$150*\n\n¿Qué vas a pedir hoy del menú? 👇",
  order: "🧾 *Resumen de tu pedido:*\n\n🍔 2 × Baconception = *RD$1,300*\n🍟 1 × Papas Trufadas = *RD$220*\n🛵 Delivery (Naco) = *RD$150*\n──────────────\n💰 *TOTAL: RD$1,670*\n\n¿Procedemos a pagar? Escribe *Pagar* o *Sí*",
  pay: "💳 *Link de pago seguro generado:*\n🔗 https://pay.smashburger.rd/SB-0089\n\nNotifícame cuando realices el pago.",
  default: "¿Podrías ser más específico? (Intenta saludar, pedir zonas o encargar unas burgers)."
};

function getBotReply(text) {
  const t = text.toLowerCase();
  if (t.includes('hola') || t.includes('pedir') || t.includes('buenas')) return BOT_REPLIES.greet;
  if (t.includes('3') || t.includes('naco') || t.includes('piantini')) return BOT_REPLIES.zone;
  if (t.includes('pedido') || t.includes('bacon') || t.includes('papas')) return BOT_REPLIES.order;
  if (t.includes('pagar') || t.includes('si') || t.includes('sí')) return BOT_REPLIES.pay;
  return BOT_REPLIES.default;
}

function formatMsg(text) {
  return text.replace(/\*([^*]+)\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
}

export default function SmashPage() {
  const [isDayMode, setIsDayMode] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const [toast, setToast] = useState({ show: false, text: '', icon: '✅' });
  const toastTimer = useRef(null);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [demoBtnTxt, setDemoBtnTxt] = useState('▶ Iniciar Demo Irresistible');
  const [sidebarLastMsg, setSidebarLastMsg] = useState('Esperando interacción...');
  const chatRef = useRef(null);

  const [kpiPedidos, setKpiPedidos] = useState(142);

  // Tracking panel
  const [showTracking, setShowTracking] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [activeSteps, setActiveSteps] = useState([false, false, false, false]);
  const [trackingTitle, setTrackingTitle] = useState('Preparando tu pedido');
  const [trackingDesc, setTrackingDesc] = useState('Nuestros chefs están cocinando tus Smash Burgers con amor. ¡Casi listas!');

  // Analytics
  const [analyticsAnimated, setAnalyticsAnimated] = useState(false);
  const [counters, setCounters] = useState({ msg: 0, ped: 0, ia: '0%' });
  const [bars, setBars] = useState({ msg: 0, ped: 0, ia: 0 });
  const [chartBars, setChartBars] = useState({ top: [0, 0, 0], zona: [0, 0, 0, 0] });

  const showToast = useCallback((text, icon = '✅') => {
    setToast({ show: true, text, icon });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  const getCurrentTime = () => new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

  const appendMessage = useCallback((text, type, cb) => {
    const time = getCurrentTime();
    setMessages(prev => [...prev, { text, type, time }]);
    setSidebarLastMsg((type === 'msg-in' ? 'IA: ' : 'Tú: ') + text.substring(0, 25) + '...');
    if (cb) setTimeout(cb, 50);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      appendMessage("¡Hola! 👋 Soy *SmashBot* de Smash Burger RD 🍔.\n\n¿En qué te puedo ayudar el día de hoy?", 'msg-in');
    }, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  const sendMessage = useCallback((text) => {
    const msg = (text || chatInput).trim();
    if (!msg || inputDisabled) return;
    setChatInput('');
    appendMessage(msg, 'msg-out');
    setTyping(true);

    const t = text.toLowerCase();
    const isPay = t.includes('listo') || t.includes('pague') || t.includes('pagado');

    setTimeout(() => {
      setTyping(false);
      if (isPay) {
        triggerPaymentSuccess();
      } else {
        appendMessage(getBotReply(text), 'msg-in');
      }
    }, 1000 + Math.random() * 600);
  }, [chatInput, inputDisabled, appendMessage]);

  const triggerPaymentSuccess = useCallback(() => {
    appendMessage("✅ *¡Pago Confirmado por el Banco!*\n\nTu pedido #SB-1423 ya está en nuestras pantallas de cocina 🍳. ¡Disfruta tus Smash!", 'msg-in');
    setKpiPedidos(p => p + 1);

    showToast('Demo interactiva completada', '✨');

    setTimeout(() => {
      showToast('Pago procesado exitosamente', '💳');
      setShowTracking(true);
      setActiveSteps([true, false, false, false]);
      setTrackingProgress(15);
    }, 3500);

    setTimeout(() => {
      showToast('Su domiciliario va en camino', '🛵');
      setActiveSteps([true, true, false, false]);
      setTrackingProgress(50);
      setTrackingTitle('En Preparación');
      setTrackingDesc('Estamos dándole la vuelta a tus patties en la plancha.');

      setTimeout(() => {
        setActiveSteps([true, true, true, false]);
        setTrackingProgress(85);
        setTrackingTitle('Motorizado en Camino');
        setTrackingDesc('Juan Pérez (Honda CG) se dirige a tu ubicación.');
      }, 4000);
    }, 7500);
  }, [appendMessage, showToast]);

  const startDemo = () => {
    if (demoInProgress) return;
    setDemoInProgress(true);
    setDemoBtnTxt('⏳ Ejecutando Demo...');
    setInputDisabled(true);

    const seq = [
      { text: 'Hola, quiero pedir la cena', sender: 'user', delay: 800 },
      { text: '¡Hola! 👋 Bienvenido a *Smash Burger RD*. ¿Desde qué sector nos escribes para asignar tu cocina y calcular delivery?', sender: 'bot', delay: 2800 },
      { text: 'Sector Naco', sender: 'user', delay: 5000 },
      { text: '📍 Sede Naco / Piantini. Delivery: *RD$150*.\n\n¿Qué vas a pedir hoy del menú? 🍔', sender: 'bot', delay: 7500 },
      { text: 'Quiero 2 Double Smash y 1 Papas Trufadas', sender: 'user', delay: 10500 },
      { text: '🧾 *Resumen de pedido:*\n\n🍔 2 × Double Smash = *RD$1,200*\n🍟 1 × Papas Trufadas = *RD$220*\n🛵 Delivery (Naco) = *RD$150*\n──────────────\n💰 *TOTAL: RD$1,570*\n\n¿Confirmamos? *SÍ*', sender: 'bot', delay: 13500 },
      { text: 'SÍ ✅', sender: 'user', delay: 16000 },
      { text: '💳 *Link de pago seguro:*\n🔗 https://pay.smashburger.rd/SB-1423\n\n(Simulando pago...)', sender: 'bot', delay: 18500 },
    ];

    setMessages([{ text: '🔒 Chat Cifrado · IA Atendiendo', type: 'system', time: '' }]);

    seq.forEach((step, i) => {
      if (step.sender === 'bot') {
        setTimeout(() => setTyping(true), step.delay - 1000);
      }
      setTimeout(() => {
        setTyping(false);
        appendMessage(step.text, step.sender === 'user' ? 'msg-out' : 'msg-in');
        if (i === seq.length - 1) {
          setTimeout(triggerPaymentSuccess, 2500);
        }
      }, step.delay);
    });
  };

  const resetDemo = () => {
    setShowTracking(false);
    setDemoInProgress(false);
    setDemoBtnTxt('▶ Iniciar Demo Irresistible');
    setInputDisabled(false);
    setActiveSteps([false, false, false, false]);
    setTrackingProgress(0);
    setTrackingTitle('Pedido Confirmado');
    setTrackingDesc('Hemos recibido tu orden y la estamos enviando a cocina.');
  };

  const animateAnalytics = () => {
    if (analyticsAnimated) return;
    setAnalyticsAnimated(true);

    const animate = (from, to, setter, suf = '', dur = 2000) => {
      const s = Date.now();
      const run = () => {
        const p = Math.min((Date.now() - s) / dur, 1);
        const cur = Math.ceil(p * to);
        setter(cur + suf);
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    };

    animate(0, 1845, v => setCounters(p => ({ ...p, msg: v })));
    animate(0, 142, v => setCounters(p => ({ ...p, ped: v })));
    animate(0, 94, v => setCounters(p => ({ ...p, ia: v + '%' })));

    setTimeout(() => {
      setBars({ msg: 88, ped: 64, ia: 94 });
      setChartBars({ top: [90, 65, 45], zona: [80, 60, 35, 25] });
    }, 300);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'analytics') animateAnalytics();
  };

  const quickReply = (txt) => {
    if (inputDisabled) return;
    sendMessage(txt);
  };

  const handleSend = () => sendMessage(chatInput);

  return (
    <div className={`smash-root${isDayMode ? ' day' : ''}`}>
      <div id="smash-toast" className={toast.show ? 'show' : ''}>
        <span style={{ fontSize: '20px' }}>{toast.icon}</span>
        <span>{toast.text}</span>
      </div>

      <header className="smash-topbar">
        <div className="smash-logo-area">
          <h1 className="smash-logo">SMASH🍔</h1>
        </div>
        <nav className="top-nav">
          {[['chat','💬 Chat AI'],['agentes','🤖 Agentes'],['analytics','📊 Analytics'],['menu','🍔 Menú'],['flujo','🔄 Flujo']].map(([t,l]) => (
            <button key={t} className={`s-nav-btn${activeTab===t?' active':''}`} onClick={() => switchTab(t)}>{l}</button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="live-indicator"><div className="dot" /> LIVE SYSTEM</div>
          <button className="smash-theme-switch" onClick={() => setIsDayMode(p => !p)}>🌓 Día/Noche</button>
        </div>
      </header>

      <main className="smash-main">

        {/* ─── CHAT ─── */}
        <section className={`smash-view${activeTab==='chat'?' active':''}`}>
          <div className="chat-header-kpis">
            <div className="kpi-item"><div style={{fontSize:'11px',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px'}}>Pedidos Hoy</div><div className="kpi-value">{kpiPedidos}</div></div>
            <div className="kpi-item"><div style={{fontSize:'11px',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px'}}>Chats Activos</div><div className="kpi-value" style={{color:'var(--gold)'}}>8</div></div>
            <div className="kpi-item"><div style={{fontSize:'11px',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px'}}>IA Resolutividad</div><div className="kpi-value" style={{color:'var(--purple)'}}>94%</div></div>
            <div className="kpi-item"><div style={{fontSize:'11px',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px'}}>Tiempo Resp.</div><div className="kpi-value" style={{color:'var(--text)'}}>1.2s</div></div>
          </div>

          <div className="main-panels">
            <div className="phone-wrapper">
              <div className="iphone">
                <div className="notch" />
                <div className="wa-header">
                  <div className="wa-avatar">SB</div>
                  <div>
                    <div style={{fontSize:'15px',fontWeight:'700'}}>Smash Burger RD 🍔</div>
                    <div style={{fontSize:'12px',fontWeight:'600',color:'var(--green)',marginTop:'2px'}}>● IA Atendiendo</div>
                  </div>
                </div>
                <div className="wa-messages" ref={chatRef}>
                  <div style={{fontSize:'11px',background:'rgba(0,0,0,0.3)',color:'#A0A0A0',padding:'8px 12px',borderRadius:'8px',alignSelf:'center',textAlign:'center',marginBottom:'10px',fontWeight:'500'}}>🔒 Los mensajes y llamadas están cifrados de extremo a extremo.</div>
                  {messages.map((m, i) => (
                    m.type === 'system' ? (
                      <div key={i} style={{fontSize:'11px',background:'rgba(0,0,0,0.3)',color:'#A0A0A0',padding:'8px 12px',borderRadius:'8px',alignSelf:'center',textAlign:'center',marginBottom:'10px',fontWeight:'500'}}>{m.text}</div>
                    ) : (
                      <div key={i} className={`msg-bubble ${m.type}`} style={{opacity:1,transform:'translateY(0) scale(1)',transition:'all 0.2s'}}>
                        <span dangerouslySetInnerHTML={{__html:formatMsg(m.text)}} />
                        <span className="msg-time">{m.time}</span>
                      </div>
                    )
                  ))}
                  {typing && (
                    <div className="typing-indicator" style={{display:'flex'}}>
                      <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                    </div>
                  )}
                </div>
                <div className="wa-input-area">
                  <span style={{fontSize:'20px',color:'var(--text-muted)',cursor:'pointer'}}>😊</span>
                  <input type="text" className="wa-input-smash" placeholder="Escribe un mensaje..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleSend();}} disabled={inputDisabled} />
                  <button className="wa-send-smash" onClick={handleSend}>➤</button>
                </div>
              </div>
            </div>

            <div className="side-panels-container">
              {!showTracking ? (
                <div id="default-sidebar-controls">
                  <div className="chat-controls" style={{marginBottom:'25px'}}>
                    <button className="btn-primary-smash" onClick={startDemo} style={{opacity:demoInProgress?0.5:1}}>{demoBtnTxt}</button>
                    <div className="quick-replies">
                      <button className="btn-chip" onClick={() => quickReply('Hola')}>👋 Hola</button>
                      <button className="btn-chip" onClick={() => quickReply('3')}>📍 Zona Naco</button>
                      <button className="btn-chip" onClick={() => quickReply('2 Bacon Smash y unas papas')}>🍔 Pedir</button>
                      <button className="btn-chip" onClick={() => quickReply('Pagar')}>💳 Pagar</button>
                    </div>
                  </div>

                  <div className="sidebar-smash">
                    <h2 style={{fontSize:'12px',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'1px',fontWeight:'700'}}>Conversaciones en Vivo</h2>

                    <div className="chat-card" style={{borderColor:'var(--green)',background:'rgba(52,199,89,0.05)'}}>
                      <div className="chat-card-header"><span className="chat-card-name">Demo Actual</span><span className="chat-card-time" style={{color:'var(--green)'}}>Ahora</span></div>
                      <div className="chat-card-msg">{sidebarLastMsg}</div>
                      <div><span className="s-tag tag-ia">🤖 IA Activa</span></div>
                    </div>

                    <div className="chat-card">
                      <div className="chat-card-header"><span className="chat-card-name">Carlos M. · +1 829 4XX</span><span className="chat-card-time">2 min</span></div>
                      <div className="chat-card-msg">✅ Pago realizado. En espera.</div>
                      <div><span className="s-tag tag-ia">🤖 IA Activa</span> <span className="s-tag tag-zona">📍 Naco</span></div>
                    </div>

                    <div className="chat-card">
                      <div className="chat-card-header"><span className="chat-card-name">Laura G. · +1 809 5XX</span><span className="chat-card-time">5 min</span></div>
                      <div className="chat-card-msg">Llegó frío, quiero un reembolso!</div>
                      <div><span className="s-tag" style={{background:'rgba(255,59,48,0.15)',color:'var(--red)',border:'1px solid rgba(255,59,48,0.3)'}}>👤 Supervisor Asignado</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="tracking-panel">
                  <div className="tracker-img-container">🛵</div>

                  <div className="seguimiento-linea">
                    <div className="seg-bg-line">
                      <div id="tracking-progress" style={{width:trackingProgress+'%'}} />
                    </div>
                    {['📝','🍳','🚴','🏠'].map((ico,i) => (
                      <div key={i} className={`seguimiento-paso${activeSteps[i]?' active':''}`}>{ico}</div>
                    ))}
                  </div>

                  <div className="seguimiento-textos">
                    <span>Confirmado</span><span>Cocina</span><span>En Camino</span><span>Entregado</span>
                  </div>

                  <h3 className="seguimiento-status">{trackingTitle}</h3>
                  <p className="seguimiento-desc">{trackingDesc}</p>

                  <button className="seguimiento-btn" onClick={resetDemo}>Volver a mi pedido</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── AGENTES ─── */}
        <section className={`smash-view${activeTab==='agentes'?' active':''}`} style={{maxWidth:'1000px',margin:'0 auto'}}>
          <h1 className="metric" style={{fontSize:'32px',marginBottom:'8px'}}>Sistema Multi-Agente IA</h1>
          <p style={{color:'var(--text-muted)',fontSize:'15px',marginBottom:'30px'}}>Arquitectura de agentes autónomos que gestionan todo el proceso de Smash Burger RD sin intervención humana.</p>

          <div className="s-grid">
            {[{icon:'🤖',name:'SmashBot Principal',border:'var(--green)',tag:'IA',tagStyle:{background:'rgba(52,199,89,0.15)',color:'var(--green)',border:'1px solid rgba(52,199,89,0.3)'},tagTxt:'● ACTIVO',desc:'Procesa el Lenguaje Natural. Entiende modismos dominicanos, mapea el menú, saluda, estructura pedidos y calcula el carrito dinámicamente.'},
             {icon:'📍',name:'Agente de Zonas & Rutas',border:'var(--gold)',tag:'ZONA',tagStyle:{background:'rgba(255,204,0,0.15)',color:'var(--gold)',border:'1px solid rgba(255,204,0,0.3)'},tagTxt:'● ACTIVO',desc:'Identifica el sector del cliente, determina la sede de cocina (Dark Kitchen) más cercana y aplica la tarifa de delivery precisa por kilometraje.'},
             {icon:'💳',name:'Agente Financiero',border:'var(--red)',tag:'FIN',tagStyle:{background:'rgba(255,59,48,0.1)',color:'var(--red)',border:'1px solid rgba(255,59,48,0.3)'},tagTxt:'● ACTIVO',desc:'Genera links de pago únicos (Cardnet/Azul) o valida comprobantes de transferencia vía visión artificial. Dispara la orden solo si el dinero entró.'},
             {icon:'📱',name:'Agente Logístico KDS',border:'var(--blue)',tag:'KDS',tagStyle:{background:'rgba(90,200,250,0.1)',color:'var(--blue)',border:'1px solid rgba(90,200,250,0.3)'},tagTxt:'⏳ PRÓXIMAMENTE',desc:'Unificará las órdenes de WhatsApp directo a las pantallas de la cocina (Kitchen Display System) y rastreará a los motorizados por GPS.'}
            ].map(a => (
              <div key={a.name} className="s-card" style={{borderLeft:`4px solid ${a.border}`}}>
                <div className="s-card-icon">{a.icon}</div>
                <h2 className="s-card-title">{a.name}</h2>
                <span className="s-tag" style={{...a.tagStyle,marginBottom:'12px',display:'inline-block'}}>{a.tagTxt}</span>
                <p style={{fontSize:'14px',color:'var(--text-muted)',lineHeight:'1.6'}}>{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ANALYTICS ─── */}
        <section className={`smash-view${activeTab==='analytics'?' active':''}`} style={{maxWidth:'1000px',margin:'0 auto'}}>
          <h1 className="metric" style={{fontSize:'32px',marginBottom:'30px'}}>Analytics de WhatsApp (Hoy)</h1>

          <div className="s-grid s-grid-3" style={{marginBottom:'25px'}}>
            {[{h:'📩 Mensajes Procesados',val:counters.msg,delta:'↑ +24% vs ayer',dColor:'var(--green)',bar:bars.msg,barColor:'var(--green)',barId:'bar-msg'},
              {h:'🍔 Pedidos Pagados',val:counters.ped,delta:'↑ +31% vs ayer',dColor:'var(--red)',bar:bars.ped,barColor:'var(--red)',valStyle:{color:'var(--red)'}},
              {h:'🤖 Atención Sin Humano',val:counters.ia,delta:'Eficiencia IA',dColor:'var(--purple)',bar:bars.ia,barColor:'var(--purple)',valStyle:{color:'var(--purple)'}}
            ].map((s,i) => (
              <div key={i} className="s-card">
                <h3 style={{fontSize:'13px',color:'var(--text-muted)',fontWeight:'600',textTransform:'uppercase'}}>{s.h}</h3>
                <div className="stat-value" style={s.valStyle||{}}>{s.val}</div>
                <div style={{fontSize:'12px',color:s.dColor,fontWeight:'bold',marginBottom:'8px'}}>{s.delta}</div>
                <div className="s-progress-bg"><div className="s-progress-bar" style={{width:s.bar+'%',background:s.barColor}} /></div>
              </div>
            ))}
          </div>

          <div className="s-grid">
            <div className="s-card">
              <h3 style={{fontFamily:'Bebas Neue',fontSize:'22px',marginBottom:'10px',color:'var(--text)',letterSpacing:'1px'}}>🔥 TOP PRODUCTOS</h3>
              <div className="chart-wrapper">
                {[{color:'var(--green)',h:chartBars.top[0],val:'124',lbl:'Bacon\nSmash'},{color:'var(--red)',h:chartBars.top[1],val:'85',lbl:'Double\nSmash'},{color:'var(--gold)',h:chartBars.top[2],val:'52',lbl:'Papas\nTrufadas'}].map((b,i) => (
                  <div key={i} className="chart-col">
                    <div className="chart-bar-fill" style={{background:b.color,height:b.h+'%'}}>
                      <span className="chart-value" style={{opacity:b.h>0?1:0}}>{b.val}</span>
                    </div>
                    <div className="chart-label">{b.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="s-card">
              <h3 style={{fontFamily:'Bebas Neue',fontSize:'22px',marginBottom:'10px',color:'var(--text)',letterSpacing:'1px'}}>📍 DISTRIBUCIÓN POR ZONA</h3>
              <div className="chart-wrapper">
                {[{color:'var(--blue)',h:chartBars.zona[0],val:'40%',lbl:'Rep.\nColombia'},{color:'var(--purple)',h:chartBars.zona[1],val:'30%',lbl:'Naco /\nPiantini'},{color:'var(--green)',h:chartBars.zona[2],val:'18%',lbl:'Arroyo\nHondo'},{color:'var(--red)',h:chartBars.zona[3],val:'12%',lbl:'Mirador\nNorte'}].map((b,i) => (
                  <div key={i} className="chart-col">
                    <div className="chart-bar-fill" style={{background:b.color,height:b.h+'%'}}>
                      <span className="chart-value" style={{opacity:b.h>0?1:0}}>{b.val}</span>
                    </div>
                    <div className="chart-label">{b.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── MENU ─── */}
        <section className={`smash-view${activeTab==='menu'?' active':''}`} style={{maxWidth:'1000px',margin:'0 auto'}}>
          <h1 className="metric" style={{fontSize:'32px',marginBottom:'5px'}}>Menú Entrenado en la IA</h1>
          <p style={{fontSize:'15px',color:'var(--text-muted)',marginBottom:'30px'}}>Precios en RD$. El NLP mapea estos productos incluso con faltas ortográficas o audios.</p>

          <h3 style={{fontSize:'14px',color:'var(--red)',letterSpacing:'2px',marginBottom:'15px',fontWeight:'800'}}>🍔 BURGERS ESPECIALES</h3>
          <div className="s-grid s-grid-3" style={{marginBottom:'35px'}}>
            {[{name:'Clásica Smash',desc:'Patty smash, queso americano, pickles, mostaza en pan brioche suave.',price:'RD$ 450'},
              {name:'Double Smash',desc:'Dos patties smash jugosos, doble queso, cebolla caramelizada.',price:'RD$ 600'},
              {name:'Baconception',desc:'Doble smash, extra bacon crujiente, queso, salsa secreta de la casa.',price:'RD$ 650'}
            ].map(item => (
              <div key={item.name} className="s-card">
                <h2 className="s-card-title">{item.name}</h2>
                <p style={{fontSize:'14px',color:'var(--text-muted)'}}>{item.desc}</p>
                <div className="menu-price">{item.price}</div>
              </div>
            ))}
          </div>

          <h3 style={{fontSize:'14px',color:'var(--gold)',letterSpacing:'2px',marginBottom:'15px',fontWeight:'800'}}>🍟 ACOMPAÑANTES &amp; BEBIDAS</h3>
          <div className="s-grid s-grid-3">
            {[{name:'Papas Trufadas',desc:'Corte fino con aceite de trufa, queso parmesano y perejil.',price:'RD$ 220'},
              {name:'Cheese & Bacon Fries',desc:'Papas bañadas en salsa cheddar fundida y tocineta crujiente.',price:'RD$ 250'},
              {name:'Bebidas (12oz)',desc:'Coca-Cola, Sprite, Fanta o Agua mineral embotellada.',price:'RD$ 100'}
            ].map(item => (
              <div key={item.name} className="s-card">
                <h2 className="s-card-title">{item.name}</h2>
                <p style={{fontSize:'14px',color:'var(--text-muted)'}}>{item.desc}</p>
                <div className="menu-price">{item.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FLUJO ─── */}
        <section className={`smash-view${activeTab==='flujo'?' active':''}`} style={{maxWidth:'800px',margin:'0 auto'}}>
          <h1 className="metric" style={{fontSize:'32px',marginBottom:'5px'}}>Flujo de Conversión IA</h1>
          <p style={{fontSize:'15px',color:'var(--text-muted)',marginBottom:'20px'}}>Cómo interactúan los agentes desde el primer "Hola" hasta la entrega en la puerta.</p>

          <div className="s-timeline">
            {[{title:'1. Ingreso de Mensaje (API)',desc:'El cliente escribe al número de WhatsApp de Smash Burger. La API oficial de Meta envía el Webhook a nuestro servidor en milisegundos.',dotColor:'var(--green)'},
              {title:'2. NLP & Asignación de Zona',desc:'SmashBot detecta la intención. Pregunta la zona (Ej: Naco), asigna la Sede más cercana y calcula automáticamente el precio del delivery por kilometraje.',dotColor:'var(--gold)'},
              {title:'3. Construcción del Carrito Libre',desc:'El cliente dice en texto libre "Quiero 2 bacon y papas". La IA comprende el contexto, mapea a la base de datos de productos, suma los precios + delivery.',dotColor:'var(--green)'},
              {title:'4. Pasarela de Pago Segura',desc:'Si el usuario acepta, el Agente Financiero genera un link de pago único y seguro (Ej: Cardnet). El bot queda a la espera de la confirmación silenciosa del banco.',dotColor:'var(--red)'},
              {title:'5. KDS y Logística (Tracking)',desc:'Al confirmarse el pago, la orden se imprime automáticamente en las pantallas de la cocina. El bot envía al cliente un enlace web visual para seguir al motorizado.',dotColor:'var(--blue)'}
            ].map((item, i) => (
              <div key={i} className="s-timeline-item">
                <div className="s-timeline-dot" style={{borderColor:item.dotColor}} />
                <div className="s-timeline-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <nav className="smash-bottom-nav">
        {[['chat','💬','Chat'],['agentes','🤖','Agentes'],['analytics','📊','Stats'],['menu','🍔','Menú'],['flujo','🔄','Flujo']].map(([t,ico,lbl]) => (
          <button key={t} className={`s-nav-btn${activeTab===t?' active':''}`} onClick={() => switchTab(t)}>
            <span style={{fontSize:'20px'}}>{ico}</span>{lbl}
          </button>
        ))}
      </nav>
    </div>
  );
}
