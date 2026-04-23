import { useState, useEffect, useRef, useCallback } from 'react';
import '../smash.css';

const BOT_REPLIES = {
    greet: "¡Qué bueno tenerte por acá! 🍔\n\n¿Desde qué zona nos escribes hoy?\n1️⃣ Mirador Norte\n2️⃣ Arroyo Hondo\n3️⃣ Naco / Piantini\n4️⃣ Rep. Colombia",
    zone: "📍 *Sede Naco / Piantini* seleccionada.\nCosto de delivery estimado: *RD$150*\n\n¿Qué vas a pedir hoy del menú? 👇",
    order: "🧾 *Resumen de tu pedido:*\n\n🍔 2 × Baconception = *RD$1,300*\n🍟 1 × Papas Trufadas = *RD$220*\n🛵 Delivery (Naco) = *RD$150*\n──────────────\n💰 *TOTAL: RD$1,670*\n\n¿Procedemos a pagar? Escribe *Pagar* o *Sí*",
    pay: "💳 *Link de pago seguro generado:*\n🔗 https://pay.smashburger.rd/SB-0089\n\nNotifícame cuando realices el pago.",
    default: "¿Podrías ser más específico? (Intenta saludar, pedir zonas o encargar unas burgers)."
};

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
    const [sidebarLastMsg, setSidebarLastMsg] = useState('Esperando interacción...');
    const [kpiPedidos, setKpiPedidos] = useState(142);

    const chatContainerRef = useRef(null);

    // Tracking panel state
    const [showTracking, setShowTracking] = useState(false);
    const [trackingProgress, setTrackingProgress] = useState(0);
    const [activeSteps, setActiveSteps] = useState([false, false, false, false]);
    const [trackingStatusTitle, setTrackingStatusTitle] = useState('Preparando tu pedido');
    const [trackingStatusDesc, setTrackingStatusDesc] = useState('Nuestros chefs están cocinando tus Smash Burgers con amor. ¡Casi listas!');

    // Analytics state
    const [analyticsAnimated, setAnalyticsAnimated] = useState(false);
    const [counters, setCounters] = useState({ msg: 0, ped: 0, ia: 0 });
    const [bars, setBars] = useState({ msg: 0, ped: 0, ia: 0 });
    const [chartBars, setChartBars] = useState({ top: [0, 0, 0], zona: [0, 0, 0, 0] });

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
    };

    const showToast = useCallback((message, icon = '✅') => {
        setToast({ show: true, text: message, icon });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3500);
    }, []);

    const appendMessage = useCallback((text, type) => {
        const time = getCurrentTime();
        setMessages(prev => [...prev, { text, type, time }]);
        setSidebarLastMsg((type === 'msg-in' ? 'IA: ' : 'Tú: ') + text.substring(0, 25) + '...');
    }, []);

    const formatMsg = (text) => {
        return text.replace(/\*([^*]+)\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    };

    const triggerPaymentSuccessLogic = useCallback(() => {
        appendMessage("✅ *¡Pago Confirmado por el Banco!*\n\nTu pedido #SB-1423 ya está en nuestras pantallas de cocina 🍳. \n\nPuedes seguir tu pedido en tiempo real en el panel lateral. ¡Disfruta tus Smash!", 'msg-in');
        
        setKpiPedidos(prev => prev + 1);
        showToast("Demo interactiva completada", "✨");
        
        setTimeout(() => {
            showToast("Pago procesado exitosamente", "💳");
            setShowTracking(true);
            setActiveSteps([true, false, false, false]);
            setTrackingProgress(15);
        }, 3500);

        setTimeout(() => {
            showToast("Su domiciliario va en camino", "🛵");
            setActiveSteps([true, true, false, false]);
            setTrackingProgress(50);
            setTrackingStatusTitle("En Preparación");
            setTrackingStatusDesc("Estamos dándole la vuelta a tus patties en la plancha.");

            setTimeout(() => {
                setActiveSteps([true, true, true, false]);
                setTrackingProgress(85);
                setTrackingStatusTitle("Motorizado en Camino");
                setTrackingStatusDesc("Juan Pérez (Honda CG) se dirige a tu ubicación.");
            }, 4000);
        }, 7500);
    }, [appendMessage, showToast]);

    const sendMessage = useCallback((overrideText) => {
        const text = (overrideText !== undefined ? overrideText : chatInput).trim();
        if (!text) return;

        appendMessage(text, 'msg-out');
        if (overrideText === undefined) setChatInput('');

        setTyping(true);
        
        setTimeout(() => {
            setTyping(false);
            const textLower = text.toLowerCase();
            let botReply = BOT_REPLIES.default;

            if (textLower.includes('hola') || textLower.includes('pedir') || textLower.includes('buenas')) {
                botReply = BOT_REPLIES.greet;
            } else if (textLower.includes('3') || textLower.includes('naco') || textLower.includes('piantini')) {
                botReply = BOT_REPLIES.zone;
            } else if (textLower.includes('pedido') || textLower.includes('bacon') || textLower.includes('papas')) {
                botReply = BOT_REPLIES.order;
            } else if (textLower.includes('pagar') || textLower.includes('si') || textLower.includes('sí')) {
                botReply = BOT_REPLIES.pay;
                showToast("Enlace generado con éxito", "🔗");
            } else if (textLower.includes('listo') || textLower.includes('pague') || textLower.includes('pagado')) {
                triggerPaymentSuccessLogic();
                return;
            }

            appendMessage(botReply, 'msg-in');
        }, 1000 + Math.random() * 600);
    }, [chatInput, appendMessage, triggerPaymentSuccessLogic, showToast]);

    const startDemo = () => {
        if (demoInProgress) return;
        setDemoInProgress(true);
        setInputDisabled(true);

        const sequence = [
            { text: "Hola, quiero pedir la cena", sender: "user", delay: 800 },
            { text: "¡Hola! 👋 Bienvenido a *Smash Burger RD*. ¿Desde qué sector nos escribes para asignar tu cocina y calcular delivery?", sender: "bot", delay: 2800 },
            { text: "Sector Naco", sender: "user", delay: 5000 },
            { text: "📍 Sede Naco / Piantini. Delivery: *RD$150*.\n\n¿Qué vas a pedir hoy del menú? 🍔", sender: "bot", delay: 7500 },
            { text: "Quiero 2 Double Smash y 1 Papas Trufadas", sender: "user", delay: 10500 },
            { text: "🧾 *Resumen de pedido:*\n\n🍔 2 × Double Smash = *RD$1,200*\n🍟 1 × Papas Trufadas = *RD$220*\n🛵 Delivery (Naco) = *RD$150*\n──────────────\n💰 *TOTAL: RD$1,570*\n\n¿Confirmamos para generar el pago? *SÍ*", sender: "bot", delay: 13500 },
            { text: "SÍ ✅", sender: "user", delay: 16000 },
            { text: "💳 *Link de pago seguro:*\n🔗 https://pay.smashburger.rd/SB-1423\n\n(Simulando que el usuario entra y paga...)", sender: "bot", delay: 18500 }
        ];

        setMessages([{ text: "🔒 Chat Cifrado · IA Atendiendo", type: "system", time: "" }]);

        sequence.forEach((step, index) => {
            const accumulatedTime = step.delay;
            
            if (step.sender === 'bot') {
                setTimeout(() => {
                    setTyping(true);
                }, accumulatedTime - 1000);
            }

            setTimeout(() => {
                setTyping(false);
                appendMessage(step.text, step.sender === 'user' ? 'msg-out' : 'msg-in');
                
                if (index === sequence.length - 1) {
                    setTimeout(() => { triggerPaymentSuccessLogic(); }, 2500);
                }
            }, accumulatedTime);
        });
    };

    const resetDemo = () => {
        setShowTracking(false);
        setDemoInProgress(false);
        setInputDisabled(false);
        setActiveSteps([false, false, false, false]);
        setTrackingProgress(0);
        setTrackingStatusTitle("Pedido Confirmado");
        setTrackingStatusDesc("Hemos recibido tu orden y la estamos enviando a cocina.");
    };

    const animateAnalytics = useCallback(() => {
        if (analyticsAnimated) return;
        setAnalyticsAnimated(true);

        const animateValue = (target, setter, suffix = '') => {
            let current = 0;
            const duration = 2000;
            const increment = target / (duration / 16);
            const update = () => {
                current += increment;
                if (current < target) {
                    setter(Math.ceil(current) + suffix);
                    requestAnimationFrame(update);
                } else {
                    setter(target + suffix);
                }
            };
            update();
        };

        animateValue(1845, (val) => setCounters(prev => ({ ...prev, msg: val })));
        animateValue(142, (val) => setCounters(prev => ({ ...prev, ped: val })));
        animateValue(94, (val) => setCounters(prev => ({ ...prev, ia: val })), '%');

        setTimeout(() => {
            setBars({ msg: 88, ped: 64, ia: 94 });
            setChartBars({
                top: [90, 65, 45],
                zona: [80, 60, 35, 25]
            });
        }, 300);
    }, [analyticsAnimated]);

    const switchTab = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'analytics') {
            animateAnalytics();
        }
    };

    useEffect(() => {
        const t = setTimeout(() => {
            appendMessage("¡Hola! 👋 Soy *SmashBot* de Smash Burger RD 🍔.\n\n¿En qué te puedo ayudar el día de hoy?", 'msg-in');
        }, 800);
        return () => clearTimeout(t);
    }, [appendMessage]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, typing]);

    return (
        <div className={`smash-root${isDayMode ? ' day' : ''}`}>
            <div id="toast" className={toast.show ? 'show' : ''}>
                <span id="toast-icon">{toast.icon}</span>
                <span id="toast-text">{toast.text}</span>
            </div>

            <header className="topbar">
                <div className="logo-area">
                    <h1 className="logo">SMASH🍔</h1>
                </div>
                <nav className="top-nav">
                    <button className={`nav-btn${activeTab === 'chat' ? ' active' : ''}`} onClick={() => switchTab('chat')}>💬 Chat AI</button>
                    <button className={`nav-btn${activeTab === 'agentes' ? ' active' : ''}`} onClick={() => switchTab('agentes')}>🤖 Agentes</button>
                    <button className={`nav-btn${activeTab === 'analytics' ? ' active' : ''}`} onClick={() => switchTab('analytics')}>📊 Analytics</button>
                    <button className={`nav-btn${activeTab === 'menu' ? ' active' : ''}`} onClick={() => switchTab('menu')}>🍔 Menú</button>
                    <button className={`nav-btn${activeTab === 'flujo' ? ' active' : ''}`} onClick={() => switchTab('flujo')}>🔄 Flujo</button>
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="live-indicator"><div className="dot"></div> LIVE SYSTEM</div>
                    <button className="theme-switch" onClick={() => setIsDayMode(!isDayMode)}>🌓 Día/Noche</button>
                </div>
            </header>

            <main className="main-content">
                
                <section id="view-chat" className={`view${activeTab === 'chat' ? ' active' : ''}`}>
                    <div className="chat-header-kpis">
                        <div className="kpi-item">
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Pedidos Hoy</div>
                            <div className="kpi-value">{kpiPedidos}</div>
                        </div>
                        <div className="kpi-item">
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Chats Activos</div>
                            <div className="kpi-value" style={{ color: 'var(--gold)' }}>8</div>
                        </div>
                        <div className="kpi-item">
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>IA Resolutividad</div>
                            <div className="kpi-value" style={{ color: 'var(--purple)' }}>94%</div>
                        </div>
                        <div className="kpi-item">
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Tiempo Resp.</div>
                            <div className="kpi-value" style={{ color: 'var(--text)' }}>1.2s</div>
                        </div>
                    </div>

                    <div className="main-panels">
                        <div className="phone-wrapper">
                            <div className="iphone">
                                <div className="notch"></div>
                                <div className="wa-header">
                                    <div className="wa-avatar">SB</div>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: '700' }}>Smash Burger RD 🍔</div>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--green)', marginTop: '2px' }}>● IA Atendiendo</div>
                                    </div>
                                </div>
                                <div className="wa-messages" ref={chatContainerRef}>
                                    <div style={{ fontSize: '11px', background: 'rgba(0,0,0,0.3)', color: '#A0A0A0', padding: '8px 12px', borderRadius: '8px', alignSelf: 'center', textAlign: 'center', marginBottom: '10px', fontWeight: '500' }}>🔒 Los mensajes y llamadas están cifrados de extremo a extremo.</div>
                                    {messages.map((msg, i) => (
                                        msg.type === 'system' ? (
                                            <div key={i} style={{ fontSize: '11px', background: 'rgba(0,0,0,0.3)', color: '#A0A0A0', padding: '8px 12px', borderRadius: '8px', alignSelf: 'center', textAlign: 'center', marginBottom: '10px', fontWeight: '500' }}>{msg.text}</div>
                                        ) : (
                                            <div key={i} className={`msg-bubble ${msg.type}`} dangerouslySetInnerHTML={{ __html: `${formatMsg(msg.text)} <span class="msg-time">${msg.time}</span>` }}></div>
                                        )
                                    ))}
                                    {typing && (
                                        <div className="typing-indicator" style={{ display: 'block' }}>
                                            <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="wa-input-area">
                                    <span style={{ fontSize: '20px', color: 'var(--text-muted)', cursor: 'pointer' }}>😊</span>
                                    <input type="text" className="wa-input" placeholder="Escribe un mensaje..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} disabled={inputDisabled} />
                                    <button className="wa-send" onClick={() => sendMessage()}>➤</button>
                                </div>
                            </div>
                        </div>

                        <div className="side-panels-container">
                            {!showTracking ? (
                                <div id="default-sidebar-controls">
                                    <div className="chat-controls" style={{ marginBottom: '25px' }}>
                                        <button className="btn-primary" onClick={startDemo} style={{ opacity: demoInProgress ? 0.5 : 1 }}>{demoInProgress ? '⏳ Ejecutando Demo...' : '▶ Iniciar Demo Irresistible'}</button>
                                        <div className="quick-replies">
                                            <button className="btn-chip" onClick={() => sendMessage('Hola')}>👋 Hola</button>
                                            <button className="btn-chip" onClick={() => sendMessage('3')}>📍 Zona Naco</button>
                                            <button className="btn-chip" onClick={() => sendMessage('2 Bacon Smash y unas papas')}>🍔 Pedir</button>
                                            <button className="btn-chip" onClick={() => sendMessage('Pagar')}>💳 Pagar</button>
                                        </div>
                                    </div>

                                    <div className="sidebar">
                                        <h2 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Conversaciones en Vivo</h2>
                                        
                                        <div className="chat-card" style={{ borderColor: 'var(--green)', background: 'rgba(52, 199, 89, 0.05)' }}>
                                            <div className="chat-card-header">
                                                <span className="chat-card-name">Demo Actual</span>
                                                <span className="chat-card-time" style={{ color: 'var(--green)' }}>Ahora</span>
                                            </div>
                                            <div className="chat-card-msg">{sidebarLastMsg}</div>
                                            <div>
                                                <span className="tag tag-ia">🤖 IA Activa</span>
                                            </div>
                                        </div>

                                        <div className="chat-card">
                                            <div className="chat-card-header">
                                                <span className="chat-card-name">Carlos M. · +1 829 4XX</span>
                                                <span className="chat-card-time">2 min</span>
                                            </div>
                                            <div className="chat-card-msg">✅ Pago realizado. En espera.</div>
                                            <div>
                                                <span className="tag tag-ia">🤖 IA Activa</span>
                                                <span className="tag tag-zona">📍 Naco</span>
                                            </div>
                                        </div>
                                        
                                        <div className="chat-card">
                                            <div className="chat-card-header">
                                                <span className="chat-card-name">Laura G. · +1 809 5XX</span>
                                                <span className="chat-card-time">5 min</span>
                                            </div>
                                            <div className="chat-card-msg">Llegó frío, quiero un reembolso!</div>
                                            <div>
                                                <span className="tag" style={{ background: 'rgba(255, 59, 48, 0.15)', color: 'var(--red)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>👤 Supervisor Asignado</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div id="tracking-panel">
                                    <div className="tracker-img-container">
                                        🛵
                                    </div>
                                    
                                    <div className="seguimiento-linea">
                                        <div className="seg-bg-line">
                                            <div id="tracking-progress" style={{ width: `${trackingProgress}%` }}></div>
                                        </div>
                                        <div className={`seguimiento-paso${activeSteps[0] ? ' active' : ''}`}>📝</div>
                                        <div className={`seguimiento-paso${activeSteps[1] ? ' active' : ''}`}>🍳</div>
                                        <div className={`seguimiento-paso${activeSteps[2] ? ' active' : ''}`}>🚴</div>
                                        <div className={`seguimiento-paso${activeSteps[3] ? ' active' : ''}`}>🏠</div>
                                    </div>
                                    
                                    <div className="seguimiento-textos">
                                        <span>Confirmado</span>
                                        <span>Cocina</span>
                                        <span>En Camino</span>
                                        <span>Entregado</span>
                                    </div>

                                    <h3 className="seguimiento-status">{trackingStatusTitle}</h3>
                                    <p className="seguimiento-desc">{trackingStatusDesc}</p>
                                    
                                    <button className="seguimiento-btn" onClick={resetDemo}>Volver a mi pedido</button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section id="view-agentes" className={`view${activeTab === 'agentes' ? ' active' : ''}`} style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1 className="metric" style={{ fontSize: '32px', marginBottom: '8px' }}>Sistema Multi-Agente IA</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '30px' }}>Arquitectura de agentes autónomos que gestionan todo el proceso de Smash Burger RD sin intervención humana.</p>
                    
                    <div className="grid-container">
                        <div className="card" style={{ borderLeft: '4px solid var(--green)' }}>
                            <div className="card-icon">🤖</div>
                            <h2 className="card-title">SmashBot Principal</h2>
                            <span className="tag tag-ia" style={{ marginBottom: '12px', display: 'inline-block' }}>● ACTIVO</span>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>Procesa el Lenguaje Natural. Entiende modismos dominicanos, mapea el menú, saluda, estructura pedidos y calcula el carrito dinámicamente.</p>
                        </div>
                        <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
                            <div className="card-icon">📍</div>
                            <h2 className="card-title">Agente de Zonas & Rutas</h2>
                            <span className="tag tag-zona" style={{ marginBottom: '12px', display: 'inline-block' }}>● ACTIVO</span>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>Identifica el sector del cliente, determina la sede de cocina (Dark Kitchen) más cercana y aplica la tarifa de delivery precisa por kilometraje.</p>
                        </div>
                        <div className="card" style={{ borderLeft: '4px solid var(--red)' }}>
                            <div className="card-icon">💳</div>
                            <h2 className="card-title">Agente Financiero</h2>
                            <span className="tag" style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--red)', border: '1px solid rgba(255, 59, 48, 0.3)', marginBottom: '12px', display: 'inline-block' }}>● ACTIVO</span>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>Genera links de pago únicos (Cardnet/Azul) o valida comprobantes de transferencia vía visión artificial. Dispara la orden solo si el dinero entró.</p>
                        </div>
                        <div className="card" style={{ borderLeft: '4px solid var(--blue)' }}>
                            <div className="card-icon">📱</div>
                            <h2 className="card-title">Agente Logístico KDS</h2>
                            <span className="tag" style={{ background: 'rgba(90, 200, 250, 0.1)', color: 'var(--blue)', border: '1px solid rgba(90, 200, 250, 0.3)', marginBottom: '12px', display: 'inline-block' }}>⏳ PRÓXIMAMENTE</span>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>Unificará las órdenes de WhatsApp directo a las pantallas de la cocina (Kitchen Display System) y rastreará a los motorizados por GPS.</p>
                        </div>
                    </div>
                </section>

                <section id="view-analytics" className={`view${activeTab === 'analytics' ? ' active' : ''}`} style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1 className="metric" style={{ fontSize: '32px', marginBottom: '30px' }}>Analytics de WhatsApp (Hoy)</h1>
                    
                    <div className="grid-container grid-3" style={{ marginBottom: '25px' }}>
                        <div className="card">
                            <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>📩 Mensajes Procesados</h3>
                            <div className="stat-value">{counters.msg}</div>
                            <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold', marginBottom: '8px' }}>↑ +24% vs ayer</div>
                            <div className="progress-bg"><div className="progress-bar" style={{ background: 'var(--green)', width: `${bars.msg}%` }}></div></div>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>🍔 Pedidos Pagados</h3>
                            <div className="stat-value" style={{ color: 'var(--red)' }}>{counters.ped}</div>
                            <div style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '8px' }}>↑ +31% vs ayer</div>
                            <div className="progress-bg"><div className="progress-bar" style={{ background: 'var(--red)', width: `${bars.ped}%` }}></div></div>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>🤖 Atención Sin Humano</h3>
                            <div className="stat-value" style={{ color: 'var(--purple)' }}>{counters.ia}%</div>
                            <div style={{ fontSize: '12px', color: 'var(--purple)', fontWeight: 'bold', marginBottom: '8px' }}>Eficiencia IA</div>
                            <div className="progress-bg"><div className="progress-bar" style={{ background: 'var(--purple)', width: `${bars.ia}%` }}></div></div>
                        </div>
                    </div>

                    <div className="grid-container">
                        
                        <div className="card">
                            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '22px', marginBottom: '10px', color: 'var(--text)', letterSpacing: '1px' }}>🔥 TOP PRODUCTOS</h3>
                            
                            <div className="chart-wrapper">
                                <div className="chart-col">
                                    <div className="chart-bar-fill" style={{ background: 'var(--green)', height: `${chartBars.top[0]}%` }}>
                                        <span className="chart-value" style={{ opacity: chartBars.top[0] > 0 ? 1 : 0 }}>124</span>
                                    </div>
                                    <div className="chart-label">Bacon<br />Smash</div>
                                </div>
                                <div className="chart-col">
                                    <div className="chart-bar-fill" style={{ background: 'var(--red)', height: `${chartBars.top[1]}%` }}>
                                        <span className="chart-value" style={{ opacity: chartBars.top[1] > 0 ? 1 : 0 }}>85</span>
                                    </div>
                                    <div className="chart-label">Double<br />Smash</div>
                                </div>
                                <div className="chart-col">
                                    <div className="chart-bar-fill" style={{ background: 'var(--gold)', height: `${chartBars.top[2]}%` }}>
                                        <span className="chart-value" style={{ opacity: chartBars.top[2] > 0 ? 1 : 0 }}>52</span>
                                    </div>
                                    <div className="chart-label">Papas<br />Trufadas</div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '22px', marginBottom: '10px', color: 'var(--text)', letterSpacing: '1px' }}>📍 DISTRIBUCIÓN POR ZONA</h3>
                            
                            <div className="chart-wrapper">
                                <div className="chart-col">
                                    <div className="chart-bar-fill" style={{ background: 'var(--blue)', height: `${chartBars.zona[0]}%` }}>
                                        <span className="chart-value" style={{ opacity: chartBars.zona[0] > 0 ? 1 : 0 }}>40%</span>
                                    </div>
                                    <div className="chart-label">Rep.<br />Colombia</div>
                                </div>
                                <div className="chart-col">
                                    <div className="chart-bar-fill" style={{ background: 'var(--purple)', height: `${chartBars.zona[1]}%` }}>
                                        <span className="chart-value" style={{ opacity: chartBars.zona[1] > 0 ? 1 : 0 }}>30%</span>
                                    </div>
                                    <div className="chart-label">Naco /<br />Piantini</div>
                                </div>
                                <div className="chart-col">
                                    <div className="chart-bar-fill" style={{ background: 'var(--green)', height: `${chartBars.zona[2]}%` }}>
                                        <span className="chart-value" style={{ opacity: chartBars.zona[2] > 0 ? 1 : 0 }}>18%</span>
                                    </div>
                                    <div className="chart-label">Arroyo<br />Hondo</div>
                                </div>
                                <div className="chart-col">
                                    <div className="chart-bar-fill" style={{ background: 'var(--red)', height: `${chartBars.zona[3]}%` }}>
                                        <span className="chart-value" style={{ opacity: chartBars.zona[3] > 0 ? 1 : 0 }}>12%</span>
                                    </div>
                                    <div className="chart-label">Mirador<br />Norte</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <section id="view-menu" className={`view${activeTab === 'menu' ? ' active' : ''}`} style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1 className="metric" style={{ fontSize: '32px', marginBottom: '5px' }}>Menú Entrenado en la IA</h1>
                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '30px' }}>Precios en RD$. El NLP mapea estos productos incluso con faltas ortográficas o audios.</p>
                    
                    <h3 style={{ fontSize: '14px', color: 'var(--red)', letterSpacing: '2px', marginBottom: '15px', fontWeight: '800' }}>🍔 BURGERS ESPECIALES</h3>
                    <div className="grid-container grid-3" style={{ marginBottom: '35px' }}>
                        <div className="card">
                            <h2 className="card-title">Clásica Smash</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Patty smash, queso americano, pickles, mostaza en pan brioche suave.</p>
                            <div className="menu-price">RD$ 450</div>
                        </div>
                        <div className="card">
                            <h2 className="card-title">Double Smash</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Dos patties smash jugosos, doble queso, cebolla caramelizada.</p>
                            <div className="menu-price">RD$ 600</div>
                        </div>
                        <div className="card">
                            <h2 className="card-title">Baconception</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Doble smash, extra bacon crujiente, queso, salsa secreta de la casa.</p>
                            <div className="menu-price">RD$ 650</div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '14px', color: 'var(--gold)', letterSpacing: '2px', marginBottom: '15px', fontWeight: '800' }}>🍟 ACOMPAÑANTES & BEBIDAS</h3>
                    <div className="grid-container grid-3">
                        <div className="card">
                            <h2 className="card-title">Papas Trufadas</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Corte fino con aceite de trufa, queso parmesano y perejil.</p>
                            <div className="menu-price">RD$ 220</div>
                        </div>
                        <div className="card">
                            <h2 className="card-title">Cheese & Bacon Fries</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Papas bañadas en salsa cheddar fundida y tocineta crujiente.</p>
                            <div className="menu-price">RD$ 250</div>
                        </div>
                        <div className="card">
                            <h2 className="card-title">Bebidas (12oz)</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Coca-Cola, Sprite, Fanta o Agua mineral embotellada.</p>
                            <div className="menu-price">RD$ 100</div>
                        </div>
                    </div>
                </section>

                <section id="view-flujo" className={`view${activeTab === 'flujo' ? ' active' : ''}`} style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="metric" style={{ fontSize: '32px', marginBottom: '5px' }}>Flujo de Conversión IA</h1>
                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>Cómo interactúan los agentes desde el primer "Hola" hasta la entrega en la puerta.</p>
                    
                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <h3>1. Ingreso de Mensaje (API)</h3>
                                <p>El cliente escribe al número de WhatsApp de Smash Burger. La API oficial de Meta envía el Webhook a nuestro servidor en milisegundos.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot" style={{ borderColor: 'var(--gold)' }}></div>
                            <div className="timeline-content">
                                <h3>2. NLP & Asignación de Zona</h3>
                                <p>SmashBot detecta la intención. Pregunta la zona (Ej: Naco), asigna la Sede más cercana y calcula automáticamente el precio del delivery por kilometraje.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <h3>3. Construcción del Carrito Libre</h3>
                                <p>El cliente dice en texto libre "Quiero 2 bacon y papas". La IA comprende el contexto, mapea a la base de datos de productos, suma los precios + el delivery y devuelve una cotización perfecta.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot" style={{ borderColor: 'var(--red)' }}></div>
                            <div className="timeline-content">
                                <h3>4. Pasarela de Pago Segura</h3>
                                <p>Si el usuario acepta, el Agente Financiero genera un link de pago único y seguro (Ej: Cardnet). El bot queda a la espera de la confirmación silenciosa del banco.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot" style={{ borderColor: 'var(--blue)' }}></div>
                            <div className="timeline-content">
                                <h3>5. KDS y Logística (Tracking)</h3>
                                <p>Al confirmarse el pago, la orden se imprime automáticamente en las pantallas de la cocina. El bot envía al cliente un enlace web visual para seguir al motorizado estilo Rappi/Uber Eats.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <nav className="bottom-nav">
                <button className={`nav-btn${activeTab === 'chat' ? ' active' : ''}`} onClick={() => switchTab('chat')}><span style={{ fontSize: '20px' }}>💬</span>Chat</button>
                <button className={`nav-btn${activeTab === 'agentes' ? ' active' : ''}`} onClick={() => switchTab('agentes')}><span style={{ fontSize: '20px' }}>🤖</span>Agentes</button>
                <button className={`nav-btn${activeTab === 'analytics' ? ' active' : ''}`} onClick={() => switchTab('analytics')}><span style={{ fontSize: '20px' }}>📊</span>Stats</button>
                <button className={`nav-btn${activeTab === 'menu' ? ' active' : ''}`} onClick={() => switchTab('menu')}><span style={{ fontSize: '20px' }}>🍔</span>Menú</button>
                <button className={`nav-btn${activeTab === 'flujo' ? ' active' : ''}`} onClick={() => switchTab('flujo')}><span style={{ fontSize: '20px' }}>🔄</span>Flujo</button>
            </nav>
        </div>
    );
}
