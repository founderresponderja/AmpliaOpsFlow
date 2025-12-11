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
  Info,
  Lock,
  CreditCard,
  User as UserIcon,
  LogOut,
  Crown,
  Check,
  Zap,
  Layout,
  Terminal as TerminalIcon,
  Sun,
  Moon,
  ChevronDown,
  History,
  Calendar,
  Clock,
  Github,
  GitBranch,
  FileText,
  Bot,
  Wrench,
  RefreshCw,
  Bug,
  LayoutTemplate,
  Search
} from 'lucide-react';
import { ProjectType, DeploymentTarget, AppState, DeploymentConfig, LogEntry, Language, User, PlanTier, Plan, AuthView, DeploymentRecord, ErrorAnalysis } from './types';
import { generateDeploymentConfig, generateDeploymentLogs, analyzeDeploymentError, analyzeRepo } from './services/geminiService';
import Terminal from './components/Terminal';
import FileViewer from './components/FileViewer';
import SelectInput from './components/SelectInput';

// --- PLANS CONFIGURATION ---
const PLANS: Record<PlanTier, Plan> = {
  TRIAL: {
    id: 'TRIAL',
    name: 'Free Trial',
    price: 0,
    deploymentsPerMonth: 2,
    features: ['2 Deployments/mo', 'Community Support', 'Basic Docker Config']
  },
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    price: 9.99,
    deploymentsPerMonth: 10,
    features: ['10 Deployments/mo', 'Email Support', 'Standard Security Scan']
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 24.99,
    deploymentsPerMonth: 30,
    features: ['30 Deployments/mo', 'Priority Support', 'Advanced Security', 'Cost Optimization']
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    price: 49.99,
    deploymentsPerMonth: 75,
    features: ['75 Deployments/mo', '24/7 Dedicated Support', 'Enterprise Security', 'Custom Pipelines']
  }
};

