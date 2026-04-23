import { useState, useEffect, useRef, useCallback } from 'react';
import '../crm.css';

const CLIENTS = [
  {id:1,company:'TechCorp Colombia',sector:'Software',city:'Bogotá, CO',size:'250-500',contact:'María Rodríguez',role:'Dir. Comercial',email:'maria@techcorp.co',phone:'+57 310 842 9180',value:24000,source:'Google Ads',channel:'WhatsApp',status:'hot',stage:'Prospecto',notes:'Interesada en plan Enterprise. BANT calificado.',avatar:'TC',color:'linear-gradient(135deg,#2D6BE4,#06C8E8)',tl:[{txt:'Lead captado via Google Ads',t:'Hace 2h',c:'g'},{txt:'IA enriqueció perfil: 250 emp, LinkedIn verificado',t:'Hace 2h',c:''},{txt:'WA automático enviado: Plantilla Bienvenida',t:'Hace 1h55',c:'a'},{txt:'María respondió: "Sí, me interesa"',t:'Hace 1h30',c:''},{txt:'BANT calificado: Budget ✓ Auth ✓ Need ✓ Timeline Q1 ✓',t:'Hace 1h28',c:'g'}]},
  {id:2,company:'Multipacking S.A.',sector:'Manufactura',city:'Medellín, CO',size:'100-250',contact:'Juan Ríos',role:'Dir. TI',email:'j.rios@multipacking.co',phone:'+57 312 445 8820',value:12000,source:'Referido',channel:'Email',status:'client',stage:'Cliente activo',notes:'Plan Growth activo. Candidato upsell VoIP.',avatar:'MP',color:'linear-gradient(135deg,#10D98C,#06C8E8)',tl:[{txt:'Onboarding completado — Plan Growth',t:'Hace 15 días',c:'g'},{txt:'WA API configurada: 5 plantillas aprobadas',t:'Hace 14 días',c:''},{txt:'Primera campaña: 1,200 contactos · 42% apertura',t:'Hace 10 días',c:'g'},{txt:'IA detectó oportunidad upsell: VoIP Asterisk',t:'Hace 3 días',c:'a'}]},
  {id:3,company:'Grupo Náutica',sector:'Distribución',city:'Barranquilla, CO',size:'50-100',contact:'Carlos Pérez',role:'Gerente General',email:'cperez@gnautica.co',phone:'+57 301 420 8844',value:8500,source:'Meta Ads',channel:'Llamada',status:'warm',stage:'Contactado',notes:'Interés medio. Pendiente demo esta semana.',avatar:'GN',color:'linear-gradient(135deg,#F5A623,#EF5350)',tl:[{txt:'Lead Meta Ads · Colombia',t:'Hace 5h',c:'g'},{txt:'Llamada inicial: 3 min · interés medio',t:'Hace 4h',c:''},{txt:'Propuesta enviada · Vista 1 vez',t:'Hace 2h',c:'a'},{txt:'Sin respuesta · Secuencia reactivación programada',t:'Hace 30min',c:''}]},
  {id:4,company:'InnovaLogística',sector:'Logística',city:'Cali, CO',size:'100-250',contact:'Ana Martínez',role:'CEO',email:'ana@inno-log.co',phone:'+57 316 225 7740',value:15700,source:'WhatsApp Orgánico',channel:'Bot IA',status:'hot',stage:'Calificado',notes:'Score IA 87. Demo agendada jueves 10am.',avatar:'IL',color:'linear-gradient(135deg,#8B5CF6,#2D6BE4)',tl:[{txt:'Lead via WhatsApp orgánico',t:'Ayer',c:'g'},{txt:'Bot IA calificó: necesidad crítica detectada',t:'Ayer',c:'p'},{txt:'Score IA: 87/100 — asignado como HOT',t:'Ayer',c:''},{txt:'Demo agendada jueves 10am',t:'Hoy 09:00',c:'g'}]},
  {id:5,company:'Alimentos Frescos',sector:'Alimentos',city:'Bogotá, CO',size:'50-100',contact:'Sandra Lima',role:'Dir. General',email:'slima@alimfrescos.co',phone:'+57 314 890 2241',value:42000,source:'Meta Ads',channel:'WhatsApp',status:'warm',stage:'En negociación',notes:'Propuesta $42K/año enviada. CFO revisando.',avatar:'AF',color:'linear-gradient(135deg,#EF5350,#F5A623)',tl:[{txt:'Lead Meta Ads calificado por Bot IA',t:'Hace 3 días',c:'g'},{txt:'Demo 45 min · reacción muy positiva',t:'Hace 2 días',c:''},{txt:'Propuesta enviada · Sandra solicita reunión con CFO',t:'Ayer',c:'a'},{txt:'IA programó follow-up para mañana 9am',t:'Hoy',c:''}]},
  {id:6,company:'ConstruMax RD',sector:'Construcción',city:'Bogotá, CO',size:'250-500',contact:'Roberto Silva',role:'VP Operaciones',email:'rsilva@construmax.co',phone:'+57 300 182 9834',value:22000,source:'Web orgánico',channel:'Email',status:'cold',stage:'Frío',notes:'Sin actividad 8 días. Cambiar a WhatsApp.',avatar:'CM',color:'linear-gradient(135deg,#26C6DA,#06C8E8)',tl:[{txt:'Lead formulario web',t:'Hace 9 días',c:'g'},{txt:'Email enviado — sin apertura',t:'Hace 8 días',c:''},{txt:'Segundo email — abierto 8 días después',t:'Hace 1 día',c:'a'},{txt:'Sin respuesta · IA recomienda: cambiar a WA',t:'Hoy',c:''}]}
];

const CAMPAIGNS_INIT = [
  {name:'Reactivación B2B Q1',status:'active',channels:['WhatsApp','Email','SMS'],sent:1240,total:1500,open:'28.4%',click:'8.2%',conv:'3.1%'},
  {name:'Demo Request — Tech',status:'active',channels:['WhatsApp','Bot IA'],sent:640,total:800,open:'42.1%',click:'14.8%',conv:'6.4%'},
  {name:'Upsell WhatsApp API',status:'paused',channels:['Email','Llamada'],sent:280,total:500,open:'18%',click:'4.2%',conv:'1.8%'},
  {name:'Nurturing Leads Fríos',status:'draft',channels:['Email','WhatsApp'],sent:0,total:420,open:'—',click:'—',conv:'—'}
];

const WA_CONTACTS = [
  {name:'María R.',company:'TechCorp',avatar:'MR',color:'linear-gradient(135deg,#25D366,#128C7E)',unread:2,preview:'Sí, me interesa mucho...'},
  {name:'Carlos P.',company:'Náutica',avatar:'CP',color:'linear-gradient(135deg,#2D6BE4,#06C8E8)',unread:0,preview:'¿Cuánto cuesta el plan?'},
  {name:'Ana M.',company:'InnovaLog',avatar:'AM',color:'linear-gradient(135deg,#8B5CF6,#2D6BE4)',unread:0,preview:'Ok, agendo el jueves'},
  {name:'Sandra L.',company:'Al. Frescos',avatar:'SL',color:'linear-gradient(135deg,#EF5350,#F5A623)',unread:5,preview:'¿Tienen demo disponible?'},
  {name:'Felipe M.',company:'LogiExpress',avatar:'FM',color:'linear-gradient(135deg,#F5A623,#10D98C)',unread:0,preview:'Envíame la propuesta'}
];

const WA_CONVS = {
  0:[{t:'recv',msg:'¡Hola! Vi el anuncio de OmniCore en Google. ¿Me pueden dar más información sobre la plataforma?',time:'09:38'},{t:'bot',msg:'🤖 ¡Hola María! Soy el asistente de OmniCore. ¿Cuál es el mayor reto de tu equipo de ventas hoy?',time:'09:38'},{t:'recv',msg:'Perdemos muchos leads porque tardamos en responder. Somos 50 personas.',time:'09:40'},{t:'bot',msg:'🤖 ¡Entiendo! OmniCore responde en menos de 8 segundos, 24/7. ¿Tienes 20 min para una demo?',time:'09:41'},{t:'recv',msg:'Sí, me interesa mucho. ¿Qué planes manejan?',time:'09:42'}],
  1:[{t:'recv',msg:'Buenos días, ¿cuánto cuesta el plan para 5 usuarios?',time:'09:18'},{t:'bot',msg:'🤖 ¡Hola Carlos! El plan Growth empieza en $900 USD/mes e incluye 10 usuarios, WhatsApp API y chatbot.',time:'09:18'}],
  2:[{t:'recv',msg:'Hola, me contactaron sobre la plataforma. ¿Pueden agendar una demo?',time:'16:44'},{t:'bot',msg:'🤖 ¡Claro, Ana! Tengo disponibilidad jueves 10am o viernes 3pm. ¿Cuál te funciona?',time:'16:44'},{t:'recv',msg:'Ok, agendo para el jueves 10am.',time:'16:45'}],
  3:[{t:'recv',msg:'¿Tienen una demo disponible?',time:'Lun 14:20'},{t:'bot',msg:'🤖 ¡Hola Sandra! Sí, demos personalizadas en menos de 30 min. ¿Le queda bien esta semana?',time:'Lun 14:21'},{t:'recv',msg:'Perfecto. Somos 30 personas en el equipo.',time:'Lun 14:25'},{t:'bot',msg:'🤖 Plan Growth sería ideal. Automaticen el 80% del primer contacto. ¡Agendemos!',time:'Lun 14:26'}],
  4:[{t:'recv',msg:'Hola, estoy interesado en la propuesta que me enviaron.',time:'Lun 11:30'},{t:'bot',msg:'🤖 ¡Hola Felipe! La propuesta está pensada para LogiExpress. ¿Alguna sección que quieras profundizar?',time:'Lun 11:30'}]
};

