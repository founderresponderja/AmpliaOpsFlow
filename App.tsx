import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  Server, 
  Code, 
  Cpu, 
  ShieldCheck, 
  DollarSign, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  HelpCircle,
  X,
  Info
} from 'lucide-react';
import { ProjectType, DeploymentTarget, AppState, DeploymentConfig, LogEntry, Language } from './types';
import { generateDeploymentConfig, generateDeploymentLogs } from './services/geminiService';
import Terminal from './components/Terminal';
import FileViewer from './components/FileViewer';

// --- Localization Dictionary ---
const TRANSLATIONS = {
  en: {
    title: "OpsFlow",
    subtitle: "AI Deployment Assistant",
    heroTitle: "Deploy smarter, not harder.",
    heroDesc: "Let OpsFlow analyze your project requirements and generate production-ready deployment configurations tailored to your stack.",
    lblProjectType: "Project Type",
    lblTarget: "Deployment Target",
    lblDetails: "Project Details",
    lblDetailsPlaceholder: "E.g., Needs Redis, PostgreSQL database, environment variables for API keys...",
    lblDetailsHint: "Provide specific requirements to get the best configuration (min 10 chars).",
    btnGenerate: "Generate Configuration",
    loadingTitle: "Analyzing Requirements...",
    loadingDesc: "Gemini AI is crafting your deployment strategy.",
    sectionAnalysis: "Deployment Analysis",
    lblCost: "Estimated Monthly Cost",
    lblSecurity: "Security Rating",
    lblRecommendations: "Recommendations:",
    btnDeploy: "Proceed to Deploy",
    btnCancel: "Cancel & Modify Inputs",
    statusDeploying: "Deployment in Progress",
    statusSuccess: "Deployment Complete",
    statusFailed: "Deployment Failed",
    btnRestart: "Start New Deployment",
    msgSuccess: "Application is Live!",
    msgSuccessDesc: "Your application has been successfully provisioned and deployed to the target environment.",
    btnViewLive: "View Live App",
    errMissingKey: "API Key is missing. Please set process.env.API_KEY",
    errSelectType: "Please select a valid Project Type.",
    errSelectTarget: "Please select a valid Deployment Target.",
    errShortDetails: "Please provide more detailed project requirements (at least 10 characters).",
    errLongDetails: "Project details are too long (max 5000 characters).",
    errGenFailed: "Failed to generate configuration. Please try again.",
    // Help Mode
    btnHelp: "Help Guide",
    helpTitle: "OpsFlow Guide",
    helpContext: {
      INPUT: "Start here! Select your project's main technology (like Node.js or Python) and where you want to host it. In the 'Project Details' box, be as specific as possible. Mention databases (e.g., 'Requires PostgreSQL 14'), caching layers (Redis), or specific environment variables. The more detail you provide, the better the AI configuration.",
      GENERATING: "Sit tight! Our AI engine (Gemini) is currently analyzing your request. It's generating Dockerfiles, CI/CD workflows, and estimating cloud costs based on your parameters.",
      REVIEW: "Review time. On the right, you can see the actual code generated. Click the tabs to switch files. On the left, check the estimated monthly cost and security score. Read the recommendations carefully before proceeding.",
      DEPLOYING: "Simulation mode active. OpsFlow is simulating the deployment pipeline steps. Watch the terminal logs to see the build and deploy process in action.",
      SUCCESS: "Success! Your application deployment simulation is complete. In a real scenario, your app would now be live at the provided URL.",
      ERROR: "Something went wrong. Check the error logs in the terminal to understand what failed. You may need to adjust your project details and try again."
    }
  },
  pt: {
    title: "OpsFlow",
    subtitle: "Assistente de Implementação IA",
    heroTitle: "Implemente de forma inteligente.",
    heroDesc: "Deixe o OpsFlow analisar os requisitos do seu projeto e gerar configurações de implementação prontas para produção adaptadas à sua stack.",
    lblProjectType: "Tipo de Projeto",
    lblTarget: "Destino de Implementação",
    lblDetails: "Detalhes do Projeto",
    lblDetailsPlaceholder: "Ex: Necessita de Redis, base de dados PostgreSQL, variáveis de ambiente...",
    lblDetailsHint: "Forneça requisitos específicos para obter a melhor configuração (mín. 10 caracteres).",
    btnGenerate: "Gerar Configuração",
    loadingTitle: "A Analisar Requisitos...",
    loadingDesc: "A IA Gemini está a elaborar a sua estratégia de implementação.",
    sectionAnalysis: "Análise de Implementação",
    lblCost: "Custo Mensal Estimado",
    lblSecurity: "Classificação de Segurança",
    lblRecommendations: "Recomendações:",
    btnDeploy: "Proceder para Implementação",
    btnCancel: "Cancelar e Modificar",
    statusDeploying: "Implementação em Curso",
    statusSuccess: "Implementação Concluída",
    statusFailed: "Falha na Implementação",
    btnRestart: "Iniciar Nova Implementação",
    msgSuccess: "A Aplicação está Online!",
    msgSuccessDesc: "A sua aplicação foi provisionada e implementada com sucesso no ambiente de destino.",
    btnViewLive: "Ver Aplicação",
    errMissingKey: "A chave API está em falta. Por favor configure process.env.API_KEY",
    errSelectType: "Por favor selecione um Tipo de Projeto válido.",
    errSelectTarget: "Por favor selecione um Destino de Implementação válido.",
    errShortDetails: "Por favor forneça requisitos mais detalhados (pelo menos 10 caracteres).",
    errLongDetails: "Os detalhes do projeto são demasiado longos (máx. 5000 caracteres).",
    errGenFailed: "Falha ao gerar configuração. Por favor tente novamente.",
    // Help Mode
    btnHelp: "Guia de Ajuda",
    helpTitle: "Guia OpsFlow",
    helpContext: {
      INPUT: "Comece aqui! Selecione a tecnologia principal do seu projeto (como Node.js ou Python) e onde deseja alojá-lo. Na caixa 'Detalhes do Projeto', seja o mais específico possível. Mencione bases de dados (ex: 'Requer PostgreSQL 14'), camadas de cache (Redis) ou variáveis de ambiente específicas. Quanto mais detalhes fornecer, melhor será a configuração da IA.",
      GENERATING: "Aguarde! O nosso motor de IA (Gemini) está a analisar o seu pedido. Está a gerar Dockerfiles, workflows de CI/CD e a estimar custos de nuvem com base nos seus parâmetros.",
      REVIEW: "Hora de rever. À direita, pode ver o código real gerado. Clique nas abas para alternar ficheiros. À esquerda, verifique o custo mensal estimado e a pontuação de segurança. Leia as recomendações cuidadosamente antes de prosseguir.",
      DEPLOYING: "Modo de simulação ativo. O OpsFlow está a simular os passos da pipeline de implementação. Observe os logs do terminal para ver o processo de build e deploy em ação.",
      SUCCESS: "Sucesso! A simulação da implementação da sua aplicação está completa. Num cenário real, a sua app estaria agora online no URL fornecido.",
      ERROR: "Algo correu mal. Verifique os logs de erro no terminal para entender o que falhou. Pode ser necessário ajustar os detalhes do seu projeto e tentar novamente."
    }
  },
  es: {
    title: "OpsFlow",
    subtitle: "Asistente de Despliegue IA",
    heroTitle: "Despliegue de forma inteligente.",
    heroDesc: "Deje que OpsFlow analice los requisitos de su proyecto y genere configuraciones de despliegue listas para producción adaptadas a su stack.",
    lblProjectType: "Tipo de Proyecto",
    lblTarget: "Objetivo de Despliegue",
    lblDetails: "Detalles del Proyecto",
    lblDetailsPlaceholder: "Ej: Necesita Redis, base de datos PostgreSQL, variables de entorno...",
    lblDetailsHint: "Proporcione requisitos específicos para obtener la mejor configuración (mín. 10 caracteres).",
    btnGenerate: "Generar Configuración",
    loadingTitle: "Analizando Requisitos...",
    loadingDesc: "La IA Gemini está elaborando su estrategia de despliegue.",
    sectionAnalysis: "Análisis de Despliegue",
    lblCost: "Costo Mensual Estimado",
    lblSecurity: "Calificación de Seguridad",
    lblRecommendations: "Recomendaciones:",
    btnDeploy: "Proceder al Despliegue",
    btnCancel: "Cancelar y Modificar",
    statusDeploying: "Despliegue en Progreso",
    statusSuccess: "Despliegue Completado",
    statusFailed: "Fallo en el Despliegue",
    btnRestart: "Iniciar Nuevo Despliegue",
    msgSuccess: "¡La Aplicación está en Vivo!",
    msgSuccessDesc: "Su aplicación ha sido aprovisionada y desplegada con éxito en el entorno de destino.",
    btnViewLive: "Ver Aplicación",
    errMissingKey: "Falta la clave API. Por favor configure process.env.API_KEY",
    errSelectType: "Por favor seleccione un Tipo de Proyecto válido.",
    errSelectTarget: "Por favor seleccione un Objetivo de Despliegue válido.",
    errShortDetails: "Por favor proporcione requisitos más detallados (al menos 10 caracteres).",
    errLongDetails: "Los detalles del proyecto son demasiado largos (máx. 5000 caracteres).",
    errGenFailed: "Fallo al generar la configuración. Por favor inténtelo de nuevo.",
    // Help Mode
    btnHelp: "Guía de Ayuda",
    helpTitle: "Guía OpsFlow",
    helpContext: {
      INPUT: "¡Empiece aquí! Seleccione la tecnología principal de su proyecto (como Node.js o Python) y dónde desea alojarlo. En el cuadro 'Detalles del Proyecto', sea lo más específico posible. Mencione bases de datos (ej: 'Requiere PostgreSQL 14'), capas de caché (Redis) o variables de entorno específicas. Cuantos más detalles proporcione, mejor será la configuración de la IA.",
      GENERATING: "¡Espere! Nuestro motor de IA (Gemini) está analizando su solicitud. Está generando Dockerfiles, flujos de trabajo de CI/CD y estimando costos en la nube basados en sus parámetros.",
      REVIEW: "Hora de revisar. A la derecha, puede ver el código real generado. Haga clic en las pestañas para cambiar de archivo. A la izquierda, verifique el costo mensual estimado y la puntuación de seguridad. Lea las recomendaciones cuidadosamente antes de continuar.",
      DEPLOYING: "Modo de simulación activo. OpsFlow está simulando los pasos del pipeline de despliegue. Observe los registros de la terminal para ver el proceso de compilación y despliegue en acción.",
      SUCCESS: "¡Éxito! La simulación del despliegue de su aplicación está completa. En un escenario real, su aplicación estaría ahora en línea en la URL proporcionada.",
      ERROR: "Algo salió mal. Verifique los registros de error en la terminal para entender qué falló. Es posible que deba ajustar los detalles de su proyecto e intentarlo de nuevo."
    }
  }
};