// --- DEPLOYMENT TEMPLATES ---
const DEPLOYMENT_TEMPLATES = [
  {
    id: 'react-vercel',
    name: 'React on Vercel',
    type: ProjectType.REACT,
    target: DeploymentTarget.VERCEL,
    details: "Standard React Single Page Application (SPA) built with Vite. Needs high-performance static asset serving, client-side routing support, and basic CI/CD for automatic deployments."
  },
  {
    id: 'node-do',
    name: 'Node API on Droplet',
    type: ProjectType.NODE,
    target: DeploymentTarget.DIGITALOCEAN,
    details: "Express.js REST API backend. Requires a Dockerfile for containerization, exposing port 3000, environment variable configuration for DB connections, and Nginx reverse proxy setup."
  },
  {
    id: 'python-aws',
    name: 'Python on AWS',
    type: ProjectType.PYTHON,
    target: DeploymentTarget.AWS,
    details: "Production-ready Flask or Django application deployed to AWS Elastic Beanstalk. Needs `requirements.txt` dependency management, WSGI entry point configuration (Gunicorn), and static file handling."
  }
];

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
    errInvalidUrl: "Please enter a valid Git repository URL.",
    // Help Mode
    btnHelp: "Help Guide",
    helpTitle: "OpsFlow Guide",
    helpContext: {
      INPUT: "Start here! Select your project's main technology (like Node.js or Python) and where you want to host it. In the 'Project Details' box, be as specific as possible.",
      GENERATING: "Sit tight! Our AI engine (Gemini) is currently analyzing your request.",
      REVIEW: "Review time. On the right, you can see the actual code generated. Click the tabs to switch files.",
      DEPLOYING: "Simulation mode active. OpsFlow is simulating the deployment pipeline steps.",
      SUCCESS: "Success! Your application deployment simulation is complete.",
      ERROR: "Something went wrong. Check the error logs."
    },
    // Auth & Billing
    loginTitle: "Welcome Back",
    loginDesc: "Sign in to manage your deployments",
    registerTitle: "Create Account",
    registerDesc: "Start deploying with AI today",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "Password",
    btnLogin: "Sign In",
    btnRegister: "Create Account",
    switchRegister: "No account? Sign up",
    switchLogin: "Have an account? Sign in",
    pricingTitle: "Choose Your Plan",
    pricingDesc: "Scale your DevOps capabilities with our flexible pricing.",
    currentPlan: "Current Plan",
    upgrade: "Upgrade",
    deploymentsLeft: "deployments left",
    limitReached: "Limit Reached",
    limitReachedDesc: "You have used all your deployments for this month. Upgrade to continue.",
    paymentTitle: "Secure Payment",
    payBtn: "Pay",
    processing: "Processing...",
    perMonth: "/month",
    // FAQ
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Everything you need to know about OpsFlow.",
    faqItems: [
      {
        q: "What deployment targets does OpsFlow support?",
        a: "We currently support AWS Elastic Beanstalk, DigitalOcean Droplets, Vercel for frontend projects, and generic Docker servers. We are constantly adding more integrations."
      },
      {
        q: "Is the generated code production-ready?",
        a: "Yes! OpsFlow uses Google's advanced Gemini models to generate configuration files that follow industry best practices. However, we always recommend reviewing the code before deploying to critical production environments."
      },
      {
        q: "How does the pricing work?",
        a: "We offer a free trial that includes 2 deployments per month. For more frequent usage and advanced security features, you can upgrade to our Basic, Pro, or Premium plans."
      },
      {
        q: "Do you store my source code?",
        a: "No. OpsFlow analyzes the project details and requirements you provide in the text field. We do not require access to your git repositories or source code files."
      },
      {
        q: "Can I export the generated files?",
        a: "Absolutely. During the review phase, you can copy the content of Dockerfiles, Nginx configs, and other generated assets to use directly in your project."
      }
    ],
    // Landing
    landingHero: "From Code to Cloud in Seconds.",
    landingSub: "The AI-powered DevOps engineer that generates Dockerfiles, CI/CD pipelines, and cloud configurations instantly.",
    ctaStart: "Start for Free",
    ctaLogin: "Login",
    feat1Title: "AI Configuration",
    feat1Desc: "Automatically generates Dockerfiles and Nginx configs tailored to your specific code logic.",
    feat2Title: "Security First",
    feat2Desc: "Scans for vulnerabilities and suggests security best practices before you deploy.",
    feat3Title: "Cost Estimation",
    feat3Desc: "Predicts monthly cloud costs for AWS, DigitalOcean, and more before you commit.",
    // History
    historyTitle: "Deployment History",
    historyEmpty: "No deployments yet. Start your first deployment!",
    colDate: "Date",
    colProject: "Project",
    colTarget: "Target",
    colStatus: "Status",
    colCost: "Est. Cost",
    btnBack: "Back",
    // Git
    tabManual: "Manual Input",
    tabGit: "Git Repository",
    lblRepoUrl: "Repository URL",
    lblBranch: "Branch",
    phRepoUrl: "https://github.com/username/repo",
    phBranch: "main",
    lblGitContext: "Additional Context (Optional)",
    // Assistant
    lblSimulateFailure: "Simulate Failure (For Testing)",
    agentTitle: "OpsFlow Agent",
    agentDesc: "I detected an error in your deployment.",
    btnAnalyze: "Analyze Error",
    agentDiagnosing: "Diagnosing logs...",
    agentSolution: "Suggested Solution",
    btnApplyFix: "Apply Fix & Retry",
    lblDiagnosis: "Diagnosis",
    // Templates
    lblTemplates: "Quick Start Templates",
    // Scan
    btnScan: "Scan & Analyze",
    scanning: "Scanning...",
    errRepoScan: "Failed to scan repo."
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
    errInvalidUrl: "Por favor insira um URL de repositório Git válido.",
    // Help Mode
    btnHelp: "Guia de Ajuda",
    helpTitle: "Guia OpsFlow",
    helpContext: {
      INPUT: "Comece aqui! Selecione a tecnologia principal do seu projeto e onde deseja alojá-lo. Seja específico nos detalhes.",
      GENERATING: "Aguarde! O nosso motor de IA (Gemini) está a analisar o seu pedido.",
      REVIEW: "Hora de rever. À direita, pode ver o código real gerado.",
      DEPLOYING: "Modo de simulação ativo. O OpsFlow está a simular os passos da pipeline.",
      SUCCESS: "Sucesso! A simulação da implementação está completa.",
      ERROR: "Algo correu mal. Verifique os logs de erro."
    },
    // Auth & Billing
    loginTitle: "Bem-vindo de Volta",
    loginDesc: "Entre para gerir as suas implementações",
    registerTitle: "Criar Conta",
    registerDesc: "Comece a implementar com IA hoje",
    emailPlaceholder: "nome@empresa.com",
    passwordPlaceholder: "Palavra-passe",
    btnLogin: "Entrar",
    btnRegister: "Criar Conta",
    switchRegister: "Sem conta? Registe-se",
    switchLogin: "Tem conta? Entre",
    pricingTitle: "Escolha o seu Plano",
    pricingDesc: "Escale as suas capacidades DevOps com os nossos preços flexíveis.",
    currentPlan: "Plano Atual",
    upgrade: "Melhorar",
    deploymentsLeft: "implementações restantes",
    limitReached: "Limite Atingido",
    limitReachedDesc: "Usou todas as implementações deste mês. Faça upgrade para continuar.",
    paymentTitle: "Pagamento Seguro",
    payBtn: "Pagar",
    processing: "A processar...",
    perMonth: "/mês",
    // FAQ
    faqTitle: "Perguntas Frequentes",
    faqSubtitle: "Tudo o que precisa de saber sobre o OpsFlow.",
    faqItems: [
      {
        q: "Que destinos de implementação o OpsFlow suporta?",
        a: "Atualmente suportamos AWS Elastic Beanstalk, DigitalOcean Droplets, Vercel para frontend e servidores Docker genéricos. Estamos constantemente a adicionar mais integrações."
      },
      {
        q: "O código gerado está pronto para produção?",
        a: "Sim! O OpsFlow utiliza os modelos avançados Gemini da Google para gerar ficheiros de configuração que seguem as melhores práticas da indústria. No entanto, recomendamos sempre rever o código."
      },
      {
        q: "Como funciona o preço?",
        a: "Oferecemos um teste gratuito que inclui 2 implementações por mês. Para uso mais frequente e funcionalidades de segurança avançadas, pode atualizar para os planos Básico, Pro ou Premium."
      },
      {
        q: "Armazenam o meu código fonte?",
        a: "Não. O OpsFlow analisa os detalhes do projeto e requisitos que fornece no campo de texto. Não exigimos acesso aos seus repositórios git."
      },
      {
        q: "Posso exportar os ficheiros gerados?",
        a: "Absolutamente. Durante a fase de revisão, pode copiar o conteúdo dos Dockerfiles, configs Nginx e outros recursos gerados para usar diretamente no seu projeto."
      }
    ],
    // Landing
    landingHero: "Do Código à Cloud em Segundos.",
    landingSub: "O engenheiro DevOps com IA que gera Dockerfiles, pipelines CI/CD e configurações cloud instantaneamente.",
    ctaStart: "Começar Grátis",
    ctaLogin: "Entrar",
    feat1Title: "Configuração IA",
    feat1Desc: "Gera automaticamente Dockerfiles e configs Nginx adaptadas à lógica do seu código.",
    feat2Title: "Segurança Primeiro",
    feat2Desc: "Verifica vulnerabilidades e sugere melhores práticas de segurança antes de implementar.",
    feat3Title: "Estimativa de Custos",
    feat3Desc: "Prevê custos mensais de cloud para AWS, DigitalOcean e mais antes de se comprometer.",
    // History
    historyTitle: "Histórico de Implementações",
    historyEmpty: "Ainda sem implementações. Comece a sua primeira!",
    colDate: "Data",
    colProject: "Projeto",
    colTarget: "Destino",
    colStatus: "Estado",
    colCost: "Custo Est.",
    btnBack: "Voltar",
    // Git
    tabManual: "Entrada Manual",
    tabGit: "Repositório Git",
    lblRepoUrl: "URL do Repositório",
    lblBranch: "Branch",
    phRepoUrl: "https://github.com/utilizador/repo",
    phBranch: "main",
    lblGitContext: "Contexto Adicional (Opcional)",
    // Assistant
    lblSimulateFailure: "Simular Falha (Para Teste)",
    agentTitle: "Agente OpsFlow",
    agentDesc: "Detetei um erro na sua implementação.",
    btnAnalyze: "Analisar Erro",
    agentDiagnosing: "A diagnosticar logs...",
    agentSolution: "Solução Sugerida",
    btnApplyFix: "Aplicar Correção e Tentar",
    lblDiagnosis: "Diagnóstico",
    // Templates
    lblTemplates: "Modelos de Início Rápido",
    // Scan
    btnScan: "Analisar e Preencher",
    scanning: "A analisar...",
    errRepoScan: "Falha ao analisar repositório."
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
    errLongDetails: "Los detalles do projeto são demasiado longos (máx. 5000 caracteres).",
    errGenFailed: "Fallo al generar la configuración. Por favor inténtelo de nuevo.",
    errInvalidUrl: "Por favor ingrese una URL de repositorio Git válida.",
    // Help Mode
    btnHelp: "Guía de Ayuda",
    helpTitle: "Guía OpsFlow",
    helpContext: {
      INPUT: "¡Empiece aquí! Selecione la tecnología principal y dónde desea alojarlo. Sea específico.",
      GENERATING: "¡Espere! Nuestro motor de IA (Gemini) está analizando su solicitud.",
      REVIEW: "Hora de revisar. A la derecha, puede ver el código real generado.",
      DEPLOYING: "Modo de simulación activo. OpsFlow está simulando el pipeline.",
      SUCCESS: "¡Éxito! La simulación del despliegue está completa.",
      ERROR: "Algo salió mal. Verifique los registros."
    },
    // Auth & Billing
    loginTitle: "Bienvenido de Nuevo",
    loginDesc: "Inicie sesión para gestionar sus despliegues",
    registerTitle: "Crear Cuenta",
    registerDesc: "Comience a desplegar con IA hoy",
    emailPlaceholder: "nombre@empresa.com",
    passwordPlaceholder: "Contraseña",
    btnLogin: "Iniciar Sesión",
    btnRegister: "Crear Cuenta",
    switchRegister: "¿Sin cuenta? Regístrese",
    switchLogin: "¿Tiene cuenta? Inicie sesión",
    pricingTitle: "Elija su Plan",
    pricingDesc: "Escale sus capacidades DevOps con nuestros precios flexibles.",
    currentPlan: "Plan Actual",
    upgrade: "Mejorar",
    deploymentsLeft: "despliegues restantes",
    limitReached: "Límite Alcanzado",
    limitReachedDesc: "Ha usado todos los despliegues de este mes. Mejore para continuar.",
    paymentTitle: "Pago Seguro",
    payBtn: "Pagar",
    processing: "Procesando...",
    perMonth: "/mes",
    // FAQ
    faqTitle: "Preguntas Frecuentes",
    faqSubtitle: "Todo lo que necesita saber sobre OpsFlow.",
    faqItems: [
      {
        q: "¿Qué objetivos de despliegue admite OpsFlow?",
        a: "Actualmente admitimos AWS Elastic Beanstalk, DigitalOcean Droplets, Vercel y servidores Docker genéricos. Estamos agregando más integraciones constantemente."
      },
      {
        q: "¿El código generado está listo para producción?",
        a: "¡Sí! OpsFlow utiliza modelos Gemini avanzados para generar archivos de configuración que siguen las mejores prácticas. Sin embargo, siempre recomendamos revisar el código."
      },
      {
        q: "¿Cómo funcionan los precios?",
        a: "Ofrecemos una prueba gratuita con 2 despliegues al mes. Para un uso más frecuente y funciones de seguridad avanzadas, puede actualizar a los planes Básico, Pro o Premium."
      },
      {
        q: "¿Almacenan mi código fuente?",
        a: "No. OpsFlow analiza los detalles del proyecto que proporciona en el campo de texto. No requerimos acceso a sus repositorios git."
      },
      {
        q: "¿Puedo exportar los archivos generados?",
        a: "Absolutamente. Durante la fase de revisión, puede copiar el contenido de los Dockerfiles y otras configuraciones para usar directamente en su proyecto."
      }
    ],
    // Landing
    landingHero: "Del Código a la Nube en Segundos.",
    landingSub: "El ingeniero DevOps con IA que genera Dockerfiles, pipelines CI/CD y configuraciones de nube al instante.",
    ctaStart: "Comenzar Gratis",
    ctaLogin: "Iniciar Sesión",
    feat1Title: "Configuração IA",
    feat1Desc: "Genera automáticamente Dockerfiles y configs Nginx adaptadas a la lógica de su código.",
    feat2Title: "Seguridad Primero",
    feat2Desc: "Escanea vulnerabilidades y sugiere mejores prácticas de seguridad antes de desplegar.",
    feat3Title: "Estimación de Costos",
    feat3Desc: "Predice costos mensuales de nube para AWS, DigitalOcean y más antes de comprometerse.",
    // History
    historyTitle: "Historial de Despliegues",
    historyEmpty: "Aún no hay despliegues. ¡Comience el primero!",
    colDate: "Fecha",
    colProject: "Proyecto",
    colTarget: "Objetivo",
    colStatus: "Estado",
    colCost: "Costo Est.",
    btnBack: "Volver",
    // Git
    tabManual: "Entrada Manual",
    tabGit: "Repositorio Git",
    lblRepoUrl: "URL del Repositorio",
    lblBranch: "Rama",
    phRepoUrl: "https://github.com/usuario/repo",
    phBranch: "main",
    lblGitContext: "Contexto Adicional (Opcional)",
    // Assistant
    lblSimulateFailure: "Simular Fallo (Para Prueba)",
    agentTitle: "Agente OpsFlow",
    agentDesc: "Detecté un error en su despliegue.",
    btnAnalyze: "Analizar Error",
    agentDiagnosing: "Diagnosticando logs...",
    agentSolution: "Solución Sugerida",
    btnApplyFix: "Aplicar Corrección y Reintentar",
    lblDiagnosis: "Diagnóstico",
    // Templates
    lblTemplates: "Plantillas de Inicio Rápido",
    // Scan
    btnScan: "Escanear y Rellenar",
    scanning: "Escaneando...",
    errRepoScan: "Error al escanear repositorio."
  }
};

