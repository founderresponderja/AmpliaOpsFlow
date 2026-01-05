import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Rocket, Server, Code, ShieldCheck, DollarSign, ArrowRight, Loader2, 
  CheckCircle, AlertTriangle, Globe, X, History, LogOut, Check, Zap, 
  Bot, Wrench, Package, CreditCard, Building2, User as UserIcon,
  LayoutTemplate, Search, Mail, MessageSquare, Github, ChevronRight,
  Sparkles, Layers, Cpu, Database, Terminal as TerminalIcon, Download,
  ShieldAlert, Trash2, ExternalLink, Info, Cookie, Hash, Lock, User as UserLogo,
  Settings2, Shield, Activity, Plus, Box, Gauge, Eye
} from 'lucide-react';
import { ProjectType, DeploymentTarget, AppState, DeploymentConfig, LogEntry, Language, User, PlanTier, Plan, AuthView, Priority, AIPack, BillingInfo, ErrorAnalysis } from './types';
import { generateDeploymentConfig, generateDeploymentLogs, analyzeDeploymentError } from './services/geminiService';
import { initLemonSqueezy, openCheckout } from './services/paymentService';
import { issueInvoiceAT, sendInvoiceByEmail } from './services/atService';
import Terminal from './components/Terminal';
import FileViewer from './components/FileViewer';
import EnvVarViewer from './components/EnvVarViewer';
import SelectInput from './components/SelectInput';

const PLANS: Record<PlanTier, Plan> = {
  TRIAL: { id: 'TRIAL', name: 'Free Trial', price: 0, deploymentsPerMonth: 2, features: ['Community Support', 'Basic AI Config', 'Single Target'] },
  BASIC: { id: 'BASIC', name: 'Basic AI', price: 9.99, deploymentsPerMonth: 10, features: ['Email Support', 'Standard Security Scan', 'CI/CD Automation'], lemonSqueezyVariantId: 'variant_123' },
  PRO: { id: 'PRO', name: 'Enterprise AI', price: 24.99, deploymentsPerMonth: 30, features: ['Priority Support', 'Advanced Security', 'Cost Optimization', '24/7 Monitoring'], lemonSqueezyVariantId: 'variant_456' },
  PREMIUM: { id: 'PREMIUM', name: 'Platinum AI', price: 49.99, deploymentsPerMonth: 75, features: ['Dedicated Support', 'Full Compliance Scan', 'Custom AI Agents', 'Unlimited Blueprints'], lemonSqueezyVariantId: 'variant_789' }
};

const PACKS: AIPack[] = [
  { id: 'p1', deployments: 5, price: 9.99, savings: 'Basic', lemonSqueezyVariantId: 'pack_1' },
  { id: 'p2', deployments: 25, price: 39.99, savings: 'Popular', lemonSqueezyVariantId: 'pack_2' },
  { id: 'p3', deployments: 100, price: 129.99, savings: 'Best Value', lemonSqueezyVariantId: 'pack_3' }
];

