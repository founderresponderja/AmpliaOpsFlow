
export enum ProjectType {
  NODE = 'Node.js',
  REACT = 'React',
  PYTHON = 'Python/Django/Flask',
  GO = 'Go',
  STATIC = 'Static HTML/JS'
}

export enum DeploymentTarget {
  AWS = 'AWS Elastic Beanstalk',
  DIGITALOCEAN = 'DigitalOcean Droplet',
  VERCEL = 'Vercel',
  DOCKER = 'Generic Docker Server'
}

export type Language = 'en' | 'pt' | 'es';

export interface GeneratedFile {
  filename: string;
  content: string;
  description: string;
}

export interface DeploymentConfig {
  files: GeneratedFile[];
  estimatedCost: string;
  securityRating: string;
  recommendations: string[];
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface ErrorAnalysis {
  diagnosis: string;
  solution: string;
  fixedContext: string;
}

export enum AppState {
  INPUT = 'INPUT',
  GENERATING = 'GENERATING',
  REVIEW = 'REVIEW',
  DEPLOYING = 'DEPLOYING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// --- Monetization Types ---

export type PlanTier = 'TRIAL' | 'BASIC' | 'PRO' | 'PREMIUM';

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  deploymentsPerMonth: number;
  features: string[];
}

export interface DeploymentRecord {
  id: string;
  date: string; // ISO string
  projectType: ProjectType;
  target: DeploymentTarget;
  status: 'SUCCESS' | 'FAILED';
  details: string;
  repoUrl?: string; // Added for Git integration
  cost: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanTier;
  deploymentsUsed: number;
  lastBillingDate: string; // ISO Date string
  history: DeploymentRecord[];
}

export enum AuthView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  PRICING = 'PRICING',
  APP = 'APP',
  HISTORY = 'HISTORY'
}