const SYSTEM_PROMPT = `Eres el asistente virtual de OmniCore AI, plataforma SaaS omnicanal con IA para empresas B2B en LATAM. Planes: Starter $400/mes, Growth $900-1200/mes, Enterprise AI $1500-2500/mes. Responde siempre en español, de forma cálida y profesional, máximo 3-4 párrafos.`;

function buildPipeline(clients) {
  const pipeline = {'Prospecto':[],'Contactado':[],'Negociación':[],'Propuesta':[],'Cerrado ✓':[]};
  const channels = {'WhatsApp':'wa','Email':'email','Llamada':'call','Bot IA':'bot'};
  clients.forEach(c => {
    const stage = c.stage === 'Cliente activo' ? 'Cerrado ✓' : (c.stage in pipeline ? c.stage : 'Prospecto');
    pipeline[stage].push({company:c.company,contact:c.contact,value:'$'+c.value.toLocaleString(),prob:stage==='Cerrado ✓'?'✓':(Math.floor(Math.random()*40)+20)+'%',channel:channels[c.channel]||'wa',id:c.id});
  });
  pipeline['Cerrado ✓'].push(
    {company:'LogiStar SAS ✓',contact:'Plan Enterprise AI',value:'$18,000',prob:'✓',channel:'wa'},
    {company:'DataFleet Corp ✓',contact:'Plan Starter',value:'$8,400',prob:'✓',channel:'email'}
  );
  return pipeline;
}