const App: React.FC = () => {
  // State
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [lang, setLang] = useState<Language>('en');
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.NODE);
  const [target, setTarget] = useState<DeploymentTarget>(DeploymentTarget.DOCKER);
  const [projectDetails, setProjectDetails] = useState("");
  const [config, setConfig] = useState<DeploymentConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Focus Refs
  const mainHeadingRef = useRef<HTMLHeadingElement>(null);
  const generatingRef = useRef<HTMLHeadingElement>(null);
  const reviewRef = useRef<HTMLHeadingElement>(null);
  const deployRef = useRef<HTMLHeadingElement>(null);

  const t = TRANSLATIONS[lang];

  // Focus Management
  useEffect(() => {
    const timer = setTimeout(() => {
      if (appState === AppState.INPUT) mainHeadingRef.current?.focus();
      if (appState === AppState.GENERATING) generatingRef.current?.focus();
      if (appState === AppState.REVIEW) reviewRef.current?.focus();
      if (appState === AppState.DEPLOYING || appState === AppState.SUCCESS || appState === AppState.ERROR) deployRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [appState]);

  // Handlers
  const handleGenerateConfig = async () => {
    if (!process.env.API_KEY) {
      alert(t.errMissingKey);
      return;
    }

    // Input Validation
    setErrorMsg(null);

    if (!projectType || !Object.values(ProjectType).includes(projectType)) {
      setErrorMsg(t.errSelectType);
      return;
    }

    if (!target || !Object.values(DeploymentTarget).includes(target)) {
      setErrorMsg(t.errSelectTarget);
      return;
    }

    const cleanedDetails = projectDetails.trim();
    if (cleanedDetails.length < 10) {
      setErrorMsg(t.errShortDetails);
      return;
    }

    if (cleanedDetails.length > 5000) {
      setErrorMsg(t.errLongDetails);
      return;
    }

    setAppState(AppState.GENERATING);
    
    try {
      const result = await generateDeploymentConfig(projectType, target, cleanedDetails, lang);
      setConfig(result);
      setAppState(AppState.REVIEW);
    } catch (e) {
      setErrorMsg(t.errGenFailed);
      setAppState(AppState.INPUT);
    }
  };

  const handleDeploy = async () => {
    setAppState(AppState.DEPLOYING);
    setLogs([]);

    try {
      // 1. Get Log steps from AI
      const logSteps = await generateDeploymentLogs(projectType, target, lang);
      
      // 2. Simulate streaming logs
      let currentStep = 0;
      
      const interval = setInterval(() => {
        if (currentStep >= logSteps.length) {
          clearInterval(interval);
          setAppState(AppState.SUCCESS);
          return;
        }

        const msg = logSteps[currentStep];
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'pt-PT', { hour12: false }),
          level: currentStep === logSteps.length - 1 ? 'success' : 'info',
          message: msg
        }]);

        currentStep++;
      }, 1500); 

    } catch (e) {
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
        message: 'Deployment simulation failed.'
      }]);
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.INPUT);
    setConfig(null);
    setLogs([]);
    setProjectDetails("");
    setErrorMsg(null);
  };

  // Get current help text based on state
  const getCurrentHelpText = () => {
    switch(appState) {
      case AppState.INPUT: return t.helpContext.INPUT;
      case AppState.GENERATING: return t.helpContext.GENERATING;
      case AppState.REVIEW: return t.helpContext.REVIEW;
      case AppState.DEPLOYING: return t.helpContext.DEPLOYING;
      case AppState.SUCCESS: return t.helpContext.SUCCESS;
      case AppState.ERROR: return t.helpContext.ERROR;
      default: return t.helpContext.INPUT;
    }
  };

  return (
    <div className="min-h-screen bg-amplia-bg text-amplia-text flex flex-col font-sans selection:bg-amplia-accent selection:text-amplia-bg overflow-x-hidden">
      
      {/* Help Overlay Backdrop */}
      {showHelp && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity animate-fade-in" 
          onClick={() => setShowHelp(false)}
          aria-hidden="true"
        />
      )}

      {/* Help Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 w-80 bg-amplia-surface border-l border-amplia-border shadow-2xl transform transition-transform duration-300 ease-in-out z-[60] flex flex-col ${showHelp ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-labelledby="help-title"
        aria-modal="true"
      >
        <div className="p-6 border-b border-amplia-border flex items-center justify-between bg-amplia-bg/50">
          <h2 id="help-title" className="text-xl font-bold text-white flex items-center gap-2">
            <Info size={20} className="text-amplia-accent" />
            {t.helpTitle}
          </h2>
          <button 
            onClick={() => setShowHelp(false)}
            className="text-amplia-textDim hover:text-white hover:bg-amplia-border/50 rounded-full p-1 transition-colors"
            aria-label="Close Help"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-amplia-bg border border-amplia-border rounded-lg p-4 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amplia-accent/10 rounded-bl-full -mr-4 -mt-4"></div>
            <h3 className="text-sm font-bold text-amplia-accent uppercase tracking-wider mb-2">Current Step</h3>
            <p className="text-white leading-relaxed text-sm">
              {getCurrentHelpText()}
            </p>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold text-amplia-textDim uppercase tracking-wider">Tips</h3>
             <ul className="space-y-3">
               <li className="flex gap-3 text-sm text-amplia-textDim">
                 <div className="w-1.5 h-1.5 rounded-full bg-amplia-success mt-1.5 shrink-0"></div>
                 <span>Be specific about versions (e.g., Node 18, Python 3.9) to avoid build errors.</span>
               </li>
               <li className="flex gap-3 text-sm text-amplia-textDim">
                 <div className="w-1.5 h-1.5 rounded-full bg-amplia-success mt-1.5 shrink-0"></div>
                 <span>Review the generated Dockerfile carefully; Gemini provides a solid base, but production may need tweaks.</span>
               </li>
               <li className="flex gap-3 text-sm text-amplia-textDim">
                 <div className="w-1.5 h-1.5 rounded-full bg-amplia-success mt-1.5 shrink-0"></div>
                 <span>Security ratings are estimates. Always audit your dependencies.</span>
               </li>
             </ul>
          </div>
        </div>
        <div className="p-4 border-t border-amplia-border bg-amplia-bg/50 text-center">
          <p className="text-xs text-amplia-textDim">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-amplia-border bg-amplia-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amplia-accent rounded-lg p-1 group" 
            onClick={reset}
            aria-label="Reset to Home"
          >
            <div className="flex items-center gap-3">
               {/* OpsFlow Logo / Amplia Branding */}
               <div className="relative group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-amplia-accent/20 blur-lg rounded-full opacity-50"></div>
                  {/* Custom Amplia Sparkle (AI) Logo */}
                  <svg className="w-8 h-8 text-amplia-accent relative z-10 drop-shadow-[0_0_8px_rgba(168,199,250,0.6)]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
                  </svg>
               </div>
               <span className="text-xl tracking-tight text-white font-sans font-medium">Amplia<span className="text-amplia-accent font-normal opacity-90">OpsFlow</span></span>
            </div>
          </button>
          
          <div className="flex items-center gap-4">
             {/* Help Button */}
             <button
               onClick={() => setShowHelp(!showHelp)}
               className={`p-2 rounded-full transition-all flex items-center gap-2 text-sm font-medium ${showHelp ? 'bg-amplia-accent text-amplia-bg' : 'text-amplia-textDim hover:text-white hover:bg-amplia-surface'}`}
               aria-label={t.btnHelp}
             >
               <HelpCircle size={20} />
               <span className="hidden md:inline">{t.btnHelp}</span>
             </button>

             {/* Language Switcher */}
             <div className="flex items-center bg-amplia-surface rounded-full border border-amplia-border p-1">
                <button 
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === 'en' ? 'bg-amplia-border text-white' : 'text-amplia-textDim hover:text-white'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLang('pt')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === 'pt' ? 'bg-amplia-border text-white' : 'text-amplia-textDim hover:text-white'}`}
                >
                  PT
                </button>
                <button 
                  onClick={() => setLang('es')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${lang === 'es' ? 'bg-amplia-border text-white' : 'text-amplia-textDim hover:text-white'}`}
                >
                  ES
                </button>
             </div>
             <div className="hidden md:block text-sm text-amplia-textDim border-l border-amplia-border pl-4">
                {t.subtitle}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {errorMsg && (
          <div 
            role="alert" 
            aria-live="assertive" 
            className="mb-6 p-4 bg-amplia-error/10 border border-amplia-error/50 rounded-lg flex items-center gap-3 text-amplia-error animate-fade-in"
          >
            <AlertTriangle size={20} className="shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* --- STEP 1: INPUT --- */}
        {appState === AppState.INPUT && (
          <div className="max-w-2xl mx-auto animate-fade-in mt-12">
            <div className="text-center mb-12">
              <h1 
                ref={mainHeadingRef}
                id="step-input-heading"
                className="text-5xl font-bold text-white mb-6 outline-none tracking-tight leading-tight"
                tabIndex={-1}
              >
                {t.heroTitle}
              </h1>
              <p className="text-amplia-textDim text-lg max-w-xl mx-auto leading-relaxed">
                {t.heroDesc}
              </p>
            </div>

            <div className="bg-amplia-surface border border-amplia-border rounded-2xl p-8 shadow-2xl shadow-black/50">
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="project-type" className="text-sm font-medium text-amplia-textDim">{t.lblProjectType}</label>
                    <div className="relative group">
                      <Code className="absolute left-3 top-3 text-amplia-textDim group-focus-within:text-amplia-accent transition-colors w-5 h-5" aria-hidden="true" />
                      <select 
                        id="project-type"
                        className="w-full bg-amplia-bg border border-amplia-border rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amplia-accent focus:border-transparent outline-none appearance-none transition-all"
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value as ProjectType)}
                      >
                        {Object.values(ProjectType).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="deployment-target" className="text-sm font-medium text-amplia-textDim">{t.lblTarget}</label>
                    <div className="relative group">
                      <Server className="absolute left-3 top-3 text-amplia-textDim group-focus-within:text-amplia-accent transition-colors w-5 h-5" aria-hidden="true" />
                      <select 
                        id="deployment-target"
                        className="w-full bg-amplia-bg border border-amplia-border rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amplia-accent focus:border-transparent outline-none appearance-none transition-all"
                        value={target}
                        onChange={(e) => setTarget(e.target.value as DeploymentTarget)}
                      >
                        {Object.values(DeploymentTarget).map(target => (
                          <option key={target} value={target}>{target}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="project-details" className="text-sm font-medium text-amplia-textDim">
                      {t.lblDetails} <span className="text-amplia-error" aria-label="required">*</span>
                    </label>
                    <span className="text-xs text-amplia-textDim" aria-label={`${projectDetails.length} characters out of 5000`}>{projectDetails.length}/5000</span>
                  </div>
                  <textarea 
                    id="project-details"
                    className={`w-full bg-amplia-bg border rounded-lg p-4 text-white focus:ring-2 focus:ring-amplia-accent outline-none h-32 resize-none placeholder-amplia-textDim/30 transition-all ${
                      errorMsg && errorMsg.includes("details") ? "border-amplia-error focus:border-amplia-error" : "border-amplia-border focus:border-transparent"
                    }`}
                    placeholder={t.lblDetailsPlaceholder}
                    value={projectDetails}
                    onChange={(e) => setProjectDetails(e.target.value)}
                    maxLength={5000}
                    aria-required="true"
                    aria-invalid={!!(errorMsg && errorMsg.includes("details"))}
                  />
                  <p className="text-xs text-amplia-textDim">{t.lblDetailsHint}</p>
                </div>

                <button 
                  onClick={handleGenerateConfig}
                  className="w-full bg-amplia-accent hover:bg-amplia-accentHover text-amplia-bg font-bold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(168,199,250,0.2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amplia-accent focus:ring-offset-amplia-bg mt-2"
                >
                  <Cpu size={18} aria-hidden="true" />
                  {t.btnGenerate}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: GENERATING --- */}
        {appState === AppState.GENERATING && (
          <div 
            className="flex flex-col items-center justify-center h-[60vh] animate-fade-in" 
            role="status" 
            aria-live="polite"
          >
            <div className="relative">
               <div className="absolute inset-0 bg-amplia-accent/20 blur-xl rounded-full"></div>
               <Loader2 className="w-16 h-16 text-amplia-accent animate-spin mb-8 relative z-10" aria-hidden="true" />
            </div>
            <h2 
              ref={generatingRef}
              className="text-3xl font-semibold text-white outline-none" 
              tabIndex={-1}
            >
              {t.loadingTitle}
            </h2>
            <p className="text-amplia-textDim mt-3 text-lg">{t.loadingDesc}</p>
          </div>
        )}

        {/* --- STEP 3: REVIEW --- */}
        {appState === AppState.REVIEW && config && (
          <div className="h-full flex flex-col lg:flex-row gap-8 animate-fade-in">
            {/* Sidebar / Info */}
            <div className="lg:w-1/3 space-y-6">
              <div className="bg-amplia-surface border border-amplia-border rounded-xl p-6 shadow-lg">
                <h3 
                  ref={reviewRef}
                  className="text-lg font-semibold text-white mb-6 outline-none flex items-center gap-2"
                  tabIndex={-1}
                  id="step-review-heading"
                >
                  <div className="w-1 h-6 bg-amplia-accent rounded-full"></div>
                  {t.sectionAnalysis}
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amplia-bg rounded-lg text-amplia-success border border-amplia-border" aria-hidden="true">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amplia-textDim font-bold mb-1">{t.lblCost}</p>
                      <p className="font-mono text-white text-lg">{config.estimatedCost}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amplia-bg rounded-lg text-amplia-accent border border-amplia-border" aria-hidden="true">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amplia-textDim font-bold mb-1">{t.lblSecurity}</p>
                      <p className="font-mono text-white text-lg">{config.securityRating}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-amplia-border">
                  <p className="text-sm font-bold text-amplia-textDim mb-3 uppercase tracking-wider">{t.lblRecommendations}</p>
                  <ul className="space-y-3">
                    {config.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-amplia-text leading-relaxed flex items-start gap-3">
                        <span className="text-amplia-accent mt-1.5 w-1.5 h-1.5 rounded-full bg-amplia-accent shrink-0" aria-hidden="true"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button 
                onClick={handleDeploy}
                className="w-full bg-amplia-success hover:bg-green-400 text-amplia-bg font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(129,201,149,0.2)] text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amplia-success focus:ring-offset-amplia-bg"
              >
                {t.btnDeploy}
                <ArrowRight size={20} aria-hidden="true" />
              </button>
              
              <button 
                onClick={() => setAppState(AppState.INPUT)}
                className="w-full text-amplia-textDim hover:text-white py-2 text-sm transition-colors focus:outline-none focus:underline"
              >
                {t.btnCancel}
              </button>
            </div>

            {/* Code Viewer */}
            <div className="lg:w-2/3 h-[650px] shadow-2xl rounded-lg overflow-hidden border border-amplia-border">
              <FileViewer files={config.files} />
            </div>
          </div>
        )}

        {/* --- STEP 4 & 5: DEPLOYING / SUCCESS --- */}
        {(appState === AppState.DEPLOYING || appState === AppState.SUCCESS || appState === AppState.ERROR) && (
          <div className="max-w-4xl mx-auto h-[600px] flex flex-col gap-6 animate-fade-in mt-8">
             <div className="flex items-center justify-between">
                <h2 
                  ref={deployRef}
                  className="text-2xl font-bold text-white flex items-center gap-3 outline-none"
                  tabIndex={-1}
                  id="step-deploy-heading"
                >
                  {appState === AppState.DEPLOYING && <Loader2 className="animate-spin text-amplia-accent" aria-hidden="true" />}
                  {appState === AppState.SUCCESS && <CheckCircle className="text-amplia-success" aria-hidden="true" />}
                  {appState === AppState.ERROR && <AlertTriangle className="text-amplia-error" aria-hidden="true" />}
                  
                  {appState === AppState.DEPLOYING ? t.statusDeploying : 
                   appState === AppState.SUCCESS ? t.statusSuccess : t.statusFailed}
                </h2>
                {appState !== AppState.DEPLOYING && (
                  <button onClick={reset} className="text-sm text-amplia-textDim hover:text-white underline focus:outline-none focus:text-white">
                    {t.btnRestart}
                  </button>
                )}
             </div>

             <div className="flex-1 shadow-2xl rounded-lg overflow-hidden border border-amplia-border">
               <Terminal logs={logs} title={t.sectionAnalysis} />
             </div>

             {appState === AppState.SUCCESS && (
               <div className="bg-amplia-success/10 border border-amplia-success/30 rounded-lg p-8 text-center animate-fade-in">
                 <h3 className="text-amplia-success font-bold text-xl mb-2">{t.msgSuccess}</h3>
                 <p className="text-amplia-textDim mb-6 max-w-md mx-auto">{t.msgSuccessDesc}</p>
                 <a href="#" className="inline-flex items-center gap-2 text-amplia-bg bg-amplia-success hover:bg-green-400 px-6 py-3 rounded-lg transition-colors text-base font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amplia-success focus:ring-offset-amplia-bg">
                   {t.btnViewLive} <ArrowRight size={18} aria-hidden="true" />
                 </a>
               </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;