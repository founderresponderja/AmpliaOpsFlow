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
  Search,
  Mail,
  ListFilter,
  ArrowUpDown,
  AlertOctagon
} from 'lucide-react';
import { ProjectType, DeploymentTarget, AppState, DeploymentConfig, LogEntry, Language, User, PlanTier, Plan, AuthView, DeploymentRecord, ErrorAnalysis, Priority } from './types';
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
    lblPriority: "Deployment Priority",
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
    // Social Login
    btnGoogle: "Continue with Google",
    btnGithub: "Continue with GitHub",
    or: "or",
    // History / Tasks
    lblSortBy: "Sort by",
    sortDate: "Date",
    sortPriority: "Priority",
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
    lblPriority: "Prioridade de Implementação",
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
    // Social Login
    btnGoogle: "Continuar com Google",
    btnGithub: "Continuar com GitHub",
    or: "ou",
    // History / Tasks
    lblSortBy: "Ordenar por",
    sortDate: "Data",
    sortPriority: "Prioridade",
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
    lblPriority: "Prioridad de Despliegue",
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
    // Social Login
    btnGoogle: "Continuar con Google",
    btnGithub: "Continuar con GitHub",
    or: "ou",
    // History / Tasks
    lblSortBy: "Ordenar por",
    sortDate: "Fecha",
    sortPriority: "Prioridad",
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
        a: "Absolutamente. Durante a fase de revisión, puede copiar el contenido de los Dockerfiles y otras configuraciones para usar directamente en su proyecto."
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

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// --- HELPER FOR HISTORY SORTING ---
const sortHistory = (history: DeploymentRecord[], sortBy: 'date' | 'priority') => {
  return [...history].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
  });
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    'High': 'bg-red-500/20 text-red-500 border-red-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    'Low': 'bg-blue-500/20 text-blue-500 border-blue-500/30'
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[priority]}`}>
      {priority}
    </span>
  );
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
  
  // App Inputs
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.NODE);
  const [target, setTarget] = useState<DeploymentTarget>(DeploymentTarget.DIGITALOCEAN);
  const [priority, setPriority] = useState<Priority>('Medium');
  
  // Git / Manual
  const [details, setDetails] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [inputType, setInputType] = useState<'manual' | 'git'>('manual');
  
  // Processing
  const [config, setConfig] = useState<DeploymentConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shouldFail, setShouldFail] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // History View
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  
  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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
      const cfg = await generateDeploymentConfig(projectType, target, details, lang, priority, repoUrl);
      setConfig(cfg);
      setAppState(AppState.REVIEW);
    } catch (e) {
      console.error(e);
      alert(t.errGenFailed);
      setAppState(AppState.INPUT);
    }
  };

  const handleScanRepo = async () => {
     if (!repoUrl) {
         alert(t.errInvalidUrl);
         return;
     }
     setIsScanning(true);
     try {
         const summary = await analyzeRepo(repoUrl, branch, lang);
         setDetails(summary);
     } catch(e) {
         console.error(e);
         alert(t.errRepoScan);
     } finally {
         setIsScanning(false);
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
                const errorLogs: LogEntry[] = logMessages.map(m => ({ 
                    timestamp: new Date().toISOString().split('T')[1].split('.')[0], 
                    level: 'info', 
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

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setIsAuthLoading(true);
    // Simulate API delay
    setTimeout(() => {
        setUser({
            id: provider === 'google' ? 'google-123' : 'gh-123',
            name: provider === 'google' ? 'Google User' : 'GitHub User',
            email: provider === 'google' ? 'user@gmail.com' : 'dev@github.com',
            plan: 'BASIC',
            deploymentsUsed: 2,
            lastBillingDate: new Date().toISOString(),
            history: [
               { id: 'd-1', date: '2023-10-01T10:00:00Z', projectType: ProjectType.NODE, target: DeploymentTarget.DIGITALOCEAN, status: 'SUCCESS', details: 'API Server', priority: 'High', cost: '$10/mo' },
               { id: 'd-2', date: '2023-10-05T14:30:00Z', projectType: ProjectType.REACT, target: DeploymentTarget.VERCEL, status: 'SUCCESS', details: 'Landing Page', priority: 'Low', cost: '$0/mo' },
               { id: 'd-3', date: '2023-10-12T09:15:00Z', projectType: ProjectType.PYTHON, target: DeploymentTarget.AWS, status: 'FAILED', details: 'Data Processor', priority: 'Medium', cost: '$25/mo' },
            ]
        });
        setAuthView(AuthView.APP);
        setIsAuthLoading(false);
    }, 1500);
  };

  // Render
  return (
    <div className="min-h-screen bg-amplia-bg text-amplia-text transition-colors duration-300 font-sans selection:bg-amplia-accent selection:text-amplia-bg">
        {/* Navbar */}
        <nav className="border-b border-amplia-border bg-amplia-bg/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAuthView(AuthView.LANDING)}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amplia-accent to-blue-600 flex items-center justify-center shadow-lg shadow-amplia-accent/20">
                      <Rocket className="text-white" size={20} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-amplia-text">OpsFlow</span>
                </div>
                
                <div className="flex items-center gap-4">
                     <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-amplia-surface text-amplia-textDim hover:text-amplia-text transition-colors">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                     </button>
                     
                     <div className="relative group">
                        <button className="flex items-center gap-1 text-sm font-medium hover:text-amplia-accent transition-colors">
                            <Globe size={16} />
                            {lang.toUpperCase()}
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-amplia-surface border border-amplia-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible pointer-events-none group-hover:pointer-events-auto overflow-hidden">
                            {(['en', 'pt', 'es'] as Language[]).map(l => (
                                <button key={l} onClick={() => setLang(l)} className="block w-full text-left px-4 py-2 text-sm hover:bg-amplia-bg text-amplia-textDim hover:text-amplia-text">
                                    {l === 'en' ? 'English' : l === 'pt' ? 'Português' : 'Español'}
                                </button>
                            ))}
                        </div>
                     </div>

                     {user ? (
                         <button onClick={() => setAuthView(AuthView.HISTORY)} className="flex items-center gap-2 text-sm font-medium hover:text-amplia-accent">
                            <UserIcon size={16} />
                            {user.name}
                         </button>
                     ) : (
                         <button onClick={() => setAuthView(AuthView.LOGIN)} className="bg-amplia-text text-amplia-bg hover:bg-amplia-textDim px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amplia-surface border border-amplia-border text-xs font-medium text-amplia-accent mb-8 shadow-sm">
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amplia-accent opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-amplia-accent"></span>
                       </span>
                       v2.1 Now Available
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-b from-amplia-text to-amplia-textDim bg-clip-text text-transparent">
                        {t.landingHero}
                    </h1>
                    <p className="text-xl text-amplia-textDim mb-10 max-w-2xl mx-auto">
                        {t.landingSub}
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => { setUser({ id: '1', name: 'Demo User', email: 'demo@opsflow.ai', plan: 'TRIAL', deploymentsUsed: 0, lastBillingDate: new Date().toISOString(), history: [] }); setAuthView(AuthView.APP); }} className="bg-amplia-accent hover:bg-amplia-accentHover text-amplia-bg px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-amplia-accent/25">
                            {t.ctaStart}
                        </button>
                        <button onClick={() => window.open('https://github.com', '_blank')} className="bg-amplia-surface hover:bg-amplia-bg text-amplia-text px-8 py-3 rounded-xl font-bold text-lg transition-all border border-amplia-border flex items-center gap-2">
                            <Github size={20} /> GitHub
                        </button>
                    </div>
                </div>
            )}
            
            {authView === AuthView.APP && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
                    {/* Left Panel: Controls */}
                    <div className="lg:col-span-4 bg-amplia-surface rounded-2xl border border-amplia-border p-6 flex flex-col h-full overflow-y-auto shadow-xl">
                         {appState === AppState.INPUT && (
                             <div className="space-y-6">
                                 <div>
                                    <h2 className="text-xl font-bold mb-1 text-amplia-text">{t.title}</h2>
                                    <p className="text-sm text-amplia-textDim">{t.heroDesc}</p>
                                 </div>
                                 
                                 <div className="flex p-1 bg-amplia-bg rounded-lg border border-amplia-border">
                                    <button 
                                        onClick={() => setInputType('manual')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${inputType === 'manual' ? 'bg-amplia-surface text-amplia-text shadow-sm' : 'text-amplia-textDim hover:text-amplia-text'}`}
                                    >
                                        <FileText size={14} />
                                        {t.tabManual}
                                    </button>
                                    <button 
                                        onClick={() => setInputType('git')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${inputType === 'git' ? 'bg-amplia-surface text-amplia-text shadow-sm' : 'text-amplia-textDim hover:text-amplia-text'}`}
                                    >
                                        <Github size={14} />
                                        {t.tabGit}
                                    </button>
                                 </div>

                                 {inputType === 'git' && (
                                     <div className="space-y-4 p-4 bg-amplia-bg/50 rounded-lg border border-amplia-border border-dashed">
                                         <div className="space-y-2">
                                             <label className="text-sm font-medium text-amplia-textDim">{t.lblRepoUrl}</label>
                                             <div className="relative group">
                                                 <Github className="absolute left-3 top-3 text-amplia-textDim group-focus-within:text-amplia-accent transition-colors" size={18} />
                                                 <input 
                                                    type="text" 
                                                    value={repoUrl}
                                                    onChange={e => setRepoUrl(e.target.value)}
                                                    placeholder={t.phRepoUrl}
                                                    className="w-full bg-amplia-bg border border-amplia-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-amplia-text focus:ring-2 focus:ring-amplia-accent focus:border-transparent outline-none transition-all"
                                                 />
                                             </div>
                                         </div>
                                          <div className="space-y-2">
                                             <label className="text-sm font-medium text-amplia-textDim">{t.lblBranch}</label>
                                             <div className="relative group">
                                                 <GitBranch className="absolute left-3 top-3 text-amplia-textDim group-focus-within:text-amplia-accent transition-colors" size={18} />
                                                 <input 
                                                    type="text" 
                                                    value={branch}
                                                    onChange={e => setBranch(e.target.value)}
                                                    placeholder={t.phBranch}
                                                    className="w-full bg-amplia-bg border border-amplia-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-amplia-text focus:ring-2 focus:ring-amplia-accent focus:border-transparent outline-none transition-all"
                                                 />
                                             </div>
                                         </div>
                                         <button 
                                            onClick={handleScanRepo}
                                            disabled={isScanning}
                                            className="w-full py-2 bg-amplia-surface border border-amplia-border hover:border-amplia-accent hover:text-amplia-accent text-amplia-textDim text-sm rounded-lg flex items-center justify-center gap-2 transition-all"
                                         >
                                            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                            {isScanning ? t.scanning : t.btnScan}
                                         </button>
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

                                 <SelectInput 
                                    id="priority"
                                    label={t.lblPriority}
                                    value={priority}
                                    onChange={(v) => setPriority(v as Priority)}
                                    options={['High', 'Medium', 'Low']}
                                    icon={AlertOctagon}
                                 />

                                 <div className="space-y-2">
                                    <label className="text-sm font-medium text-amplia-textDim">{inputType === 'git' ? t.lblGitContext : t.lblDetails}</label>
                                    <textarea 
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder={t.lblDetailsPlaceholder}
                                        className="w-full h-32 bg-amplia-bg border border-amplia-border rounded-lg p-3 text-sm text-amplia-text focus:ring-2 focus:ring-amplia-accent focus:border-transparent outline-none resize-none transition-all placeholder-amplia-textDim/50"
                                    />
                                    <p className="text-xs text-amplia-textDim">{t.lblDetailsHint}</p>
                                 </div>

                                 <button 
                                    onClick={handleGenerate}
                                    className="w-full bg-amplia-accent hover:bg-amplia-accentHover text-amplia-bg font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-amplia-accent/25"
                                 >
                                    <Zap size={18} />
                                    {t.btnGenerate}
                                 </button>
                             </div>
                         )}

                         {appState !== AppState.INPUT && (
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-amplia-border">
                                    <div className={`p-2 rounded-lg ${appState === AppState.SUCCESS ? 'bg-amplia-success/20 text-amplia-success' : appState === AppState.ERROR ? 'bg-amplia-error/20 text-amplia-error' : 'bg-amplia-accent/20 text-amplia-accent'}`}>
                                        {appState === AppState.GENERATING ? <Loader2 className="animate-spin" size={24} /> :
                                         appState === AppState.SUCCESS ? <CheckCircle size={24} /> :
                                         appState === AppState.ERROR ? <AlertTriangle size={24} /> :
                                         <Bot size={24} />}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-amplia-text">{appState === AppState.GENERATING ? t.loadingTitle : 
                                                                   appState === AppState.REVIEW ? t.sectionAnalysis : 
                                                                   appState === AppState.DEPLOYING ? t.statusDeploying :
                                                                   appState === AppState.SUCCESS ? t.statusSuccess : t.statusFailed}</h2>
                                        <p className="text-xs text-amplia-textDim">{appState === AppState.GENERATING ? t.loadingDesc : 
                                                                                 appState === AppState.REVIEW ? t.helpContext.REVIEW :
                                                                                 appState === AppState.DEPLOYING ? t.helpContext.DEPLOYING :
                                                                                 appState === AppState.SUCCESS ? t.msgSuccess : t.agentDesc}</p>
                                    </div>
                                </div>
                                
                                {config && (
                                    <div className="space-y-4 flex-1">
                                        <div className="bg-amplia-bg p-4 rounded-lg border border-amplia-border">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-amplia-textDim uppercase tracking-wider font-semibold">{t.lblCost}</span>
                                                <DollarSign size={16} className="text-amplia-success" />
                                            </div>
                                            <p className="text-lg font-mono font-medium text-amplia-text">{config.estimatedCost}</p>
                                        </div>
                                        <div className="bg-amplia-bg p-4 rounded-lg border border-amplia-border">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-amplia-textDim uppercase tracking-wider font-semibold">{t.lblSecurity}</span>
                                                <ShieldCheck size={16} className="text-amplia-accent" />
                                            </div>
                                            <p className="text-sm text-amplia-text">{config.securityRating}</p>
                                        </div>
                                        <div className="bg-amplia-bg p-4 rounded-lg border border-amplia-border">
                                            <span className="text-xs text-amplia-textDim uppercase tracking-wider font-semibold block mb-2">{t.lblRecommendations}</span>
                                            <ul className="space-y-2">
                                                {config.recommendations.map((rec, i) => (
                                                    <li key={i} className="text-xs text-amplia-text flex gap-2">
                                                        <span className="text-amplia-accent">•</span> {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-6 border-t border-amplia-border space-y-3">
                                    {appState === AppState.REVIEW && (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <input type="checkbox" id="failMode" checked={shouldFail} onChange={e => setShouldFail(e.target.checked)} className="rounded bg-amplia-bg border-amplia-border text-amplia-accent focus:ring-amplia-accent" />
                                                <label htmlFor="failMode" className="text-xs text-amplia-textDim">{t.lblSimulateFailure}</label>
                                            </div>
                                            <button onClick={handleDeploy} className="w-full bg-amplia-success hover:bg-green-500 text-amplia-bg font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                                                <Rocket size={18} /> {t.btnDeploy}
                                            </button>
                                            <button onClick={reset} className="w-full bg-transparent hover:bg-amplia-bg text-amplia-textDim hover:text-amplia-text py-2 rounded-lg text-sm transition-all">
                                                {t.btnCancel}
                                            </button>
                                        </>
                                    )}
                                    {(appState === AppState.SUCCESS || appState === AppState.ERROR) && (
                                        <button onClick={reset} className="w-full bg-amplia-surface hover:bg-amplia-bg text-amplia-text border border-amplia-border font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                                            <RefreshCw size={18} /> {t.btnRestart}
                                        </button>
                                    )}
                                    {appState === AppState.ERROR && !errorAnalysis && (
                                        <button onClick={handleAnalyzeError} disabled={isAnalyzing} className="w-full bg-amplia-warning text-amplia-bg font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Bug size={18} />} 
                                            {isAnalyzing ? t.agentDiagnosing : t.btnAnalyze}
                                        </button>
                                    )}
                                </div>
                            </div>
                         )}
                    </div>
                    
                    {/* Right Panel: Display */}
                    <div className="lg:col-span-8 bg-amplia-surface rounded-2xl border border-amplia-border p-1 flex flex-col h-full overflow-hidden shadow-2xl">
                         {appState === AppState.INPUT || appState === AppState.GENERATING ? (
                             <div className="h-full flex flex-col items-center justify-center text-amplia-textDim">
                                 {appState === AppState.GENERATING ? (
                                     <div className="text-center">
                                         <Loader2 className="animate-spin text-amplia-accent mx-auto mb-4" size={48} />
                                         <p className="text-amplia-text font-medium animate-pulse">{t.loadingDesc}</p>
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
                                                    className="bg-amplia-bg hover:bg-amplia-surface border border-amplia-border p-4 rounded-xl text-left transition-all hover:scale-105 group hover:border-amplia-accent/50"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-amplia-text">{tmp.name}</span>
                                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-amplia-accent" />
                                                    </div>
                                                    <div className="text-xs text-amplia-textDim line-clamp-2">{tmp.details}</div>
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
                                     <div className="h-1/3 bg-amplia-warning/10 border-t border-amplia-warning/30 p-4 overflow-y-auto">
                                         <h3 className="text-amplia-warning font-bold flex items-center gap-2 mb-2">
                                             <Bot size={18} /> {t.agentTitle}
                                         </h3>
                                         <div className="space-y-2 text-sm">
                                             <p><span className="text-amplia-warning font-medium">{t.lblDiagnosis}:</span> <span className="text-amplia-text">{errorAnalysis.diagnosis}</span></p>
                                             <p><span className="text-amplia-warning font-medium">{t.agentSolution}:</span> <span className="text-amplia-text">{errorAnalysis.solution}</span></p>
                                             <div className="mt-2 bg-black/30 p-2 rounded border border-amplia-warning/30 font-mono text-xs text-amplia-warning/80">
                                                 {errorAnalysis.fixedContext}
                                             </div>
                                             <button onClick={() => {
                                                 setDetails(prev => prev + "\n\nFIX REQUEST: " + errorAnalysis.fixedContext);
                                                 reset();
                                             }} className="mt-2 text-xs bg-amplia-warning/20 hover:bg-amplia-warning/40 text-amplia-warning px-3 py-1 rounded border border-amplia-warning/30 transition-colors">
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
                    <div className="w-full max-w-md bg-amplia-surface border border-amplia-border rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-amplia-text">{authView === AuthView.LOGIN ? t.loginTitle : t.registerTitle}</h2>
                            <p className="text-amplia-textDim text-sm">{authView === AuthView.LOGIN ? t.loginDesc : t.registerDesc}</p>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="space-y-3 mb-6">
                            <button 
                                onClick={() => handleSocialLogin('google')}
                                disabled={isAuthLoading}
                                className="w-full bg-amplia-surface hover:bg-amplia-bg border border-amplia-border text-amplia-text font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isAuthLoading ? <Loader2 size={20} className="animate-spin" /> : <GoogleIcon />}
                                {t.btnGoogle}
                            </button>
                            <button 
                                onClick={() => handleSocialLogin('github')}
                                disabled={isAuthLoading}
                                className="w-full bg-amplia-surface hover:bg-amplia-bg border border-amplia-border text-amplia-text font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isAuthLoading ? <Loader2 size={20} className="animate-spin" /> : <Github size={20} />}
                                {t.btnGithub}
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-amplia-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-amplia-surface px-2 text-amplia-textDim">{t.or}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-amplia-textDim group-focus-within:text-amplia-accent transition-colors" size={18} />
                                <input type="email" placeholder={t.emailPlaceholder} className="w-full bg-amplia-bg border border-amplia-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amplia-accent outline-none text-amplia-text" />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-amplia-textDim group-focus-within:text-amplia-accent transition-colors" size={18} />
                                <input type="password" placeholder={t.passwordPlaceholder} className="w-full bg-amplia-bg border border-amplia-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amplia-accent outline-none text-amplia-text" />
                            </div>
                            <button onClick={() => { setUser({id: '1', name: 'User', email: 'test@ops.flow', plan: 'BASIC', deploymentsUsed: 5, lastBillingDate: new Date().toISOString(), history: []}); setAuthView(AuthView.APP); }} className="w-full bg-amplia-accent hover:bg-amplia-accentHover text-amplia-bg font-bold py-3 rounded-lg transition-colors">
                                {authView === AuthView.LOGIN ? t.btnLogin : t.btnRegister}
                            </button>
                        </div>
                        <div className="mt-6 text-center">
                            <button onClick={() => setAuthView(authView === AuthView.LOGIN ? AuthView.REGISTER : AuthView.LOGIN)} className="text-sm text-amplia-textDim hover:text-amplia-text transition-colors">
                                {authView === AuthView.LOGIN ? t.switchRegister : t.switchLogin}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {authView === AuthView.HISTORY && user && (
                 <div className="bg-amplia-surface border border-amplia-border rounded-2xl overflow-hidden min-h-[500px]">
                     <div className="p-6 border-b border-amplia-border flex justify-between items-center bg-amplia-bg/50">
                         <div>
                             <h2 className="text-xl font-bold flex items-center gap-2 text-amplia-text">
                                 <History size={20} className="text-amplia-accent" />
                                 {t.historyTitle}
                             </h2>
                             <p className="text-sm text-amplia-textDim mt-1">
                                {user.history.length} deployments in record
                             </p>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="flex items-center bg-amplia-bg rounded-lg border border-amplia-border p-1">
                                <span className="text-xs font-medium text-amplia-textDim px-2 flex items-center gap-1">
                                    <ListFilter size={12} /> {t.lblSortBy}:
                                </span>
                                <button 
                                    onClick={() => setSortBy('date')}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${sortBy === 'date' ? 'bg-amplia-surface text-amplia-text shadow-sm' : 'text-amplia-textDim hover:text-amplia-text'}`}
                                >
                                    {t.sortDate}
                                </button>
                                <button 
                                    onClick={() => setSortBy('priority')}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${sortBy === 'priority' ? 'bg-amplia-surface text-amplia-text shadow-sm' : 'text-amplia-textDim hover:text-amplia-text'}`}
                                >
                                    {t.sortPriority}
                                </button>
                             </div>
                             <button onClick={() => setAuthView(AuthView.APP)} className="text-sm text-amplia-textDim hover:text-amplia-text flex items-center gap-1 px-3 py-2 hover:bg-amplia-bg rounded-lg transition-colors">
                                 <ArrowRight className="rotate-180" size={14} /> {t.btnBack}
                             </button>
                         </div>
                     </div>
                     
                     <div className="overflow-x-auto">
                        {user.history.length === 0 ? (
                            <div className="p-12 text-center text-amplia-textDim flex flex-col items-center">
                                <LayoutTemplate size={48} className="mb-4 opacity-20" />
                                <p>{t.historyEmpty}</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-amplia-border bg-amplia-bg/30 text-xs text-amplia-textDim uppercase tracking-wider">
                                        <th className="p-4 font-medium">{t.colProject}</th>
                                        <th className="p-4 font-medium">{t.sortPriority}</th>
                                        <th className="p-4 font-medium">{t.colTarget}</th>
                                        <th className="p-4 font-medium">{t.colDate}</th>
                                        <th className="p-4 font-medium text-right">{t.colCost}</th>
                                        <th className="p-4 font-medium text-right">{t.colStatus}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-amplia-border">
                                    {sortHistory(user.history, sortBy).map(record => (
                                        <tr key={record.id} className="hover:bg-amplia-bg/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-medium text-amplia-text flex items-center gap-2">
                                                    {record.projectType === ProjectType.NODE ? <div className="w-2 h-2 rounded-full bg-green-500"></div> :
                                                     record.projectType === ProjectType.REACT ? <div className="w-2 h-2 rounded-full bg-blue-400"></div> :
                                                     <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
                                                    {record.details || record.projectType}
                                                </div>
                                                <div className="text-xs text-amplia-textDim mt-0.5 max-w-[200px] truncate">{record.id}</div>
                                            </td>
                                            <td className="p-4">
                                                <PriorityBadge priority={record.priority} />
                                            </td>
                                            <td className="p-4 text-sm text-amplia-textDim">
                                                {record.target}
                                            </td>
                                            <td className="p-4 text-sm text-amplia-textDim font-mono">
                                                {new Date(record.date).toLocaleDateString()}
                                                <span className="text-xs opacity-50 ml-1">{new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </td>
                                            <td className="p-4 text-right font-mono text-sm text-amplia-text">
                                                {record.cost}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    record.status === 'SUCCESS' 
                                                    ? 'bg-amplia-success/10 text-amplia-success' 
                                                    : 'bg-amplia-error/10 text-amplia-error'
                                                }`}>
                                                    {record.status === 'SUCCESS' ? <Check size={12} /> : <AlertOctagon size={12} />}
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                     </div>
                 </div>
            )}
        </main>
    </div>
  );
};

export default App;