export default function CrmPage() {
  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveView] = useState('dashboard');
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef(null);

  const [clients, setClients] = useState(CLIENTS);
  const [campaigns, setCampaigns] = useState(CAMPAIGNS_INIT);
  const [pipeline] = useState(() => buildPipeline(CLIENTS));

  const [crmFilter, setCrmFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0]);
  const [aiPanelShow, setAiPanelShow] = useState(false);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichDone, setEnrichDone] = useState(false);

  const [chatMessages, setChatMessages] = useState([{role:'assistant',text:'¡Hola! 👋 Soy el asistente de <strong>OmniCore AI</strong>. Puedo ayudarte con:<br><br>📦 Planes y precios<br>🤖 Automatización<br>💬 WhatsApp API<br>📊 CRM e integraciones<br>🎯 Google Ads y Meta Ads<br><br>¿En qué te puedo ayudar hoy?',time:'ahora'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const [selectedWA, setSelectedWA] = useState(0);
  const [waMsgs, setWaMsgs] = useState(WA_CONVS[0]);
  const [waInput, setWaInput] = useState('');
  const [waTyping, setWaTyping] = useState(false);
  const [waBotMode, setWaBotMode] = useState(true);
  const [waMsgCount, setWaMsgCount] = useState(847);
  const waBodyRef = useRef(null);

  const [agents, setAgents] = useState([
    {icon:'🎯',name:'Calificador de Leads',desc:'BANT automático · Scoring IA · Enriquecimiento · Asignación por segmento',stat:'✅ 47 leads calificados hoy',on:true,purple:true},
    {icon:'🔄',name:'Seguimiento Automático',desc:'Secuencias follow-up · Re-engagement · Cambio de canal por comportamiento',stat:'✅ 12 secuencias activas',on:true,purple:false},
    {icon:'📞',name:'Power Dialer IA',desc:'Llamadas automáticas · Transcripción post-llamada · Resumen y próximo paso',stat:'✅ 8 llamadas programadas',on:true,purple:false},
    {icon:'📄',name:'Generador Propuestas',desc:'Propuestas personalizadas por perfil CRM · Envío automático post-demo',stat:'⏸ 3 propuestas pendientes',on:false,purple:false},
    {icon:'💡',name:'Recomendador Upsell',desc:'Cross-sell y upsell inteligente por señales de uso y comportamiento',stat:'✅ 3 oportunidades detectadas',on:true,purple:false},
    {icon:'🔁',name:'Recuperador Leads',desc:'Detecta leads sin actividad +15 días y activa secuencia reactivación',stat:'⏸ 28 leads para recuperar',on:false,purple:false},
  ]);

  const [dialStr, setDialStr] = useState('');
  const [calling, setCalling] = useState(false);

  const [chartsBuilt, setChartsBuilt] = useState(false);
  const barLeadsRef = useRef(null);
  const barRevRef = useRef(null);
  const funnelRef = useRef(null);

  const [kLeads, setKLeads] = useState(0);
  const [kOpps, setKOpps] = useState(0);
  const [kSales, setKSales] = useState(0);
  const [kConv, setKConv] = useState('0%');
  const [kWA, setKWA] = useState(0);
  const [kCalls, setKCalls] = useState(0);
  const [kEmails, setKEmails] = useState('0%');
  const [kRev, setKRev] = useState('$0');
  const [sparks, setSparks] = useState({});

  const [notifVisible, setNotifVisible] = useState(true);

  // Modals
  const [modalNewClient, setModalNewClient] = useState(false);
  const [modalNewOpp, setModalNewOpp] = useState(false);
  const [modalNewWA, setModalNewWA] = useState(false);
  const [modalNewCamp, setModalNewCamp] = useState(false);
  const [clientStep, setClientStep] = useState(1);
  const [newClientForm, setNewClientForm] = useState({company:'',sector:'',city:'',size:'1-10 empleados',name:'',role:'',email:'',phone:'',value:'',source:'Google Ads',channel:'WhatsApp',urgency:'Alta (esta semana)',notes:''});

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 3200);
  }, []);

  // KPI animation on load
  useEffect(() => {
    const animate = (setter, target, pre='', suf='', dur=1100) => {
      const s = Date.now();
      const run = () => {
        const p = Math.min((Date.now()-s)/dur, 1);
        const e = 1 - Math.pow(1-p, 3);
        const val = Math.floor(e*target);
        setter(pre + val.toLocaleString() + suf);
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    };
    const t = setTimeout(() => {
      animate(setKLeads, 47);
      animate(setKOpps, 31);
      animate(setKSales, 3);
      animate(setKConv, 18, '', '%');
      animate(setKWA, 847);
      animate(setKCalls, 156);
      animate(setKEmails, 24, '', '%');
      animate(setKRev, 284, '$', 'K');
      const sparkData = {
        sp1:[22,35,28,41,38,44,47], sp2:[18,24,22,28,26,29,31], sp3:[1,2,1,3,2,2,3],
        sp4:[12,14,13,15,16,16,18], sp5:[420,560,610,720,800,820,847],
        sp6:[180,170,165,160,162,155,156], sp7:[20,22,21,23,24,24,24], sp8:[180,200,195,220,240,270,284]
      };
      setSparks(sparkData);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  // Build charts when analytics view is active
  useEffect(() => {
    if (activeView === 'analytics' && !chartsBuilt) {
      setChartsBuilt(true);
      setTimeout(() => {
        if (barLeadsRef.current) {
          const vals = [28,42,35,51,47,56,62], days = ['L','M','X','J','V','S','H'];
          const mx = Math.max(...vals);
          barLeadsRef.current.innerHTML = '';
          vals.forEach((v, i) => {
            const col = document.createElement('div'); col.className = 'bar-col';
            const f = document.createElement('div'); f.className = 'bar-fill';
            f.style.cssText = `height:4px;background:${i===vals.length-1?'linear-gradient(135deg,#2D6BE4,#06C8E8)':'rgba(45,107,228,0.38)'}`;
            f.innerHTML = `<span class="bar-lbl">${days[i]}</span>`;
            col.appendChild(f); barLeadsRef.current.appendChild(col);
            setTimeout(() => { f.style.height = Math.max(6, Math.round((v/mx)*78))+'px'; }, 100+i*75);
          });
        }
        if (barRevRef.current) {
          const vals = [180,200,195,220,252,284], months = ['O','N','D','E','F','M'];
          const mx = Math.max(...vals);
          barRevRef.current.innerHTML = '';
          vals.forEach((v, i) => {
            const col = document.createElement('div'); col.className = 'bar-col';
            const f = document.createElement('div'); f.className = 'bar-fill';
            f.style.cssText = `height:4px;background:${i===vals.length-1?'linear-gradient(180deg,#10D98C,#06C8E8)':'rgba(16,217,140,0.3)'}`;
            f.innerHTML = `<span class="bar-lbl">${months[i]}</span>`;
            col.appendChild(f); barRevRef.current.appendChild(col);
            setTimeout(() => { f.style.height = Math.max(6, Math.round((v/mx)*78))+'px'; }, 100+i*75);
          });
        }
        if (funnelRef.current) {
          const steps = [{l:'Leads nuevos',v:284,p:100,c:'rgba(45,107,228,0.42)'},{l:'Contactados',v:180,p:63,c:'rgba(45,107,228,0.55)'},{l:'Calificados',v:98,p:35,c:'rgba(6,200,232,0.5)'},{l:'Propuesta',v:42,p:15,c:'rgba(16,217,140,0.45)'},{l:'Cerrados',v:18,p:6,c:'rgba(16,217,140,0.72)'}];
          funnelRef.current.innerHTML = steps.map(s => `<div style="display:flex;align-items:center;gap:8px"><div style="font-size:10px;color:var(--text3);min-width:72px">${s.l}</div><div style="flex:1;height:20px;background:var(--glass2);border-radius:3px;overflow:hidden"><div style="height:100%;width:${s.p}%;background:${s.c};border-radius:3px;display:flex;align-items:center;padding-left:7px;font-size:11px;font-weight:700;color:#fff">${s.v}</div></div><div style="font-size:10px;color:var(--text3);min-width:26px">${s.p}%</div></div>`).join('');
        }
      }, 150);
    }
  }, [activeView, chartsBuilt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatTyping]);

  useEffect(() => {
    if (waBodyRef.current) waBodyRef.current.scrollTop = waBodyRef.current.scrollHeight;
  }, [waMsgs, waTyping]);

  const handleTabClick = (view) => {
    setActiveView(view);
    if (view === 'whatsapp') {
      setWaMsgs(WA_CONVS[selectedWA] || []);
    }
  };

  const selectWAContact = (i) => {
    setSelectedWA(i);
    setWaMsgs(WA_CONVS[i] || []);
    setWaBotMode(true);
  };

  const sendWA = () => {
    if (!waInput.trim()) return;
    const now = new Date();
    const time = now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
    const newMsg = {t:'sent',msg:waInput,time:time+' ✓✓'};
    setWaMsgs(prev => [...prev, newMsg]);
    setWaInput('');
    setWaMsgCount(c => c+1);
    if (waBotMode) {
      setWaTyping(true);
      setTimeout(() => {
        setWaTyping(false);
        const replies = ['🤖 Recibido! Procesando tu mensaje con IA...','🤖 ¡Gracias! Un momento para darte la mejor respuesta.','🤖 Entendido. Voy a revisar esa información para ti.'];
        setWaMsgs(prev => [...prev, {t:'bot',msg:replies[Math.floor(Math.random()*replies.length)],time}]);
      }, 1400);
    }
  };

  const toggleBot = () => {
    const next = !waBotMode;
    setWaBotMode(next);
    showToast(next ? '🤖 Bot IA reactivado' : '👤 Control tomado — Bot pausado para este chat');
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    const now = new Date();
    const time = now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
    setChatMessages(prev => [...prev, {role:'user',text:msg,time}]);
    const newHistory = [...chatHistory, {role:'user',content:msg}];
    setChatHistory(newHistory);
    setChatTyping(true);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,system:SYSTEM_PROMPT,messages:newHistory})
      });
      const data = await resp.json();
      setChatTyping(false);
      const reply = data?.content?.[0]?.text || 'Disculpa, ocurrió un error.';
      setChatHistory(prev => [...prev, {role:'assistant',content:reply}]);
      setChatMessages(prev => [...prev, {role:'assistant',text:reply.replace(/\n/g,'<br>'),time}]);
    } catch {
      setChatTyping(false);
      setChatMessages(prev => [...prev, {role:'assistant',text:'Disculpa, hubo un problema de conexión.',time}]);
    }
  };

  const quickChat = (msg) => { setChatInput(msg); };
  useEffect(() => { if (chatInput) { /* fire send */ } }, []);

  const enrichCRM = () => {
    setEnrichLoading(true);
    setEnrichDone(false);
    showToast('✦ IA analizando empresa y señales de compra...');
    setTimeout(() => { setEnrichLoading(false); setEnrichDone(true); }, 1800);
  };

  const toggleAgent = (i) => {
    setAgents(prev => {
      const next = [...prev];
      next[i] = {...next[i], on: !next[i].on};
      showToast((next[i].on ? '✅ Agente ' : '⏸ Agente ') + next[i].name + (next[i].on ? ' activado' : ' pausado'));
      return next;
    });
  };

  const dialPress = (k) => setDialStr(prev => prev.length >= 14 ? prev : prev + k);

  const makeCall = () => {
    if (!dialStr) { showToast('⚠️ Ingresa un número primero'); return; }
    setCalling(true);
    showToast('📞 Marcando '+dialStr+' vía VoIP Asterisk...');
  };

  const endCall = () => {
    setCalling(false);
    setDialStr('');
    showToast('📵 Llamada finalizada · Resumen IA generado automáticamente');
  };

  const saveNewClient = () => {
    const nc = {
      id: clients.length+1,
      company: newClientForm.company || 'Nueva Empresa',
      sector: newClientForm.sector || 'Otro',
      city: newClientForm.city || '',
      size: newClientForm.size,
      contact: newClientForm.name || 'Contacto',
      role: newClientForm.role || '',
      email: newClientForm.email || '',
      phone: newClientForm.phone || '',
      value: parseInt(newClientForm.value)||0,
      source: newClientForm.source,
      channel: newClientForm.channel,
      status: 'new',
      stage: 'Prospecto',
      notes: newClientForm.notes,
      avatar: (newClientForm.company||'N').substring(0,2).toUpperCase(),
      color: 'linear-gradient(135deg,#2D6BE4,#8B5CF6)',
      tl: [{txt:'Lead creado manualmente en CRM',t:'Ahora',c:'g'}]
    };
    setClients(prev => [nc, ...prev]);
    setModalNewClient(false);
    setClientStep(1);
    showToast('✅ Cliente guardado en CRM con éxito');
  };

  const activateCamp = (i) => {
    setCampaigns(prev => {
      const next = [...prev];
      next[i] = {...next[i], status:'active', sent: Math.floor(next[i].total*0.05)};
      showToast('🚀 Campaña activada — enviando a '+next[i].total+' contactos');
      return next;
    });
  };

  const filteredClients = clients.filter(c =>
    !crmFilter || c.company.toLowerCase().includes(crmFilter.toLowerCase()) || c.contact.toLowerCase().includes(crmFilter.toLowerCase())
  );

  const tagClass = {wa:'ptag-wa',email:'ptag-email',call:'ptag-call',bot:'ptag-bot'};
  const tagLbl = {wa:'WhatsApp',email:'Email',call:'Llamada',bot:'Bot IA'};
  const stageColors = {'Prospecto':'var(--text3)','Contactado':'#60A5FA','Negociación':'var(--amber)','Propuesta':'var(--purple)','Cerrado ✓':'var(--green)'};

  const Spark = ({ vals }) => {
    if (!vals) return null;
    const mx = Math.max(...vals);
    return (
      <div className="kcard-spark">
        {vals.map((v, i) => <div key={i} className={`sbar${i===vals.length-1?' hi':''}`} style={{height: Math.max(3, Math.round((v/mx)*20))+'px'}} />)}
      </div>
    );
  };

  return (
    <div className="crm-root" data-theme={theme}>
      {/* Toast */}
      <div className={`toast${toastShow?' show':''}`}>{toastMsg}</div>

      {/* Topbar */}
      <div className="topbar">
        <div className="logo">
          <div className="logo-dot">O</div>
          <span className="logo-txt">OmniCore</span>&nbsp;AI
        </div>
        <div className="nav-tabs">
          {[['dashboard','⚡ Dashboard'],['pipeline','🏆 Pipeline'],['crm','🏢 CRM'],['chatbot','🤖 Chatbot IA'],['whatsapp','💬 WhatsApp'],['campaigns','📡 Campañas'],['ads','🎯 Ads'],['agents','🦾 Agentes'],['voip','📞 VoIP'],['analytics','📊 Analítica'],['pricing','💎 Planes']].map(([v,l]) => (
            <button key={v} className={`ntab${activeView===v?' active':''}`} onClick={() => handleTabClick(v)}>{l}</button>
          ))}
        </div>
        <div className="topbar-right">
          <div style={{display:'flex',alignItems:'center',gap:'7px',cursor:'pointer',userSelect:'none'}} onClick={() => { const t=theme==='dark'?'light':'dark'; setTheme(t); showToast(t==='light'?'☀️ Modo claro':'🌙 Modo oscuro'); }}>
            <span style={{fontSize:'13px'}}>☀️</span>
            <div style={{width:'42px',height:'24px',background:'var(--glass2)',border:'1.5px solid var(--border2)',borderRadius:'12px',position:'relative',transition:'background .3s',flexShrink:0}}>
              <div style={{position:'absolute',top:'3px',left:theme==='light'?'21px':'3px',width:'16px',height:'16px',borderRadius:'50%',background:theme==='light'?'#F59E0B':'#8B5CF6',transition:'all .3s',boxShadow:'0 1px 4px var(--shadow)'}} />
            </div>
            <span style={{fontSize:'13px'}}>🌙</span>
          </div>
          <div className="live-badge"><span className="ldot" /><span>Live</span></div>
          <button className="ai-top-btn" onClick={() => { setAiPanelShow(true); showToast('✦ Analizando datos en tiempo real...'); }}>✦ IA</button>
        </div>
      </div>

      {/* ─── DASHBOARD ─── */}
      <div className={`view${activeView==='dashboard'?' active':''}`} id="v-dashboard">
        <div className="sec">
          {notifVisible && (
            <div className="notif-bar" onClick={() => { setNotifVisible(false); showToast('🔕 Descartado'); }}>
              <div style={{fontSize:'15px'}}>🔔</div>
              <div className="notif-text"><strong>Nuevo lead calificado:</strong> TechCorp Colombia · Google Ads · $24,000 USD → Agente IA activado</div>
              <div style={{fontSize:'11px',color:'var(--text3)',padding:'2px 7px',borderRadius:'5px',background:'var(--glass2)',flexShrink:0}}>✕</div>
            </div>
          )}
          <div className="sec-hd">
            <div className="sec-title">⚡ Dashboard Ejecutivo <span className="st-sub">· Hoy · Tiempo real</span></div>
            <div style={{display:'flex',gap:'7px'}}>
              <button className="ai-btn" onClick={() => { setAiPanelShow(true); showToast('✦ Analizando datos...'); }}><span style={{animation:'aiPulse 2s infinite',display:'inline-block'}}>✦</span> Analizar con IA</button>
              <button className="btn btn-primary btn-sm" onClick={() => setModalNewClient(true)}>+ Nuevo Cliente</button>
            </div>
          </div>
          <div className="kpi-grid">
            {[['kLeads',kLeads,'Leads Nuevos','▲ 12.4% vs ayer','up'],['kOpps',kOpps,'Oportunidades','▲ 8.2% semana','up'],['kSales',kSales,'Cierres del día','▲ 24% este mes','up'],['kConv',kConv,'Conversión','▲ 3.1pp mes','up'],['kWA',kWA,'WhatsApp','▲ 31% semana','up'],['kCalls',kCalls,'Llamadas','▼ 4% vs ayer','dn'],['kEmails',kEmails,'Email apertura','▲ 2.4pp','up'],['kRev',kRev,'Ingresos mes','▲ 18.7%','up']].map(([id,val,lbl,delta,dir],i) => (
              <div key={id} className="kcard" onClick={() => showToast(`📊 ${lbl}: ${val}`)}>
                <div className="kcard-lbl">{lbl}</div>
                <div className="kcard-val">{val}</div>
                <div className={`kcard-delta delta-${dir}`}>{delta}</div>
                <Spark vals={sparks[`sp${i+1}`]} />
              </div>
            ))}
          </div>

          {aiPanelShow && (
            <div className="ai-result-panel show">
              <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'11px'}}>
                <span style={{fontSize:'15px'}}>✦</span>
                <div style={{fontFamily:'var(--font)',fontSize:'13px',fontWeight:'800',color:'var(--text)',flex:1}}>OmniCore Intelligence · Análisis en tiempo real</div>
              </div>
              <div className="ai-block">
                <div className="ai-block-title">✦ Oportunidades críticas detectadas</div>
                <div className="ai-insight">TechCorp Colombia score 92/100. Contactar en las próximas 2h.</div>
                <div className="ai-insight">Distribuidora Sur: 8 días sin actividad. Secuencia reactivación WA recomendada.</div>
                <div className="ai-insight">Google Ads CPL $8.45 vs benchmark $28. Escalar presupuesto 40% esta semana.</div>
              </div>
              <div className="ai-block">
                <div className="ai-block-title">📈 Scoring predictivo — Leads prioritarios</div>
                {[['TechCorp CO',92,'var(--green)'],['Al. Frescos',81,'#60A5FA'],['InnovaLogística',68,'var(--amber)']].map(([n,s,c]) => (
                  <div key={n} className="ai-score-row">
                    <span className="score-lbl">{n}</span>
                    <div className="score-bar-bg"><div className="score-bar-fill" style={{width:s+'%',background:'linear-gradient(90deg,var(--green),var(--cyan))'}} /></div>
                    <span className="score-num" style={{color:c}}>{s}</span>
                  </div>
                ))}
              </div>
              <div className="ai-rec">✦ <strong>Upsell:</strong> 3 clientes con email tienen perfil para WhatsApp API. Potencial: <strong>+$8,400 USD/mes</strong>.</div>
              <div style={{display:'flex',gap:'7px',marginTop:'7px'}}>
                <button onClick={() => { showToast('🎯 Recomendaciones aplicadas.'); setAiPanelShow(false); }} className="btn btn-primary" style={{flex:1,justifyContent:'center',fontSize:'12px'}}>Aplicar todo</button>
                <button onClick={() => setAiPanelShow(false)} className="btn btn-secondary" style={{flex:1,justifyContent:'center',fontSize:'12px'}}>Cerrar</button>
              </div>
            </div>
          )}

          <div className="sec-title" style={{marginTop:'18px',marginBottom:'10px'}}>🔄 Journey del Cliente</div>
          <div className="journey-scroll">
            <div className="journey">
              {[['done','🎯','Captación','✅ 47 leads hoy'],['done','📥','Lead IA','✅ Calificado por IA en <8 seg'],['done','✦','Enriquece','✅ Enriquecimiento automático'],['active','💬','Contacto','⚡ 12 contactos activos'],['','📊','Oportunidad','31 oportunidades · $284K'],['','📝','Propuesta','Propuesta IA en 3 min'],['','🏆','Cierre','3 cierres hoy'],['','🚀','Onboarding','8 clientes activos'],['','💰','Expansión','3 upsell detectadas']].map(([cls,ico,lbl,tip]) => (
                <div key={lbl} className={`jstep${cls?' '+cls:''}`} onClick={() => showToast(tip)}>
                  <div className="jstep-ico">{ico}</div>
                  <div className="jstep-lbl">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── PIPELINE ─── */}
      <div className={`view${activeView==='pipeline'?' active':''}`} id="v-pipeline">
        <div className="sec">
          <div className="sec-hd">
            <div className="sec-title">🏆 Pipeline Comercial <span className="st-sub">31 oportunidades · $284,000</span></div>
            <div style={{display:'flex',gap:'7px'}}>
              <button className="ai-btn btn-sm" onClick={() => showToast('✦ IA: LogiExpress 82% · Alimentos 65% · FinanzasCorp 70% — priorizar HOY')}><span>✦</span> IA</button>
              <button className="btn btn-primary btn-sm" onClick={() => setModalNewOpp(true)}>+ Oportunidad</button>
            </div>
          </div>
          <div className="pipeline-wrap">
            {Object.entries(pipeline).map(([stage, cards]) => {
              const totalVal = cards.reduce((s,c) => { const n=parseInt((c.value||'0').replace(/\D/g,'')); return s+(isNaN(n)?0:n); }, 0);
              return (
                <div key={stage} className="pipe-col">
                  <div className="pipe-col-head">
                    <div className="pipe-col-title" style={{color:stageColors[stage]}}>{stage} <span className="pipe-col-count">{cards.length}</span></div>
                    <div className="pipe-col-val">${totalVal.toLocaleString()} USD</div>
                  </div>
                  {cards.map((c,i) => (
                    <div key={i} className={`pcard${stage==='Cerrado ✓'?' highlight':''}`} onClick={() => showToast(`📋 ${c.company} · ${c.value} · ${stage}`)}>
                      <div className="pc-company">{c.company}</div>
                      <div className="pc-contact">{c.contact}</div>
                      <div className="pc-foot"><span className="pc-val">{c.value}</span><span className="pc-prob">{c.prob}</span></div>
                      <span className={`ptag ${tagClass[c.channel]||'ptag-wa'}`}>{tagLbl[c.channel]||'WA'}</span>
                    </div>
                  ))}
                  {stage !== 'Cerrado ✓' && <button className="btn btn-secondary" style={{width:'100%',justifyContent:'center',fontSize:'11px',marginTop:'6px'}} onClick={() => setModalNewOpp(true)}>+ Agregar</button>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── CRM ─── */}
      <div className={`view${activeView==='crm'?' active':''}`} id="v-crm">
        <div className="sec">
          <div className="sec-hd">
            <div className="sec-title">🏢 CRM — Empresas &amp; Contactos <span className="st-sub">{filteredClients.length} registros</span></div>
            <div style={{display:'flex',gap:'7px'}}>
              <button className="ai-btn btn-sm" onClick={enrichCRM}><span>✦</span> Enriquecer IA</button>
              <button className="btn btn-primary btn-sm" onClick={() => setModalNewClient(true)}>+ Nuevo Cliente</button>
            </div>
          </div>
          <div className="crm-wrap">
            <div className="crm-list">
              <div className="crm-search-row">
                <span style={{color:'var(--text3)'}}>🔍</span>
                <input type="text" placeholder="Buscar..." value={crmFilter} onChange={e => { setCrmFilter(e.target.value); if(filteredClients.length>0) setSelectedClient(filteredClients[0]); }} />
              </div>
              <div>
                {filteredClients.map((c,i) => (
                  <div key={c.id} className={`crm-row${selectedClient?.id===c.id?' active':''}`} onClick={() => { setSelectedClient(c); setEnrichDone(false); }}>
                    <div className="crm-av" style={{background:c.color}}>{c.avatar}</div>
                    <div style={{flex:1,minWidth:0}}><div className="crm-rname">{c.company}</div><div className="crm-rsub">{c.sector}</div></div>
                    <div className={`cr-status s-${c.status}`}>{c.status.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="crm-detail">
              {selectedClient ? (
                <>
                  <div className="crm-det-hd">
                    <div className="crm-det-av" style={{background:selectedClient.color}}>{selectedClient.avatar}</div>
                    <div>
                      <div className="crm-det-name">{selectedClient.company}</div>
                      <div className="crm-det-sub">{selectedClient.city} · {selectedClient.sector} · {selectedClient.size} emp.</div>
                      <div className="crm-det-tags">
                        <span className="dtag" style={{background:'rgba(239,69,69,0.13)',color:'var(--red)'}}>{selectedClient.status==='hot'?'🔥 HOT Lead':selectedClient.status==='client'?'Cliente activo':selectedClient.status.toUpperCase()}</span>
                        <span className="dtag tag-b2b">B2B</span>
                        <span className="dtag tag-ga">{selectedClient.source}</span>
                        <span className="dtag tag-ai">Score IA: {Math.floor(Math.random()*20)+72}</span>
                      </div>
                    </div>
                    <div style={{marginLeft:'auto',display:'flex',gap:'6px'}}>
                      <button className="btn btn-secondary btn-sm" onClick={() => showToast(`💬 WhatsApp iniciado con ${selectedClient.contact}`)}>💬 WA</button>
                      <button className="btn btn-primary btn-sm" onClick={() => setModalNewOpp(true)}>+ Oportunidad</button>
                    </div>
                  </div>
                  <div className="crm-fields">
                    {[['Contacto',selectedClient.contact],['Cargo',selectedClient.role],['Valor opp.','$'+selectedClient.value.toLocaleString()],['Email',selectedClient.email],['Canal',selectedClient.channel],['Etapa',selectedClient.stage]].map(([lbl,val]) => (
                      <div key={lbl} className="crm-field">
                        <div className="cf-lbl">{lbl}</div>
                        <div className="cf-val" style={lbl==='Valor opp.'?{color:'var(--green)'}:{}}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {enrichLoading && (
                    <div className="ai-result-panel show" style={{marginBottom:'12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'6px'}}><span>✦</span><span style={{fontSize:'12px',fontWeight:'800',color:'var(--text)'}}>Enriqueciendo con IA...</span><span className="ai-spin" style={{color:'var(--purple)'}}>⟳</span></div>
                    </div>
                  )}
                  {enrichDone && (
                    <div className="ai-result-panel show" style={{marginBottom:'12px'}}>
                      <div className="ai-block"><div className="ai-block-title">🏢 Perfil verificado</div>
                        <div className="ai-insight">Empresa real · LinkedIn verificado · Crecimiento 22% YoY confirmado</div>
                        <div className="ai-insight">Stack tech: HubSpot + Slack + G-Suite → perfil digital alto</div>
                        <div className="ai-insight">Competidores adoptaron automatización → urgencia elevada</div>
                      </div>
                      <div className="ai-rec">✦ <strong>Gap detectado:</strong> Sin WhatsApp API ni agentes IA. Potencial: <strong>$24K–$36K USD/año</strong>.</div>
                      <button onClick={() => setEnrichDone(false)} className="btn btn-secondary" style={{fontSize:'11px',width:'100%',justifyContent:'center',marginTop:'6px'}}>Cerrar</button>
                    </div>
                  )}
                  <div style={{fontSize:'10px',fontWeight:'800',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'8px'}}>Historial de actividad</div>
                  <div className="timeline">
                    {selectedClient.tl.map((t,i) => (
                      <div key={i} className={`tl-item${t.c?' '+t.c:''}`}>
                        <div className="tl-dot" />
                        <div className="tl-text">{t.txt}</div>
                        <div className="tl-time">{t.t}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state"><div className="es-icon">🏢</div><div className="es-text">Selecciona una empresa de la lista</div></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── CHATBOT ─── */}
      <div className={`view${activeView==='chatbot'?' active':''}`} id="v-chatbot">
        <div className="sec">
          <div className="sec-hd">
            <div className="sec-title">🤖 Chatbot IA — Demo en Vivo <span className="st-sub">· Powered by Claude</span></div>
            <div style={{display:'flex',gap:'7px',alignItems:'center'}}>
              <div style={{background:'rgba(16,217,140,0.12)',border:'1px solid rgba(16,217,140,0.25)',color:'var(--green)',fontSize:'11px',fontWeight:'700',padding:'4px 10px',borderRadius:'20px',display:'flex',alignItems:'center',gap:'5px'}}><span className="ldot" /> IA Activa</div>
              <button className="btn btn-secondary btn-sm" onClick={() => { setChatMessages([{role:'assistant',text:'¡Chat reiniciado! 👋 ¿En qué te puedo ayudar?',time:'ahora'}]); setChatHistory([]); showToast('🗑 Chat limpiado'); }}>🗑 Limpiar</button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'11px'}}>
            <div className="card" style={{display:'flex',flexDirection:'column'}}>
              <div style={{padding:'10px 13px',borderBottom:'1px solid var(--border)',background:'var(--bg3)',borderRadius:'var(--r) var(--r) 0 0',display:'flex',alignItems:'center',gap:'9px'}}>
                <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'linear-gradient(135deg,#8B5CF6,#2D6BE4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'900',color:'#fff',flexShrink:0}}>✦</div>
                <div>
                  <div style={{fontSize:'13px',fontWeight:'800',color:'var(--text)'}}>Asistente OmniCore AI</div>
                  <div style={{fontSize:'10px',color:'var(--green)',display:'flex',alignItems:'center',gap:'4px'}}><span className="ldot" /> Disponible 24/7</div>
                </div>
                <div style={{marginLeft:'auto',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.25)',color:'var(--purple)',fontSize:'10px',fontWeight:'700',padding:'3px 9px',borderRadius:'20px'}}>🤖 Claude AI</div>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'13px',minHeight:'320px',maxHeight:'380px',display:'flex',flexDirection:'column',gap:'8px',background:'var(--bg)'}}>
                {chatMessages.map((m,i) => (
                  <div key={i} style={m.role==='user'?{alignSelf:'flex-end',maxWidth:'78%',background:'var(--blue)',color:'#fff',padding:'8px 12px',borderRadius:'10px 10px 0 10px',fontSize:'13px',lineHeight:'1.5'}:{alignSelf:'flex-start',maxWidth:'82%',background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text)',padding:'10px 13px',borderRadius:'0 10px 10px 10px',fontSize:'13px',lineHeight:'1.55'}}>
                    <span dangerouslySetInnerHTML={{__html:m.text}} />
                    <div style={{fontSize:'10px',color:m.role==='user'?'rgba(255,255,255,0.6)':'var(--text3)',marginTop:'4px',float:'right',clear:'both'}}>{m.time}</div>
                  </div>
                ))}
                {chatTyping && (
                  <div className="wa-typing show" style={{background:'var(--bg3)',borderColor:'var(--border)'}}>
                    <div className="typing-d" style={{background:'var(--purple)'}} />
                    <div className="typing-d" style={{background:'var(--purple)'}} />
                    <div className="typing-d" style={{background:'var(--purple)'}} />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={{display:'flex',gap:'7px',padding:'9px',borderTop:'1px solid var(--border)',background:'var(--bg3)'}}>
                <input className="form-input" type="text" placeholder="Escribe tu pregunta sobre OmniCore..." style={{flex:1,fontSize:'13px'}} value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendChat();}} />
                <button className="btn btn-primary" style={{padding:'8px 14px'}} onClick={sendChat}>➤ Enviar</button>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'9px'}}>
              <div className="card card-p">
                <div style={{fontSize:'11px',fontWeight:'800',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'9px'}}>Preguntas rápidas</div>
                {['¿Cuánto cuesta el plan Growth?','¿Cómo funciona el chatbot con WhatsApp?','¿Qué es un agente IA autónomo?','¿Qué integraciones tienen disponibles?','¿Cuánto tiempo toma la implementación?','¿Tienen servicio para empresas pequeñas?','¿El plan Enterprise incluye VoIP?'].map((q,i) => (
                  <button key={i} className="btn btn-secondary" style={{width:'100%',justifyContent:'flex-start',marginBottom:'6px',fontSize:'11px',textAlign:'left'}} onClick={() => { setChatInput(q); setTimeout(sendChat, 50); }}>{q}</button>
                ))}
              </div>
              <div className="card card-p">
                <div style={{fontSize:'11px',fontWeight:'800',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'8px'}}>Simular escenario</div>
                <button className="btn btn-purple" style={{width:'100%',justifyContent:'center',marginBottom:'6px',fontSize:'11px'}} onClick={() => { setChatInput('Hola, vi su anuncio en Google y me interesa conocer más. Somos una empresa de distribución con 80 empleados en Bogotá.'); setTimeout(sendChat,50); }}>🎯 Simular lead entrante</button>
                <button className="btn" style={{width:'100%',justifyContent:'center',background:'rgba(16,217,140,0.12)',color:'var(--green)',border:'1px solid rgba(16,217,140,0.25)',fontSize:'11px'}} onClick={() => { setChatInput('Necesito una cotización. Tenemos un equipo de ventas de 15 personas y perdemos muchos leads.'); setTimeout(sendChat,50); }}>📋 Simular cotización</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── WHATSAPP ─── */}
      <div className={`view${activeView==='whatsapp'?' active':''}`} id="v-whatsapp">
        <div className="sec">
          <div className="sec-hd">
            <div className="sec-title">💬 WhatsApp Business API <span className="st-sub">Multiagente · Bot IA activo · 24 chats</span></div>
            <button className="btn btn-primary btn-sm" onClick={() => setModalNewWA(true)}>+ Nueva conversación</button>
          </div>
          <div className="wa-wrap">
            <div className="wa-sidebar">
              <div className="wa-sidebar-hd">Chats activos <button className="btn btn-secondary btn-sm" onClick={() => showToast('📊 Métricas WA exportadas')} style={{fontSize:'9px',padding:'2px 7px'}}>Stats</button></div>
              {WA_CONTACTS.map((c,i) => (
                <div key={i} className={`wa-contact${selectedWA===i?' active':''}`} onClick={() => selectWAContact(i)}>
                  <div className="wc-av" style={{background:c.color}}>{c.avatar}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="wc-name">{c.name}</div>
                    <div className="wc-preview">{c.preview}</div>
                  </div>
                  {c.unread > 0 ? <div className="wc-unread">{c.unread}</div> : <div style={{fontSize:'9px',color:'var(--text3)'}}>hoy</div>}
                </div>
              ))}
            </div>
            <div className="wa-main">
              <div className="wa-chat-hd">
                <div className="wa-chat-av" style={{background:WA_CONTACTS[selectedWA].color}}>{WA_CONTACTS[selectedWA].avatar}</div>
                <div>
                  <div className="wa-chat-name">{WA_CONTACTS[selectedWA].name} — {WA_CONTACTS[selectedWA].company}</div>
                  <div className="wa-chat-status"><span className="ldot" /> En línea · Bot IA atendiendo</div>
                </div>
                <div className="wa-chat-actions">
                  <div className="wa-bot-badge" style={waBotMode?{background:'rgba(139,92,246,0.12)',color:'var(--purple)'}:{background:'rgba(16,217,140,0.12)',color:'var(--green)'}} onClick={toggleBot}>
                    {waBotMode ? '🤖 Bot IA activo' : '👤 Agente: Tú'}
                  </div>
                  <button className="wa-act" onClick={toggleBot}>👤 Tomar control</button>
                  <button className="wa-act" onClick={() => showToast('🏢 Perfil CRM abierto')}>🏢 CRM</button>
                  <button className="wa-act" onClick={() => showToast('📝 Nota interna guardada')}>📝 Nota</button>
                </div>
              </div>
              <div className="wa-body" ref={waBodyRef}>
                {waMsgs.map((m,i) => (
                  <div key={i} className={`wa-msg ${m.t}`}>{m.msg}<span className="wa-msg-time">{m.time}</span></div>
                ))}
                {waTyping && (
                  <div className="wa-typing show">
                    <div className="typing-d" /><div className="typing-d" /><div className="typing-d" />
                  </div>
                )}
              </div>
              <div className="wa-input-row">
                <input className="wa-input" type="text" placeholder="Escribe un mensaje como agente humano..." value={waInput} onChange={e=>setWaInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendWA();}} />
                <button className="wa-send" onClick={sendWA}>➤</button>
              </div>
            </div>
          </div>
          <div className="wa-metrics">
            <div className="wm"><div className="wm-val" style={{color:'var(--green)'}}>94%</div><div className="wm-lbl">Tasa lectura</div></div>
            <div className="wm"><div className="wm-val" style={{color:'#60A5FA'}}>{waMsgCount}</div><div className="wm-lbl">Mensajes hoy</div></div>
            <div className="wm"><div className="wm-val" style={{color:'var(--amber)'}}>38%</div><div className="wm-lbl">Tasa respuesta</div></div>
            <div className="wm"><div className="wm-val" style={{color:'var(--cyan)'}}>$0.04</div><div className="wm-lbl">Costo/msg</div></div>
          </div>
        </div>
      </div>

      {/* ─── CAMPAIGNS ─── */}
      <div className={`view${activeView==='campaigns'?' active':''}`} id="v-campaigns">
        <div className="sec">
          <div className="sec-hd">
            <div className="sec-title">📡 Campañas Omnicanal</div>
            <button className="btn btn-primary btn-sm" onClick={() => setModalNewCamp(true)}>+ Nueva campaña</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'11px'}}>
            {campaigns.map((c,i) => {
              const pct = c.total>0 ? Math.round((c.sent/c.total)*100) : 0;
              const chColors = {'WhatsApp':'background:rgba(37,211,102,0.13);color:#25D366','Email':'background:rgba(45,107,228,0.13);color:#60A5FA','SMS':'background:rgba(245,166,35,0.13);color:var(--amber)','Bot IA':'background:rgba(139,92,246,0.13);color:var(--purple)','Llamada':'background:rgba(239,69,69,0.13);color:var(--red)'};
              return (
                <div key={i} className="card card-p">
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                    <div style={{fontSize:'13px',fontWeight:'800',color:'var(--text)'}}>{c.name}</div>
                    {c.status==='active' && <span style={{background:'rgba(16,217,140,0.13)',color:'var(--green)',fontSize:'10px',fontWeight:'700',padding:'3px 9px',borderRadius:'20px'}}>● Activa</span>}
                    {c.status==='paused' && <span style={{background:'rgba(245,166,35,0.13)',color:'var(--amber)',fontSize:'10px',fontWeight:'700',padding:'3px 9px',borderRadius:'20px'}}>⏸ Pausada</span>}
                    {c.status==='draft' && <span style={{background:'rgba(90,112,144,0.13)',color:'var(--text3)',fontSize:'10px',fontWeight:'700',padding:'3px 9px',borderRadius:'20px'}}>○ Borrador</span>}
                  </div>
                  <div style={{display:'flex',gap:'5px',marginBottom:'10px',flexWrap:'wrap'}}>
                    {c.channels.map(ch => <span key={ch} style={{fontSize:'10px',fontWeight:'700',padding:'3px 8px',borderRadius:'20px',...Object.fromEntries((chColors[ch]||'').split(';').filter(Boolean).map(p=>p.split(':').map(s=>s.trim())))}}>{ch}</span>)}
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-lbl"><span>Enviados {c.sent.toLocaleString()}/{c.total.toLocaleString()}</span><span>{pct}%</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:pct+'%',background:'linear-gradient(135deg,#2D6BE4,#06C8E8)'}} /></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'7px',marginTop:'8px'}}>
                    {[['var(--green)',c.open,'Apertura'],['#60A5FA',c.click,'Clic'],['var(--amber)',c.conv,'Conversión']].map(([color,val,lbl]) => (
                      <div key={lbl} style={{background:'var(--bg3)',borderRadius:'var(--rsm)',padding:'7px',textAlign:'center'}}>
                        <div style={{fontFamily:'var(--font)',fontSize:'15px',fontWeight:'900',color}}>{val}</div>
                        <div style={{fontSize:'9px',color:'var(--text3)'}}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                  {c.status==='paused' && <button className="btn btn-success" style={{width:'100%',justifyContent:'center',marginTop:'9px'}} onClick={() => activateCamp(i)}>▶ Reactivar</button>}
                  {c.status==='draft' && <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:'9px'}} onClick={() => activateCamp(i)}>🚀 Activar ahora</button>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── ADS ─── */}
      <div className={`view${activeView==='ads'?' active':''}`} id="v-ads">
        <div className="sec">
          <div className="sec-title">🎯 Captación — Google Ads &amp; Meta Ads <span className="st-sub">Leads entrando en tiempo real</span></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'11px'}}>
            {[{label:'Google Ads — B2B Colombia',budget:'$2,400/mes',leads:'284',cpl:'$8.45',roas:'4.8x',bars:[{w:100,c:'rgba(45,107,228,0.4)',t:'4,800 Impresiones'},{w:85,c:'rgba(45,107,228,0.52)',t:'154 Clics (3.2%)'},{w:62,c:'rgba(45,107,228,0.65)',t:'284 Leads → CRM'},{w:42,c:'rgba(16,217,140,0.5)',t:'42 Oportunidades'},{w:22,c:'rgba(16,217,140,0.72)',t:'12 Cierres'}],icon:'G',iconColor:'#4285F4',iconBg:'rgba(66,133,244,0.14)',iconBorder:'rgba(66,133,244,0.28)',toast:['4,800 impresiones','154 clics · CTR 3.2%','284 leads en CRM','42 oportunidades calificadas','12 cierres confirmados']},{label:'Meta Ads — Lead Gen LATAM',budget:'$1,800/mes',leads:'421',cpl:'$4.28',roas:'3.1x',bars:[{w:100,c:'rgba(24,119,242,0.4)',t:'15,000 Alcance'},{w:80,c:'rgba(24,119,242,0.52)',t:'420 Clics (2.8%)'},{w:58,c:'rgba(24,119,242,0.65)',t:'421 Leads → CRM'},{w:38,c:'rgba(16,217,140,0.5)',t:'56 Oportunidades'},{w:18,c:'rgba(16,217,140,0.72)',t:'15 Cierres'}],icon:'f',iconColor:'#1877F2',iconBg:'rgba(24,119,242,0.14)',iconBorder:'rgba(24,119,242,0.28)',toast:['15,000 alcanzadas','420 clics','421 leads en CRM','56 oportunidades activas','15 cierres este mes']}].map((ad,ai) => (
              <div key={ai} className="card card-p">
                <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'12px'}}>
                  <div style={{width:'30px',height:'30px',borderRadius:'8px',background:ad.iconBg,border:'1px solid '+ad.iconBorder,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'800',color:ad.iconColor,flexShrink:0}}>{ad.icon}</div>
                  <div><div style={{fontSize:'13px',fontWeight:'800',color:'var(--text)'}}>{ad.label}</div><div style={{fontSize:'11px',color:'var(--text3)'}}>{ad.budget} · <span style={{color:'var(--green)'}}>● Activa</span></div></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'7px',marginBottom:'11px'}}>
                  {[['#60A5FA',ad.leads,'Leads'],['var(--green)',ad.cpl,'CPL'],['var(--amber)',ad.roas,'ROAS']].map(([c,v,l]) => (
                    <div key={l} className="card card-p" style={{textAlign:'center',padding:'8px'}}><div style={{fontFamily:'var(--font)',fontSize:'15px',fontWeight:'900',color:c}}>{v}</div><div style={{fontSize:'9px',color:'var(--text3)'}}>{l}</div></div>
                  ))}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
                  {ad.bars.map((b,bi) => (
                    <div key={bi} style={{height:'26px',borderRadius:'5px',display:'flex',alignItems:'center',padding:'0 9px',fontSize:'11px',fontWeight:'700',color:'#fff',background:b.c,width:b.w+'%',cursor:'default'}} onClick={() => showToast(ad.toast[bi])}>{b.t}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flow-row">
            <div style={{fontSize:'12px',fontWeight:'800',color:'var(--green)',width:'100%',marginBottom:'6px'}}>⚡ Flujo automático — Lead a Cierre en tiempo real</div>
            {[['1. Lead entra en Ads',''],['2. CRM automático',''],['3. IA califica BANT','rgba(139,92,246,0.3)'],['4. WhatsApp auto','rgba(37,211,102,0.3)'],['5. Seguimiento IA',''],['6. 💰 Cierre','rgba(16,217,140,0.35)']].map(([txt,bc],i,arr) => (
              <span key={i}><div className="fl-step" style={bc?{borderColor:bc,color:bc.includes('92,246')?'var(--purple)':bc.includes('211,102')?'var(--wa)':'var(--green)',fontWeight:'800'}:{}}>{txt}</div>{i<arr.length-1&&<div className="fl-arr">→</div>}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── AGENTS ─── */}
      <div className={`view${activeView==='agents'?' active':''}`} id="v-agents">
        <div className="sec">
          <div className="sec-title">🦾 Agentes IA Autónomos <span className="st-sub">4 activos en este momento</span></div>
          <div className="agents-grid">
            {agents.map((a,i) => (
              <div key={i} className={`agent-card${a.on?' on':''}${a.purple?' purple-glow':''}`} onClick={() => toggleAgent(i)}>
                <div className="ag-icon">{a.icon}</div>
                <div className="ag-name">{a.name}</div>
                <div className="ag-desc">{a.desc}</div>
                <div className="ag-stat">{a.stat}</div>
                <div className="ag-toggle">
                  <span style={{fontSize:'11px',color:a.on?'var(--green)':'var(--text3)',fontWeight:'700'}}>{a.on?'Activo':'Inactivo'}</span>
                  <div className={`sw${a.on?' on':''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── VOIP ─── */}
      <div className={`view${activeView==='voip'?' active':''}`} id="v-voip">
        <div className="sec">
          <div className="sec-title">📞 VoIP + Asterisk + Softphone <span className="st-sub">3 líneas activas</span></div>
          <div className="voip-wrap">
            <div className="card card-p" style={{textAlign:'center'}}>
              <div className="sp-status"><span className="ldot" />Disponible</div>
              <div className="sp-display" style={{color:calling?'var(--green)':'var(--text)'}}>{dialStr||'_'}</div>
              <div className="dialpad">
                {[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0',''],['#','']].map(([k,sub]) => (
                  <button key={k} className="dp-btn" onClick={() => dialPress(k)}>{k}<div className="dp-sub">{sub}</div></button>
                ))}
              </div>
              {!calling ? (
                <button className="call-btn" onClick={makeCall}>📞 Llamar</button>
              ) : (
                <button className="end-btn" style={{display:'block'}} onClick={endCall}>📵 Colgar</button>
              )}
              <div style={{display:'flex',gap:'6px',justifyContent:'center',marginTop:'8px'}}>
                {[['🔇 Mute','🔇 Micrófono silenciado'],['⏸ Hold','⏸ En espera'],['🔀 Xfer','🔀 Transfiriendo...']].map(([l,t]) => (
                  <button key={l} className="btn btn-secondary btn-sm" onClick={() => showToast(t)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="card" style={{overflow:'hidden'}}>
              <div style={{padding:'10px 13px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontSize:'13px',fontWeight:'800',color:'var(--text)'}}>Historial de llamadas</div>
                <button className="btn btn-secondary btn-sm" onClick={() => showToast('📊 Reporte exportado')}>Exportar</button>
              </div>
              {[{dir:'↗',color:'var(--green)',name:'María Rodríguez',sub:'+57 310 842 9180 · TechCorp',dur:'4:32',time:'Hoy 09:15',tip:'4:32 min · Interés alto · Acción: enviar propuesta hoy'},
                {dir:'✗',color:'var(--red)',name:'Carlos Pérez',sub:'+57 301 420 8844 · Náutica',dur:'Perdida',time:'Hoy 09:02',durColor:'var(--red)',tip:'Llamada perdida — WA automático enviado 30 seg después'},
                {dir:'↗',color:'var(--green)',name:'Ana Martínez',sub:'+57 316 225 7740 · InnovaLog',dur:'7:18',time:'Ayer 16:44',tip:'Demo agendada jueves 10am · IA preparó propuesta'},
                {dir:'↙',color:'#60A5FA',name:'Pedro Gómez',sub:'+57 300 182 9834 · Dist. Sur',dur:'2:44',time:'Ayer 14:20',tip:'Llamada entrante · CRM actualizado automáticamente'},
                {dir:'↗',color:'var(--green)',name:'Sandra Lima',sub:'+57 314 890 2241 · Al. Frescos',dur:'12:06',time:'Lun 11:30',tip:'Propuesta aceptada · Contrato enviado · Cierre inminente'}
              ].map((r,i) => (
                <div key={i} className="call-row" onClick={() => showToast('📋 '+r.tip)}>
                  <div style={{color:r.color,fontSize:'14px',width:'20px'}}>{r.dir}</div>
                  <div><div style={{fontSize:'12px',fontWeight:'700',color:'var(--text)'}}>{r.name}</div><div style={{fontSize:'10px',color:'var(--text3)'}}>{r.sub}</div></div>
                  <div style={{marginLeft:'auto',textAlign:'right'}}><div style={{fontSize:'12px',fontWeight:'700',color:r.durColor||'var(--text2)'}}>{r.dur}</div><div style={{fontSize:'10px',color:'var(--text3)'}}>{r.time}</div></div>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'7px',padding:'9px 13px',borderTop:'1px solid var(--border)'}}>
                {[['62%','var(--green)','Contactabilidad'],['4:32','#60A5FA','Duración prom.'],['156','var(--amber)','Llamadas hoy']].map(([v,c,l]) => (
                  <div key={l} style={{textAlign:'center'}}><div style={{fontFamily:'var(--font)',fontSize:'16px',fontWeight:'900',color:c}}>{v}</div><div style={{fontSize:'10px',color:'var(--text3)'}}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ANALYTICS ─── */}
      <div className={`view${activeView==='analytics'?' active':''}`} id="v-analytics">
        <div className="sec">
          <div className="sec-hd">
            <div className="sec-title">📊 Analítica Ejecutiva <span className="st-sub">Power BI · Tiempo real</span></div>
            <button className="ai-btn btn-sm" onClick={() => showToast('✦ IA: WhatsApp +38% conversión vs email · Leads GA cierran 2.4x más rápido')}><span>✦</span> Insights IA</button>
          </div>
          <div className="analytics-grid">
            <div className="chart-card">
              <div style={{fontSize:'12px',fontWeight:'800',color:'var(--text)',marginBottom:'11px',display:'flex',justifyContent:'space-between'}}>Leads por día <span style={{fontSize:'10px',color:'var(--text3)'}}>Últimos 7 días</span></div>
              <div className="bar-chart" ref={barLeadsRef} />
            </div>
            <div className="chart-card">
              <div style={{fontSize:'12px',fontWeight:'800',color:'var(--text)',marginBottom:'11px'}}>Canales de origen</div>
              <div style={{display:'flex',alignItems:'center',gap:'18px'}}>
                <svg width="96" height="96" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="17"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#25D366" strokeWidth="17" strokeDasharray="82 144" strokeDashoffset="-5"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#2D6BE4" strokeWidth="17" strokeDasharray="54 172" strokeDashoffset="-93"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#F5A623" strokeWidth="17" strokeDasharray="34 192" strokeDashoffset="-153"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#8B5CF6" strokeWidth="17" strokeDasharray="24 202" strokeDashoffset="-193"/>
                  <text x="50" y="55" textAnchor="middle" fill="#EEF2FF" fontSize="13" fontWeight="900" fontFamily="Cabinet Grotesk">38%</text>
                </svg>
                <div style={{flex:1}}>
                  {[['#25D366','WhatsApp','38%'],['#2D6BE4','Email','25%'],['#F5A623','Llamadas','16%'],['#8B5CF6','Bot IA','11%'],['#06C8E8','Ads directo','10%']].map(([c,l,v]) => (
                    <div key={l} className="legend-item"><div className="leg-dot" style={{background:c}} />{l}<span className="leg-val">{v}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="chart-card">
              <div style={{fontSize:'12px',fontWeight:'800',color:'var(--text)',marginBottom:'11px'}}>Funnel de conversión</div>
              <div ref={funnelRef} style={{display:'flex',flexDirection:'column',gap:'5px'}} />
            </div>
            <div className="chart-card">
              <div style={{fontSize:'12px',fontWeight:'800',color:'var(--text)',marginBottom:'11px',display:'flex',justifyContent:'space-between'}}>Revenue mensual <span style={{fontSize:'10px',color:'var(--text3)'}}>Últimos 6 meses</span></div>
              <div className="bar-chart" ref={barRevRef} />
              <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.06),rgba(45,107,228,0.06))',border:'1px solid rgba(139,92,246,0.16)',borderRadius:'var(--rsm)',padding:'10px',marginTop:'9px'}}>
                <div style={{fontSize:'10px',fontWeight:'800',color:'var(--purple)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'6px'}}>✦ Insights IA</div>
                {['WhatsApp genera 38% más conversiones que email','Google Ads cierra 2.4x más rápido que Meta','Mejor hora de contacto: 09:00–11:00 AM'].map(t => (
                  <div key={t} style={{fontSize:'11px',color:'var(--text2)',paddingLeft:'12px',position:'relative',marginBottom:'3px',lineHeight:'1.5'}}><span style={{position:'absolute',left:0,color:'var(--purple)'}}>›</span>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PRICING ─── */}
      <div className={`view${activeView==='pricing'?' active':''}`} id="v-pricing">
        <div className="sec">
          <div style={{textAlign:'center',marginBottom:'26px'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'var(--cyan)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'7px'}}>Planes y Precios</div>
            <div style={{fontFamily:'var(--font)',fontSize:'26px',fontWeight:'900',color:'var(--text)',marginBottom:'6px'}}>Elige tu nivel de crecimiento</div>
            <div style={{fontSize:'13px',color:'var(--text3)'}}>Sin permanencia mínima · Soporte incluido · Setup 6-8 semanas</div>
          </div>
          <div className="pricing-grid">
            {[{plan:'Starter',color:'var(--text3)',price:'400',range:'',users:'hasta 3 usuarios',features:['CRM básico + Pipeline','Leads ilimitados','Email marketing básico','1 canal comunicación','Reportes básicos'],missing:['WhatsApp API','Agentes IA','VoIP Asterisk'],btnCls:'btn-secondary',btnTxt:'Empezar gratis',btnToast:'🚀 Plan Starter — Iniciando prueba 14 días gratuitos',featured:false},
             {plan:'Growth',color:'var(--cyan)',price:'900–1,200',range:'',users:'hasta 10 usuarios',features:['CRM completo + IA','WhatsApp API + Chatbot','Campañas omnicanal','Multiagente humano+bot','Integración Ads','Analítica intermedia','Propuestas automatizadas'],missing:['VoIP Asterisk'],btnCls:'btn-primary',btnTxt:'Solicitar demo',btnToast:'🌟 Plan Growth — Agendando demo personalizada ahora...',featured:true},
             {plan:'Enterprise AI',color:'var(--purple)',price:'1,500–2,500',range:'',users:'usuarios ilimitados',features:['Todo Growth incluido','Agentes IA autónomos','VoIP Asterisk + Softphone','Analítica Power BI','Recomendador upsell IA','Automatización avanzada','Soporte 24/7 + SLA','NDA disponible'],missing:[],btnCls:'btn-secondary',btnTxt:'Hablar con ventas',btnToast:'🏢 Enterprise — Te contactamos en menos de 2 horas',featured:false}
            ].map(p => (
              <div key={p.plan} className={`price-card${p.featured?' featured':''}`}>
                <div className="price-plan" style={{color:p.color}}>{p.plan}</div>
                <div className="price-val"><small>$</small>{p.price} <small>USD</small></div>
                <div className="price-sub">/ mes · {p.users}</div>
                <ul className="price-features">
                  {p.features.map(f => <li key={f}><span>✅</span>{f}</li>)}
                  {p.missing.map(f => <li key={f}><span style={{color:'var(--text3)'}}>✗</span><span style={{color:'var(--text3)'}}>{f}</span></li>)}
                </ul>
                <button className={`btn ${p.btnCls}`} style={{width:'100%',justifyContent:'center',...(p.featured?{}:{borderColor:p.plan==='Enterprise AI'?'rgba(139,92,246,0.4)':undefined,color:p.plan==='Enterprise AI'?'var(--purple)':undefined})}} onClick={() => showToast(p.btnToast)}>{p.btnTxt}</button>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:'20px',padding:'18px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r)'}}>
            <div style={{fontSize:'14px',fontWeight:'800',color:'var(--text)',marginBottom:'6px'}}>¿Listo para transformar tu proceso comercial?</div>
            <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'13px'}}>Sin permanencia · NDA disponible · Soporte continuo · Onboarding dedicado</div>
            <button onClick={() => showToast('📅 Reunión agendada con CCG · Confirmación en tu correo en 5 min')} className="btn btn-primary" style={{padding:'12px 28px',fontSize:'14px'}}>🚀 Agendar reunión con CCG</button>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─── */}
      {/* New Client */}
      {modalNewClient && (
        <div className="modal-overlay open" onClick={e=>{if(e.target.className.includes('modal-overlay'))setModalNewClient(false);}}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">🏢 Nuevo Cliente / Lead</div>
              <button className="modal-close" onClick={() => setModalNewClient(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="steps-bar">
                {[1,2,3].map(s => <div key={s} className={`step-ind${clientStep>=s?' done active':''}`} />)}
              </div>
              <div className="step-lbl-row">
                {['1. Empresa','2. Contacto','3. Oportunidad'].map((l,i) => <span key={l} className={clientStep===i+1?'on':''}>{l}</span>)}
              </div>
              {clientStep===1 && (
                <>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Nombre de empresa *</label><input className="form-input" value={newClientForm.company} onChange={e=>setNewClientForm(p=>({...p,company:e.target.value}))} placeholder="Ej: TechCorp Colombia" /></div>
                    <div className="form-group"><label className="form-label">Sector *</label><select className="form-select" value={newClientForm.sector} onChange={e=>setNewClientForm(p=>({...p,sector:e.target.value}))}><option value="">Seleccionar...</option>{['Software / Tecnología','Manufactura','Distribución','Logística','Alimentos','Construcción','Salud','Financiero','Retail / E-commerce','Otro'].map(s=><option key={s}>{s}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">País / Ciudad</label><input className="form-input" value={newClientForm.city} onChange={e=>setNewClientForm(p=>({...p,city:e.target.value}))} placeholder="Bogotá, Colombia" /></div>
                    <div className="form-group"><label className="form-label">Tamaño empresa</label><select className="form-select" value={newClientForm.size} onChange={e=>setNewClientForm(p=>({...p,size:e.target.value}))}>{['1-10 empleados','11-50 empleados','50-100 empleados','100-250 empleados','250-500 empleados','500+ empleados'].map(s=><option key={s}>{s}</option>)}</select></div>
                  </div>
                  <div style={{display:'flex',justifyContent:'flex-end',gap:'8px',marginTop:'8px'}}>
                    <button className="btn btn-secondary" onClick={() => setModalNewClient(false)}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => setClientStep(2)}>Siguiente →</button>
                  </div>
                </>
              )}
              {clientStep===2 && (
                <>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Nombre contacto *</label><input className="form-input" value={newClientForm.name} onChange={e=>setNewClientForm(p=>({...p,name:e.target.value}))} placeholder="Ej: María Rodríguez" /></div>
                    <div className="form-group"><label className="form-label">Cargo</label><input className="form-input" value={newClientForm.role} onChange={e=>setNewClientForm(p=>({...p,role:e.target.value}))} placeholder="Ej: Dir. Comercial" /></div>
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={newClientForm.email} onChange={e=>setNewClientForm(p=>({...p,email:e.target.value}))} placeholder="maria@empresa.com" /></div>
                    <div className="form-group"><label className="form-label">WhatsApp / Teléfono</label><input className="form-input" value={newClientForm.phone} onChange={e=>setNewClientForm(p=>({...p,phone:e.target.value}))} placeholder="+57 310 000 0000" /></div>
                  </div>
                  <div style={{display:'flex',justifyContent:'flex-end',gap:'8px',marginTop:'8px'}}>
                    <button className="btn btn-secondary" onClick={() => setClientStep(1)}>← Atrás</button>
                    <button className="btn btn-primary" onClick={() => setClientStep(3)}>Siguiente →</button>
                  </div>
                </>
              )}
              {clientStep===3 && (
                <>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Valor estimado (USD)</label><input className="form-input" type="number" value={newClientForm.value} onChange={e=>setNewClientForm(p=>({...p,value:e.target.value}))} placeholder="10000" /></div>
                    <div className="form-group"><label className="form-label">Canal de origen</label><select className="form-select" value={newClientForm.source} onChange={e=>setNewClientForm(p=>({...p,source:e.target.value}))}>{['Google Ads','Meta Ads','WhatsApp Orgánico','Referido','LinkedIn','Llamada entrante','Web orgánico','Otro'].map(s=><option key={s}>{s}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Canal preferido</label><select className="form-select" value={newClientForm.channel} onChange={e=>setNewClientForm(p=>({...p,channel:e.target.value}))}>{['WhatsApp','Email','Llamada','Bot IA'].map(s=><option key={s}>{s}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Urgencia</label><select className="form-select" value={newClientForm.urgency} onChange={e=>setNewClientForm(p=>({...p,urgency:e.target.value}))}>{['Alta (esta semana)','Media (este mes)','Baja (próximo trimestre)'].map(s=><option key={s}>{s}</option>)}</select></div>
                  </div>
                  <div className="form-group"><label className="form-label">Notas iniciales</label><textarea className="form-textarea" value={newClientForm.notes} onChange={e=>setNewClientForm(p=>({...p,notes:e.target.value}))} placeholder="Contexto adicional..." /></div>
                  <div style={{display:'flex',justifyContent:'flex-end',gap:'8px',marginTop:'8px'}}>
                    <button className="btn btn-secondary" onClick={() => setClientStep(2)}>← Atrás</button>
                    <button className="btn btn-primary" onClick={saveNewClient}>✅ Guardar en CRM</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Opp */}
      {modalNewOpp && (
        <div className="modal-overlay open" onClick={e=>{if(e.target.className.includes('modal-overlay'))setModalNewOpp(false);}}>
          <div className="modal">
            <div className="modal-head"><div className="modal-title">📊 Nueva Oportunidad</div><button className="modal-close" onClick={() => setModalNewOpp(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Empresa *</label><select className="form-select"><option value="">Seleccionar...</option>{clients.map(c=><option key={c.id}>{c.company}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Etapa inicial</label><select className="form-select">{['Prospecto','Contactado','Negociación','Propuesta'].map(s=><option key={s}>{s}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Valor (USD)</label><input className="form-input" type="number" placeholder="12000" /></div>
                <div className="form-group"><label className="form-label">Probabilidad %</label><input className="form-input" type="number" placeholder="25" min="0" max="100" /></div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:'8px',marginTop:'4px'}}>
                <button className="btn btn-secondary" onClick={() => setModalNewOpp(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={() => { setModalNewOpp(false); showToast('✅ Oportunidad agregada al pipeline'); }}>Agregar al Pipeline</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New WA */}
      {modalNewWA && (
        <div className="modal-overlay open" onClick={e=>{if(e.target.className.includes('modal-overlay'))setModalNewWA(false);}}>
          <div className="modal">
            <div className="modal-head"><div className="modal-title">💬 Nueva Conversación WA</div><button className="modal-close" onClick={() => setModalNewWA(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Contacto</label><select className="form-select">{WA_CONTACTS.map((c,i)=><option key={i}>{c.name} · {c.company}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Plantilla de inicio</label><select className="form-select"><option>Bienvenida B2B</option><option>Invitación a Demo</option><option>Seguimiento post-contacto</option><option>Reactivación lead frío</option></select></div>
              <div className="form-group"><label className="form-label">Nota interna</label><textarea className="form-textarea" placeholder="Contexto para el agente..." /></div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:'8px'}}>
                <button className="btn btn-secondary" onClick={() => setModalNewWA(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={() => { setModalNewWA(false); showToast('✅ Conversación iniciada'); }}>Iniciar conversación</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign */}
      {modalNewCamp && (
        <div className="modal-overlay open" onClick={e=>{if(e.target.className.includes('modal-overlay'))setModalNewCamp(false);}}>
          <div className="modal">
            <div className="modal-head"><div className="modal-title">📡 Nueva Campaña</div><button className="modal-close" onClick={() => setModalNewCamp(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" placeholder="Ej: Reactivación Q2 2025" /></div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Segmento</label><select className="form-select"><option>Todos los leads</option><option>Leads fríos +30 días</option><option>Clientes activos</option></select></div>
                <div className="form-group"><label className="form-label">Objetivo</label><select className="form-select"><option>Agendar demo</option><option>Calificar lead</option><option>Upsell / cross-sell</option></select></div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:'8px',marginTop:'4px'}}>
                <button className="btn btn-secondary" onClick={() => setModalNewCamp(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={() => { setModalNewCamp(false); showToast('🚀 Campaña creada y activada'); }}>🚀 Crear y activar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