const App: React.FC = () => {
  // --- STATE ---
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [authView, setAuthView] = useState<AuthView>(AuthView.LANDING);
  const [lang, setLang] = useState<Language>('pt'); 
  const [user, setUser] = useState<User | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('opsflow_theme') as 'light' | 'dark') || 'dark';
  });
  
  // --- MISSING STATE ---
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.NODE);
  const [target, setTarget] = useState<DeploymentTarget>(DeploymentTarget.DIGITALOCEAN);
  const [details, setDetails] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [inputType, setInputType] = useState<'manual' | 'git'>('manual');
  
  const [config, setConfig] = useState<DeploymentConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shouldFail, setShouldFail] = useState(false);
  
  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('opsflow_theme', theme);
  }, [theme]);

  const t = TRANSLATIONS[lang];

  // Logic functions
  const handleGenerate = async () => {
    if (details.length < 10 && !repoUrl) {
      alert(t.errShortDetails);
      return;
    }
    setAppState(AppState.GENERATING);
    try {
      const cfg = await generateDeploymentConfig(projectType, target, details, lang, repoUrl);
      setConfig(cfg);
      setAppState(AppState.REVIEW);
    } catch (e) {
      console.error(e);
      alert(t.errGenFailed);
      setAppState(AppState.INPUT);
    }
  };

  const handleDeploy = async () => {
    setAppState(AppState.DEPLOYING);
    setLogs([]);
    const logMessages = await generateDeploymentLogs(projectType, target, lang, repoUrl, shouldFail);
    
    // Simulate streaming
    let i = 0;
    const interval = setInterval(async () => {
        if (i >= logMessages.length) {
            clearInterval(interval);
            const success = !shouldFail; // In real scenario, check last log or flag
            setAppState(success ? AppState.SUCCESS : AppState.ERROR);
            
            // Auto analyze if error
            if (!success) {
                // mocking error log entries
                const errorLogs = logMessages.map(m => ({ 
                    timestamp: new Date().toISOString().split('T')[1].split('.')[0], 
                    level: 'info' as const, 
                    message: m 
                }));
                // Mark last few as error
                if(errorLogs.length > 0) errorLogs[errorLogs.length - 1].level = 'error';
                
                setLogs(errorLogs);
            }
            return;
        }

        const msg = logMessages[i];
        const isError = msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail');
        const isSuccess = msg.toLowerCase().includes('success');
        
        setLogs(prev => [...prev, {
            timestamp: new Date().toISOString().split('T')[1].split('.')[0],
            level: isError ? 'error' : isSuccess ? 'success' : 'info',
            message: msg
        }]);
        i++;
    }, 800);
  };
  
  const handleAnalyzeError = async () => {
     setIsAnalyzing(true);
     try {
         const analysis = await analyzeDeploymentError(logs, projectType, target, lang);
         setErrorAnalysis(analysis);
     } catch(e) {
         console.error(e);
     }
     setIsAnalyzing(false);
  };

  const reset = () => {
      setAppState(AppState.INPUT);
      setConfig(null);
      setLogs([]);
      setErrorAnalysis(null);
  };

  // Render
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'} transition-colors duration-300 font-sans`}>
        {/* Navbar */}
        <nav className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/50'} backdrop-blur-md sticky top-0 z-50`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAuthView(AuthView.LANDING)}>
                    <Rocket className="text-blue-500" size={24} />
                    <span className="font-bold text-xl tracking-tight">OpsFlow</span>
                </div>
                
                <div className="flex items-center gap-4">
                     <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-slate-800/10 dark:hover:bg-slate-800 transition-colors">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                     </button>
                     
                     <div className="relative group">
                        <button className="flex items-center gap-1 text-sm font-medium hover:text-blue-400 transition-colors">
                            <Globe size={16} />
                            {lang.toUpperCase()}
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible pointer-events-none group-hover:pointer-events-auto overflow-hidden">
                            {(['en', 'pt', 'es'] as Language[]).map(l => (
                                <button key={l} onClick={() => setLang(l)} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 text-slate-300 hover:text-white">
                                    {l === 'en' ? 'English' : l === 'pt' ? 'Português' : 'Español'}
                                </button>
                            ))}
                        </div>
                     </div>

                     {user ? (
                         <button onClick={() => setAuthView(AuthView.HISTORY)} className="flex items-center gap-2 text-sm font-medium hover:text-blue-400">
                            <UserIcon size={16} />
                            {user.name}
                         </button>
                     ) : (
                         <button onClick={() => setAuthView(AuthView.LOGIN)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            {t.ctaLogin}
                         </button>
                     )}
                </div>
            </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {authView === AuthView.LANDING && (
                <div className="text-center py-20">
                    <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        {t.landingHero}
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        {t.landingSub}
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => { setUser({ id: '1', name: 'Demo User', email: 'demo@opsflow.ai', plan: 'TRIAL', deploymentsUsed: 0, lastBillingDate: new Date().toISOString(), history: [] }); setAuthView(AuthView.APP); }} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25">
                            {t.ctaStart}
                        </button>
                        <button onClick={() => window.open('https://github.com', '_blank')} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all border border-slate-700 flex items-center gap-2">
                            <Github size={20} /> GitHub
                        </button>
                    </div>
                </div>
            )}
            
            {authView === AuthView.APP && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
                    {/* Left Panel: Controls */}
                    <div className="lg:col-span-4 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col h-full overflow-y-auto backdrop-blur-sm">
                         {appState === AppState.INPUT && (
                             <div className="space-y-6">
                                 <div>
                                    <h2 className="text-xl font-bold mb-1">{t.title}</h2>
                                    <p className="text-sm text-slate-400">{t.heroDesc}</p>
                                 </div>
                                 
                                 <div className="flex p-1 bg-slate-800 rounded-lg">
                                    <button 
                                        onClick={() => setInputType('manual')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${inputType === 'manual' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        {t.tabManual}
                                    </button>
                                    <button 
                                        onClick={() => setInputType('git')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${inputType === 'git' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        {t.tabGit}
                                    </button>
                                 </div>

                                 {inputType === 'git' && (
                                     <div className="space-y-4">
                                         <div className="space-y-2">
                                             <label className="text-sm font-medium text-slate-300">{t.lblRepoUrl}</label>
                                             <div className="relative">
                                                 <Github className="absolute left-3 top-3 text-slate-500" size={18} />
                                                 <input 
                                                    type="text" 
                                                    value={repoUrl}
                                                    onChange={e => setRepoUrl(e.target.value)}
                                                    placeholder={t.phRepoUrl}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                 />
                                             </div>
                                         </div>
                                          <div className="space-y-2">
                                             <label className="text-sm font-medium text-slate-300">{t.lblBranch}</label>
                                             <div className="relative">
                                                 <GitBranch className="absolute left-3 top-3 text-slate-500" size={18} />
                                                 <input 
                                                    type="text" 
                                                    value={branch}
                                                    onChange={e => setBranch(e.target.value)}
                                                    placeholder={t.phBranch}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                 />
                                             </div>
                                         </div>
                                     </div>
                                 )}

                                 <SelectInput 
                                    id="projectType"
                                    label={t.lblProjectType}
                                    value={projectType}
                                    onChange={(v) => setProjectType(v as ProjectType)}
                                    options={Object.values(ProjectType)}
                                    icon={Code}
                                 />
                                 
                                 <SelectInput 
                                    id="target"
                                    label={t.lblTarget}
                                    value={target}
                                    onChange={(v) => setTarget(v as DeploymentTarget)}
                                    options={Object.values(DeploymentTarget)}
                                    icon={Server}
                                 />

                                 <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">{inputType === 'git' ? t.lblGitContext : t.lblDetails}</label>
                                    <textarea 
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder={t.lblDetailsPlaceholder}
                                        className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    />
                                    <p className="text-xs text-slate-500">{t.lblDetailsHint}</p>
                                 </div>

                                 <button 
                                    onClick={handleGenerate}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/25"
                                 >
                                    <Zap size={18} />
                                    {t.btnGenerate}
                                 </button>
                             </div>
                         )}

                         {appState !== AppState.INPUT && (
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-700">
                                    <div className={`p-2 rounded-lg ${appState === AppState.SUCCESS ? 'bg-green-500/20 text-green-400' : appState === AppState.ERROR ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {appState === AppState.GENERATING ? <Loader2 className="animate-spin" size={24} /> :
                                         appState === AppState.SUCCESS ? <CheckCircle size={24} /> :
                                         appState === AppState.ERROR ? <AlertTriangle size={24} /> :
                                         <Bot size={24} />}
                                    </div>
                                    <div>
                                        <h2 className="font-bold">{appState === AppState.GENERATING ? t.loadingTitle : 
                                                                   appState === AppState.REVIEW ? t.sectionAnalysis : 
                                                                   appState === AppState.DEPLOYING ? t.statusDeploying :
                                                                   appState === AppState.SUCCESS ? t.statusSuccess : t.statusFailed}</h2>
                                        <p className="text-xs text-slate-400">{appState === AppState.GENERATING ? t.loadingDesc : 
                                                                                 appState === AppState.REVIEW ? t.helpContext.REVIEW :
                                                                                 appState === AppState.DEPLOYING ? t.helpContext.DEPLOYING :
                                                                                 appState === AppState.SUCCESS ? t.msgSuccess : t.agentDesc}</p>
                                    </div>
                                </div>
                                
                                {config && (
                                    <div className="space-y-4 flex-1">
                                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t.lblCost}</span>
                                                <DollarSign size={16} className="text-green-400" />
                                            </div>
                                            <p className="text-lg font-mono font-medium">{config.estimatedCost}</p>
                                        </div>
                                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t.lblSecurity}</span>
                                                <ShieldCheck size={16} className="text-blue-400" />
                                            </div>
                                            <p className="text-sm">{config.securityRating}</p>
                                        </div>
                                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">{t.lblRecommendations}</span>
                                            <ul className="space-y-2">
                                                {config.recommendations.map((rec, i) => (
                                                    <li key={i} className="text-xs text-slate-300 flex gap-2">
                                                        <span className="text-blue-500">•</span> {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-6 border-t border-slate-700 space-y-3">
                                    {appState === AppState.REVIEW && (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input type="checkbox" id="failMode" checked={shouldFail} onChange={e => setShouldFail(e.target.checked)} className="rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-500" />
                                                <label htmlFor="failMode" className="text-xs text-slate-400">{t.lblSimulateFailure}</label>
                                            </div>
                                            <button onClick={handleDeploy} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                                                <Rocket size={18} /> {t.btnDeploy}
                                            </button>
                                            <button onClick={reset} className="w-full bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white py-2 rounded-lg text-sm transition-all">
                                                {t.btnCancel}
                                            </button>
                                        </>
                                    )}
                                    {(appState === AppState.SUCCESS || appState === AppState.ERROR) && (
                                        <button onClick={reset} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                                            <RefreshCw size={18} /> {t.btnRestart}
                                        </button>
                                    )}
                                    {appState === AppState.ERROR && !errorAnalysis && (
                                        <button onClick={handleAnalyzeError} disabled={isAnalyzing} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Bug size={18} />} 
                                            {isAnalyzing ? t.agentDiagnosing : t.btnAnalyze}
                                        </button>
                                    )}
                                </div>
                            </div>
                         )}
                    </div>
                    
                    {/* Right Panel: Display */}
                    <div className="lg:col-span-8 bg-slate-900/50 rounded-2xl border border-slate-800 p-1 flex flex-col h-full overflow-hidden backdrop-blur-sm shadow-2xl">
                         {appState === AppState.INPUT || appState === AppState.GENERATING ? (
                             <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                 {appState === AppState.GENERATING ? (
                                     <div className="text-center">
                                         <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                                         <p className="text-slate-300 font-medium animate-pulse">{t.loadingDesc}</p>
                                     </div>
                                 ) : (
                                     <>
                                        <LayoutTemplate size={64} className="mb-4 opacity-20" />
                                        <p className="text-sm">Select a project type or template to begin</p>
                                        
                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-8 w-full">
                                            {DEPLOYMENT_TEMPLATES.map(tmp => (
                                                <button 
                                                    key={tmp.id} 
                                                    onClick={() => {
                                                        setProjectType(tmp.type);
                                                        setTarget(tmp.target);
                                                        setDetails(tmp.details);
                                                    }}
                                                    className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-xl text-left transition-all hover:scale-105 group"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-slate-200">{tmp.name}</span>
                                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                                    </div>
                                                    <div className="text-xs text-slate-500 line-clamp-2">{tmp.details}</div>
                                                </button>
                                            ))}
                                        </div>
                                     </>
                                 )}
                             </div>
                         ) : appState === AppState.REVIEW ? (
                             <FileViewer files={config?.files || []} />
                         ) : (
                             <div className="h-full flex flex-col">
                                 <div className="flex-1 min-h-0">
                                    <Terminal logs={logs} title={`Deploying to ${target}...`} />
                                 </div>
                                 {errorAnalysis && (
                                     <div className="h-1/3 bg-amber-900/10 border-t border-amber-900/30 p-4 overflow-y-auto">
                                         <h3 className="text-amber-500 font-bold flex items-center gap-2 mb-2">
                                             <Bot size={18} /> {t.agentTitle}
                                         </h3>
                                         <div className="space-y-2 text-sm">
                                             <p><span className="text-amber-400 font-medium">{t.lblDiagnosis}:</span> {errorAnalysis.diagnosis}</p>
                                             <p><span className="text-amber-400 font-medium">{t.agentSolution}:</span> {errorAnalysis.solution}</p>
                                             <div className="mt-2 bg-black/30 p-2 rounded border border-amber-900/30 font-mono text-xs text-amber-200">
                                                 {errorAnalysis.fixedContext}
                                             </div>
                                             <button onClick={() => {
                                                 setDetails(prev => prev + "\n\nFIX REQUEST: " + errorAnalysis.fixedContext);
                                                 reset();
                                             }} className="mt-2 text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 px-3 py-1 rounded border border-amber-600/30 transition-colors">
                                                 {t.btnApplyFix}
                                             </button>
                                         </div>
                                     </div>
                                 )}
                             </div>
                         )}
                    </div>
                </div>
            )}
            
            {(authView === AuthView.LOGIN || authView === AuthView.REGISTER) && (
                <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold">{authView === AuthView.LOGIN ? t.loginTitle : t.registerTitle}</h2>
                            <p className="text-slate-400 text-sm">{authView === AuthView.LOGIN ? t.loginDesc : t.registerDesc}</p>
                        </div>
                        <div className="space-y-4">
                            <input type="email" placeholder={t.emailPlaceholder} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input type="password" placeholder={t.passwordPlaceholder} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            <button onClick={() => { setUser({id: '1', name: 'User', email: 'test@ops.flow', plan: 'BASIC', deploymentsUsed: 5, lastBillingDate: new Date().toISOString(), history: []}); setAuthView(AuthView.APP); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
                                {authView === AuthView.LOGIN ? t.btnLogin : t.btnRegister}
                            </button>
                        </div>
                        <div className="mt-6 text-center">
                            <button onClick={() => setAuthView(authView === AuthView.LOGIN ? AuthView.REGISTER : AuthView.LOGIN)} className="text-sm text-slate-400 hover:text-white transition-colors">
                                {authView === AuthView.LOGIN ? t.switchRegister : t.switchLogin}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {authView === AuthView.HISTORY && (
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px]">
                     <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                         <h2 className="text-xl font-bold flex items-center gap-2">
                             <History size={20} className="text-blue-500" />
                             {t.historyTitle}
                         </h2>
                         <button onClick={() => setAuthView(AuthView.APP)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                             <ArrowRight className="rotate-180" size={14} /> {t.btnBack}
                         </button>
                     </div>
                     <div className="p-8 text-center text-slate-500">
                         {t.historyEmpty}
                     </div>
                 </div>
            )}
        </main>
    </div>
  );
};

export default App;