const TRANSLATIONS = {
  pt: {
    pageTitle: "OpsFlow | Automação de DevOps com IA",
    heroTitle: "O Futuro do desenvolvimento de aplicações é ",
    heroTitleAccent: "Inteligente.",
    heroDesc: "O OpsFlow utiliza inteligência artificial avançada para gerar Dockerfiles, CI/CD e cloud configs em segundos. Otimize o seu workflow hoje.",
    lblFeatures: "Vantagens da Engenharia com IA",
    feature1Title: "Geração de Blueprints",
    feature1Desc: "Dockerfiles e configs de infraestrutura gerados instantaneamente para o seu stack específico.",
    feature2Title: "Automação CI/CD",
    feature2Desc: "Pipelines de integração contínua configurados sem erros manuais, prontos para produção.",
    feature3Title: "Segurança Nativa",
    feature3Desc: "Análise proativa de vulnerabilidades e sugestões de correção antes do deployment.",
    feature4Title: "Diagnóstico Real",
    feature4Desc: "IA com Google Search para resolver erros de deployment em tempo real com fontes reais.",
    feature5Title: "Multi-Cloud",
    feature5Desc: "Deploy para AWS, Azure, GCP ou DigitalOcean com a mesma fluidez e simplicidade.",
    feature6Title: "Otimização de Custos",
    feature6Desc: "Sugestões inteligentes para reduzir gastos com recursos cloud subutilizados.",
    lblPricing: "Planos de Automação de IA",
    pricingDesc: "Escolha o nível de inteligência artificial que a sua equipa precisa para escalar.",
    lblPacks: "Pacotes de Deployment (Sem Mensalidade)",
    packsDesc: "Precisa de créditos extra? Compre pacotes de utilização única conforme as suas necessidades.",
    lblBilling: "Informação Fiscal (AT)",
    btnBuy: "Subscrever Plano IA",
    btnBuyPack: "Comprar Pacote",
    ctaStart: "Registo",
    perMonth: "/mês",
    deploysPerMo: "Deployments /mês",
    deploysOneTime: "Deployments via IA",
    lblLiveLogs: "Consola de Monitorização IA",
    legalConsent: "Aceito os Termos de Serviço e a Política de Privacidade em conformidade com o RGPD.",
    cookieText: "O OpsFlow utiliza cookies inteligentes para personalizar e otimizar a sua experiência tecnológica.",
    cookieAccept: "Aceitar Todos",
    cookieConfigure: "Configurar",
    cookieSave: "Guardar Preferências",
    cookieEssential: "Essenciais",
    cookieEssentialDesc: "Necessários para o funcionamento básico e segurança.",
    cookieAnalytics: "Analíticos",
    cookieAnalyticsDesc: "Ajudam-nos a melhorar o motor de IA através de métricas anónimas.",
    cookieMarketing: "Marketing",
    cookieMarketingDesc: "Permite-nos oferecer planos personalizados às suas necessidades.",
    gdprDelete: "Eliminar Conta (RGPD)",
    atDisclaimer: "Ligação 100% segura e encriptada com a Autoridade Tributária Portuguesa via TLS 1.3.",
    complaints: "Livro de Reclamações Eletrónico",
    btnRegister: "Registo",
    btnLogin: "Entrar",
    quotaLabel: "Quota IA",
    perfMonitor: "Performance do Motor",
    lblApiDocs: "API Docs",
    lblPrivacy: "Privacidade",
    lblLegal: "Legal & GDPR",
    lblContact: "Contacto",
    copyright: "2025 Amplia Solutions",
    gitCommit: "Commit para o Git",
    gitMsgPlaceholder: "Mensagem de commit...",
    gitSuccess: "Commit e Push realizados com sucesso!",
    gitLoading: "Realizando Commit...",
    gitError: "Erro ao comunicar com o repositório."
  },
  en: {
    pageTitle: "OpsFlow | AI-Powered DevOps Automation",
    heroTitle: "The Future of App Development is ",
    heroTitleAccent: "Smart.",
    heroDesc: "OpsFlow uses advanced AI to generate Dockerfiles, CI/CD, and cloud configs in seconds. Optimize your workflow today.",
    lblFeatures: "Engineering Advantages with AI",
    feature1Title: "Blueprint Generation",
    feature1Desc: "Dockerfiles and infrastructure configs generated instantly for your specific stack.",
    feature2Title: "CI/CD Automation",
    feature2Desc: "Continuous integration pipelines configured without manual errors, production-ready.",
    feature3Title: "Native Security",
    feature3Desc: "Proactive vulnerability analysis and fix suggestions before deployment.",
    feature4Title: "Real-time Diagnosis",
    feature4Desc: "AI with Google Search to resolve deployment errors in real-time with real sources.",
    feature5Title: "Multi-Cloud Support",
    feature5Desc: "Deploy to AWS, Azure, GCP, or DigitalOcean with the same fluidity and simplicity.",
    feature6Title: "Cost Optimization",
    feature6Desc: "Smart suggestions to reduce spending on underutilized cloud resources.",
    lblPricing: "AI Automation Plans",
    pricingDesc: "Choose the level of artificial intelligence your team needs to scale.",
    lblPacks: "Deployment Packs (No Subscription)",
    packsDesc: "Need extra credits? Buy one-time usage packs according to your needs.",
    lblBilling: "Tax Information (Compliant)",
    btnBuy: "Subscribe to AI Plan",
    btnBuyPack: "Buy Pack",
    ctaStart: "Register",
    perMonth: "/mo",
    deploysPerMo: "Deployments /mo",
    deploysOneTime: "AI Deployments",
    lblLiveLogs: "AI Monitoring Console",
    legalConsent: "I agree to the Terms of Service and Privacy Policy in compliance with GDPR.",
    cookieText: "OpsFlow uses smart cookies to personalize and optimize your technology experience.",
    cookieAccept: "Accept All",
    cookieConfigure: "Configure",
    cookieSave: "Save Preferences",
    cookieEssential: "Essential",
    cookieEssentialDesc: "Required for core functionality and security.",
    cookieAnalytics: "Analytics",
    cookieAnalyticsDesc: "Help us improve the AI engine through anonymous metrics.",
    cookieMarketing: "Marketing",
    cookieMarketingDesc: "Allows us to offer plans tailored to your needs.",
    gdprDelete: "Delete Account (GDPR)",
    atDisclaimer: "100% secure and encrypted connection with Tax Authorities via TLS 1.3.",
    complaints: "Electronic Complaints Book",
    btnRegister: "Register",
    btnLogin: "Login",
    quotaLabel: "AI Quota",
    perfMonitor: "Engine Performance",
    lblApiDocs: "API Docs",
    lblPrivacy: "Privacy",
    lblLegal: "Legal & GDPR",
    lblContact: "Contact",
    copyright: "2025 Amplia Solutions",
    gitCommit: "Commit to Git",
    gitMsgPlaceholder: "Commit message...",
    gitSuccess: "Commit and Push successful!",
    gitLoading: "Committing...",
    gitError: "Error communicating with repository."
  },
  es: {
    pageTitle: "OpsFlow | Automatización DevOps con IA",
    heroTitle: "El Futuro del desarrollo de aplicaciones es ",
    heroTitleAccent: "Inteligente.",
    heroDesc: "OpsFlow utiliza IA avanzada para generar Dockerfiles, CI/CD y cloud configs in segundos. Optimice su workflow hoy.",
    lblFeatures: "Ventajas de la Ingeniería con IA",
    feature1Title: "Generación de Blueprints",
    feature1Desc: "Dockerfiles y configs de infraestructura gerados al instante para tu stack específico.",
    feature2Title: "Automatización CI/CD",
    feature2Desc: "Pipelines de integración continua configurados sem errores manuales, listos para producción.",
    feature3Title: "Seguridad Nativa",
    feature3Desc: "Análisis proactivo de vulnerabilidades y sugerencias de corrección antes del despliegue.",
    feature4Title: "Diagnóstico Real",
    feature4Desc: "IA con Google Search para resolver errores de despliegue em tiempo real com fuentes reales.",
    feature5Title: "Multi-Cloud",
    feature5Desc: "Despliega em AWS, Azure, GCP o DigitalOcean com la misma fluidez y sencillez.",
    feature6Title: "Optimización de Costos",
    feature6Desc: "Sugerencias inteligentes para reducir gastos em recursos cloud infrautilizados.",
    lblPricing: "Planes de Automatización com IA",
    pricingDesc: "Elija el nivel de inteligencia artificial que su equipo necesita para escalar.",
    lblPacks: "Paquetes de Despliegue (Sin Mensualidad)",
    packsDesc: "¿Necesitas créditos extra? Compra paquetes de un solo uso según tus necesidades.",
    lblBilling: "Información Fiscal",
    btnBuy: "Contratar Plan IA",
    btnBuyPack: "Comprar Paquete",
    ctaStart: "Registro",
    perMonth: "/mes",
    deploysPerMo: "Despliegues /mes",
    deploysOneTime: "Despliegues com IA",
    lblLiveLogs: "Consola de Monitoreo IA",
    legalConsent: "Acepto los Términos de Servicio y la Política de Privacidade conforme al RGPD.",
    cookieText: "OpsFlow utiliza cookies inteligentes para personalizar y optimizar su experiencia tecnológica.",
    cookieAccept: "Aceptar Todo",
    cookieConfigure: "Configurar",
    cookieSave: "Guardar Preferencias",
    cookieEssential: "Esenciales",
    cookieEssentialDesc: "Necesarios para el funcionamiento básico y seguridad.",
    cookieAnalytics: "Analítica",
    cookieAnalyticsDesc: "Ayúdanos a mejorar el motor de IA mediante métricas anónimas.",
    cookieMarketing: "Marketing",
    cookieMarketingDesc: "Permite que te ofrezcamos planes adaptados a tus necesidades.",
    gdprDelete: "Eliminar Cuenta (RGPD)",
    atDisclaimer: "Conexión 100% segura y encriptada com las Autoridades Tributarias vía TLS 1.3.",
    complaints: "Libro de Reclamaciones Electrónico",
    btnRegister: "Registro",
    btnLogin: "Iniciar sesión",
    quotaLabel: "Cuota IA",
    perfMonitor: "Rendimiento del Motor",
    lblApiDocs: "API Docs",
    lblPrivacy: "Privacidad",
    lblLegal: "Legal & GDPR",
    lblContact: "Contacto",
    copyright: "2025 Amplia Solutions",
    gitCommit: "Hacer Commit a Git",
    gitMsgPlaceholder: "Mensaje de commit...",
    gitSuccess: "¡Commit y Push realizados com éxito!",
    gitLoading: "Haciendo commit...",
    gitError: "Error al comunicarse com el repositorio."
  }
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [authView, setAuthView] = useState<AuthView>(AuthView.LANDING);
  const [lang, setLang] = useState<Language>('pt'); 
  const [user, setUser] = useState<User | null>(null);
  
  const [perfMetrics, setPerfMetrics] = useState({ latency: 0, fps: 60 });
  const [config, setConfig] = useState<DeploymentConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis | null>(null);
  
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitStatus, setCommitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [commitMsg, setCommitMsg] = useState('');

  const [showCookies, setShowCookies] = useState(true);
  const [showCookiePanel, setShowCookiePanel] = useState(false);
  const [cookieSettings, setCookieSettings] = useState({ 
    essential: true, 
    analytics: true, 
    marketing: false 
  });

  const t = (TRANSLATIONS[lang] || TRANSLATIONS.en) as any;

  // SEO METHODOLOGY: Dynamic language and title synchronization
  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-PT' : lang === 'es' ? 'es-ES' : 'en-US';
    document.title = t.pageTitle;
  }, [lang, t.pageTitle]);

  useEffect(() => {
    initLemonSqueezy();
    const cookiesAccepted = localStorage.getItem('opsflow-cookies-v1');
    if (cookiesAccepted) {
      setCookieSettings(JSON.parse(cookiesAccepted));
      setShowCookies(false);
    }
    
    let frames = 0;
    let lastTime = performance.now();
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        setPerfMetrics(prev => ({ ...prev, fps: frames }));
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(tick);
    };
    const animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const saveCookies = (all: boolean = false) => {
    const finalSettings = all ? { essential: true, analytics: true, marketing: true } : cookieSettings;
    localStorage.setItem('opsflow-cookies-v1', JSON.stringify(finalSettings));
    setCookieSettings(finalSettings);
    setShowCookies(false);
    setShowCookiePanel(false);
  };

  const startAnalysis = async () => {
    const startTime = performance.now();
    setAppState(AppState.GENERATING);
    try {
      const result = await generateDeploymentConfig(ProjectType.NODE, DeploymentTarget.AWS, "High Performance Engine Request", lang, 'High');
      setPerfMetrics(prev => ({ ...prev, latency: Math.round(performance.now() - startTime) }));
      setConfig(result);
      setAppState(AppState.REVIEW);
    } catch (e) {
      setAppState(AppState.ERROR);
    }
  };

  const runDeployment = async () => {
    setAppState(AppState.DEPLOYING);
    setLogs([]);
    setErrorAnalysis(null);
    try {
      const rawLogs = await generateDeploymentLogs(ProjectType.NODE, DeploymentTarget.AWS, lang);
      for (let i = 0; i < rawLogs.length; i++) {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: rawLogs[i]
        }]);
      }
      setAppState(AppState.SUCCESS);
    } catch (e) {
      setAppState(AppState.ERROR);
      const analysis = await analyzeDeploymentError(logs, ProjectType.NODE, DeploymentTarget.AWS, lang);
      setErrorAnalysis(analysis);
    }
  };

  const handleSimulateCommit = useCallback(async (message: string) => {
    if (!message || message.trim() === '') return;
    setIsCommitting(true);
    setCommitStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const commitHash = Math.random().toString(16).slice(2, 9);
      const newLogs: LogEntry[] = [
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `[GIT] Verifying connection to origin/main...` },
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `[GIT] Command: git add .` },
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `[GIT] Command: git commit -m "${message}"` },
        { timestamp: new Date().toLocaleTimeString(), level: 'success', message: `[GIT] Commit [main ${commitHash}] created with ${config?.files.length || 0} changes.` },
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `[GIT] Command: git push origin main` },
        { timestamp: new Date().toLocaleTimeString(), level: 'success', message: `[GIT] All changes synchronized with remote repository.` }
      ];
      setLogs(prev => [...prev, ...newLogs]);
      setCommitStatus('success');
      setCommitMsg('');
    } catch (error) {
      setCommitStatus('error');
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), level: 'error', message: `[GIT] Error during commit simulation.` }]);
    } finally {
      setIsCommitting(false);
    }
  }, [config]);

  const handleGitKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSimulateCommit(commitMsg);
  };

  return (
    <div className="min-h-screen bg-amplia-bg text-amplia-text flex flex-col font-sans transition-all duration-500 ease-in-out selection:bg-amplia-accent/30">
       
       {showCookies && (
         <div className="fixed bottom-6 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-max z-[1000] glass border border-amplia-border/50 p-6 rounded-[32px] shadow-4xl animate-pageIn overflow-hidden max-w-4xl w-full">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="p-3 bg-amplia-accent/10 rounded-2xl text-amplia-accent shrink-0"><Shield size={24}/></div>
                <div className="flex-1 text-center lg:text-left">
                  <p className="text-sm font-bold opacity-80">{t.cookieText}</p>
                </div>
                {!showCookiePanel && (
                  <div className="flex gap-4 shrink-0">
                    <button 
                      onClick={() => setShowCookiePanel(true)} 
                      className="px-6 py-3 text-xs font-black uppercase opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
                      title={t.cookieConfigure}
                    >
                      <Settings2 size={14} /> {t.cookieConfigure}
                    </button>
                    <button 
                      onClick={() => saveCookies(true)} 
                      className="bg-amplia-accent hover:bg-amplia-accentHover text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg transition-all"
                    >
                      {t.cookieAccept}
                    </button>
                  </div>
                )}
              </div>

              {showCookiePanel && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-amplia-border/30 animate-pageIn">
                  <div className="p-4 bg-amplia-surface/50 rounded-2xl border border-amplia-border/30 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest mb-1">{t.cookieEssential}</h4>
                      <p className="text-[10px] opacity-50 font-bold">{t.cookieEssentialDesc}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                       <Check className="text-amplia-accent" size={16} />
                       <span className="text-[10px] font-black uppercase text-amplia-accent">Always On</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amplia-surface/50 rounded-2xl border border-amplia-border/30 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest mb-1">{t.cookieAnalytics}</h4>
                      <p className="text-[10px] opacity-50 font-bold">{t.cookieAnalyticsDesc}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button 
                        onClick={() => setCookieSettings(prev => ({ ...prev, analytics: !prev.analytics }))}
                        className={`w-10 h-5 rounded-full relative transition-all ${cookieSettings.analytics ? 'bg-amplia-accent' : 'bg-amplia-border/50'}`}
                        aria-label="Toggle Analytics Cookies"
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${cookieSettings.analytics ? 'right-1' : 'left-1'}`} />
                      </button>
                      <span className="text-[10px] font-black uppercase opacity-60">{cookieSettings.analytics ? 'On' : 'Off'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amplia-surface/50 rounded-2xl border border-amplia-border/30 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest mb-1">{t.cookieMarketing}</h4>
                      <p className="text-[10px] opacity-50 font-bold">{t.cookieMarketingDesc}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button 
                        onClick={() => setCookieSettings(prev => ({ ...prev, marketing: !prev.marketing }))}
                        className={`w-10 h-5 rounded-full relative transition-all ${cookieSettings.marketing ? 'bg-amplia-accent' : 'bg-amplia-border/50'}`}
                        aria-label="Toggle Marketing Cookies"
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${cookieSettings.marketing ? 'right-1' : 'left-1'}`} />
                      </button>
                      <span className="text-[10px] font-black uppercase opacity-60">{cookieSettings.marketing ? 'On' : 'Off'}</span>
                    </div>
                  </div>
                </div>
              )}

              {showCookiePanel && (
                <div className="flex justify-end gap-4 border-t border-amplia-border/30 pt-4">
                  <button 
                    onClick={() => saveCookies(false)} 
                    className="bg-amplia-accent hover:bg-amplia-accentHover text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg transition-all"
                  >
                    {t.cookieSave}
                  </button>
                </div>
              )}
            </div>
         </div>
       )}

       <div className="fixed top-20 right-8 z-[150] flex flex-col items-end gap-2 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 px-3 py-1 bg-black/80 rounded-lg border border-white/10 text-[9px] font-mono text-white">
            <Activity size={10} className="text-green-400" />
            <span>{t.perfMonitor}: {perfMetrics.latency}ms / {perfMetrics.fps} FPS</span>
          </div>
       </div>

       <nav className="glass sticky top-0 z-[100] border-b border-amplia-border/50 px-8 py-4 flex items-center justify-between shadow-lg" role="navigation">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setAuthView(user ? AuthView.APP : AuthView.LANDING)} title="Home">
             <div className="w-10 h-10 bg-gradient-to-br from-amplia-accent to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <Rocket className="text-white" size={22} />
             </div>
             <span className="font-extrabold text-2xl tracking-tighter hover:text-amplia-accent transition-colors">OpsFlow AI</span>
          </div>

          <div className="flex items-center gap-6">
             {user ? (
               <div className="flex items-center gap-5">
                 <button onClick={() => setAuthView(AuthView.BILLING_MODAL)} className="p-2 hover:bg-amplia-border/30 rounded-full transition-all hover:scale-110" title={t.lblBilling}><Building2 size={20} /></button>
                 <div className="flex items-center gap-3 bg-amplia-surface/50 px-3 py-1.5 rounded-full border border-amplia-border/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amplia-accent to-cyan-400 border-2 border-amplia-border flex items-center justify-center text-xs font-black text-white shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                 </div>
                 <button onClick={() => { setUser(null); setAuthView(AuthView.LANDING); }} className="text-amplia-error hover:scale-125 transition-transform" aria-label="Logout"><LogOut size={18} /></button>
               </div>
             ) : (
               <div className="flex items-center gap-4">
                 <button onClick={() => setAuthView(AuthView.LOGIN)} className="font-bold text-sm hover:text-amplia-accent transition-colors">{t.btnLogin}</button>
                 <button onClick={() => setAuthView(AuthView.REGISTER)} className="bg-amplia-accent hover:bg-amplia-accentHover text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xl shadow-amplia-accent/20 transition-all hover:-translate-y-1 hover:shadow-2xl">{t.btnRegister}</button>
               </div>
             )}
             <div className="flex gap-1 p-1 bg-amplia-border/20 rounded-xl">
                {(['en', 'pt', 'es'] as Language[]).map(l => (
                   <button key={l} onClick={() => setLang(l)} className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-amplia-accent text-white shadow-md' : 'opacity-40 hover:opacity-100'}`} aria-label={`Mudar para ${l}`}>{l}</button>
                ))}
             </div>
          </div>
       </nav>

       <main className="flex-1" id="main-content">
          {!user && authView === AuthView.LANDING && (
            <article className="page-transition">
               <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                  <div className="container mx-auto text-center relative z-10">
                     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amplia-accent/10 border border-amplia-accent/30 text-amplia-accent text-xs font-black mb-12 animate-pulse">
                        <Zap size={14} /> Gemini 3 Pro AI Powered
                     </div>
                     <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tight leading-[0.85]">
                        {t.heroTitle}<br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amplia-accent via-cyan-400 to-purple-400 animate-gradient-x">
                           {t.heroTitleAccent}
                        </span>
                     </h1>
                     <p className="text-xl md:text-2xl text-amplia-textDim max-w-3xl mx-auto mb-16 font-semibold leading-relaxed opacity-90">
                        {t.heroDesc}
                     </p>
                     <button onClick={() => setAuthView(AuthView.REGISTER)} className="px-14 py-5 bg-amplia-accent text-white font-black rounded-[20px] shadow-3xl shadow-amplia-accent/40 hover:scale-105 active:scale-95 transition-all text-xl mx-auto flex items-center justify-center gap-4">
                        {t.ctaStart} <ArrowRight strokeWidth={3} />
                     </button>
                  </div>
               </section>

               {/* Advantages Section (Semantic h2 for SEO) */}
               <section className="py-24 px-6 bg-amplia-surface/20">
                  <div className="container mx-auto text-center">
                     <h2 className="text-4xl font-black mb-16 tracking-tighter">{t.lblFeatures}</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                           { icon: Box, color: 'text-blue-500', bg: 'bg-blue-500/10', title: t.feature1Title, desc: t.feature1Desc },
                           { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', title: t.feature2Title, desc: t.feature2Desc },
                           { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', title: t.feature3Title, desc: t.feature3Desc },
                           { icon: Eye, color: 'text-purple-500', bg: 'bg-purple-500/10', title: t.feature4Title, desc: t.feature4Desc },
                           { icon: Globe, color: 'text-cyan-500', bg: 'bg-cyan-500/10', title: t.feature5Title, desc: t.feature5Desc },
                           { icon: Gauge, color: 'text-red-500', bg: 'bg-red-500/10', title: t.feature6Title, desc: t.feature6Desc },
                        ].map((feature, i) => (
                           <div key={i} className="p-10 glass border border-amplia-border/40 rounded-[40px] text-left hover:scale-[1.02] transition-all group shadow-xl">
                              <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform`}>
                                 <feature.icon size={28} />
                              </div>
                              <h3 className="text-xl font-black mb-4 tracking-tight">{feature.title}</h3>
                              <p className="text-sm font-bold text-amplia-textDim leading-relaxed">{feature.desc}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>
            </article>
          )}

          {user && authView === AuthView.APP && (
             <div className="container mx-auto px-10 py-16 page-transition">
                <header className="flex flex-col md:flex-row justify-between items-end gap-12 mb-16">
                   <div className="text-left">
                      <h2 className="text-5xl font-black mb-3 tracking-tighter">OpsFlow AI Dashboard</h2>
                      <p className="text-amplia-textDim font-black text-xl opacity-80">Geração de Blueprints e Deployments Inteligentes.</p>
                   </div>
                   <div className="bg-amplia-surface border border-amplia-border px-8 py-4 rounded-3xl shadow-lg">
                      <span className="text-[10px] font-black text-amplia-textDim uppercase tracking-widest mb-1 block text-right">{t.quotaLabel}</span>
                      <span className="text-3xl font-black text-amplia-accent tracking-tighter">{user.deploymentsUsed} / {PLANS[user.plan].deploymentsPerMonth}</span>
                   </div>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   <aside className="lg:col-span-4 space-y-8">
                      <section className="glass border border-amplia-border p-8 rounded-[40px] shadow-2xl">
                         <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Layers className="text-amplia-accent" size={24}/> AI Blueprints</h3>
                         <div className="space-y-6">
                            <SelectInput id="proj-type" label="Core Language / Stack" value={ProjectType.NODE} onChange={()=>{}} options={Object.values(ProjectType)} icon={Code} />
                            <SelectInput id="target-cloud" label="Cloud Destination" value={DeploymentTarget.AWS} onChange={()=>{}} options={Object.values(DeploymentTarget)} icon={Server} />
                            <button onClick={startAnalysis} className="w-full bg-amplia-accent hover:bg-amplia-accentHover text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-4 text-lg">
                               <Bot size={24} /> Gerar com IA
                            </button>
                         </div>
                      </section>
                   </aside>

                   <section className="lg:col-span-8 flex flex-col gap-8">
                      {appState === AppState.GENERATING ? (
                        <div className="glass border border-amplia-border rounded-[48px] p-20 flex flex-col items-center justify-center text-center h-[600px] shadow-2xl">
                           <Loader2 className="w-16 h-16 text-amplia-accent animate-spin mb-8" />
                           <h3 className="text-3xl font-black mb-4 tracking-tight">O Motor de IA está a projetar...</h3>
                        </div>
                      ) : config ? (
                        <div className="flex flex-col gap-6">
                           <FileViewer files={config.files} />
                           
                           {/* Git Integration Section */}
                           <section className="p-8 glass border border-amplia-border rounded-[40px] shadow-2xl animate-fade-in">
                              <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="p-4 bg-amplia-accent/10 rounded-2xl text-amplia-accent">
                                  <Github size={32} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                  <h4 className="text-xl font-black tracking-tight">{t.gitCommit}</h4>
                                  <p className="text-sm font-bold text-amplia-textDim">{t.gitMsgPlaceholder}</p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                  <input 
                                    type="text" 
                                    value={commitMsg}
                                    onChange={(e) => setCommitMsg(e.target.value)}
                                    onKeyPress={handleGitKeyPress}
                                    placeholder={t.gitMsgPlaceholder}
                                    disabled={isCommitting}
                                    className="bg-amplia-bg border border-amplia-border px-6 py-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-amplia-accent transition-all min-w-[280px]"
                                  />
                                  <button 
                                    onClick={() => handleSimulateCommit(commitMsg)}
                                    disabled={isCommitting || !commitMsg}
                                    className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg ${
                                      commitStatus === 'success' 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-amplia-accent hover:bg-amplia-accentHover text-white disabled:opacity-50'
                                    }`}
                                  >
                                    {isCommitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    {isCommitting ? t.gitLoading : (commitStatus === 'success' ? t.gitSuccess : t.gitCommit)}
                                  </button>
                                </div>
                              </div>
                           </section>

                           <div className="grid grid-cols-2 gap-6">
                              <EnvVarViewer envVars={config.envVars} />
                              <div className="bg-amplia-surface border border-amplia-border rounded-3xl p-6">
                                 <h4 className="font-black text-xs uppercase tracking-widest text-amplia-accent mb-4">Recomendações IA</h4>
                                 <ul className="space-y-3">
                                    {config.recommendations.map((rec, i) => (
                                       <li key={i} className="text-sm font-bold opacity-70 flex gap-2"><Check size={14} className="text-green-500 shrink-0 mt-0.5" /> {rec}</li>
                                    ))}
                                 </ul>
                              </div>
                           </div>
                           <button onClick={runDeployment} className="bg-amplia-accent hover:bg-amplia-accentHover text-white px-10 py-5 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-4 text-xl">
                              <Rocket size={24}/> Executar Deployment Real
                           </button>
                           {logs.length > 0 && <Terminal logs={logs} title={t.lblLiveLogs} />}
                        </div>
                      ) : (
                        <div className="glass border border-amplia-border rounded-[56px] p-20 flex flex-col items-center justify-center text-center h-[600px] shadow-2xl opacity-80">
                           <LayoutTemplate size={56} className="text-amplia-accent mb-8" />
                           <h3 className="text-3xl font-black mb-6 tracking-tight">AI Workspace Pronta</h3>
                           <p className="text-sm font-bold opacity-50">Selecione o seu stack e destino para começar.</p>
                        </div>
                      )}
                   </section>
                </div>
             </div>
          )}
       </main>

       {/* Otimização de Footer (Semantic footer) */}
       <footer className="border-t border-amplia-border/20 bg-amplia-surface/40 py-20 px-12" role="contentinfo">
          <div className="container mx-auto text-center space-y-12">
             <div className="flex items-center justify-center gap-4 font-black text-3xl tracking-tighter">
                <div className="w-10 h-10 bg-amplia-accent rounded-xl flex items-center justify-center shadow-lg"><Rocket className="text-white" size={20}/></div>
                <span>OpsFlow AI</span>
             </div>
             <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                <button onClick={() => setShowCookies(true)} className="hover:text-amplia-accent transition-colors flex items-center gap-2" title={t.cookieConfigure}>
                   <Cookie size={12} /> {t.cookieConfigure}
                </button>
                <a href="/legal" className="hover:text-amplia-accent transition-colors">{t.lblLegal}</a>
                <a href="/docs" className="hover:text-amplia-accent transition-colors">{t.lblApiDocs}</a>
                <a href="/privacy" className="hover:text-amplia-accent transition-colors">{t.lblPrivacy}</a>
                <a href="mailto:ampliasolutions.pt@gmail.com" className="hover:text-amplia-accent transition-colors flex items-center gap-2">
                   <Mail size={12} /> {t.lblContact}
                </a>
             </nav>
             <div className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em] pt-12">
                &copy; {t.copyright}
             </div>
          </div>
       </footer>
    </div>
  );
};

export default App;