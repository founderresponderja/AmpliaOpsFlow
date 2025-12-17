export enum ProjectType {
  NODE = 'Node.js',
  REACT = 'React',
  PYTHON = 'Python/Django/Flask',
  GO = 'Go',
  DENO = 'Deno / Edge Functions',
  STATIC = 'Static HTML/JS'
}

export enum DeploymentTarget {
  AWS = 'AWS Elastic Beanstalk',
  DIGITALOCEAN = 'DigitalOcean Droplet',
  VERCEL = 'Vercel',
  SUPABASE = 'Supabase Edge Functions',
  DOCKER = 'Generic Docker Server'
}

export type Language = 'en' | 'pt' | 'es';

export type Priority = 'High' | 'Medium' | 'Low';

export interface GeneratedFile {
  filename: string;
  content: string;
  description: string;
}

export interface EnvVar {
  key: string;
  value: string;
  description: string;
}

export interface DatabaseConfig {
  type: string;
  recommendedPoolSize: number;
  indexingStrategy: string;
  backupPolicy: string;
}

export interface DeploymentConfig {
  files: GeneratedFile[];
  envVars: EnvVar[];
  dbConfig?: DatabaseConfig;
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

export type PlanTier = 'TRIAL' | 'BASIC' | 'PRO' | 'PREMIUM';

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  deploymentsPerMonth: number;
  features: string[];
  lemonSqueezyVariantId?: string;
}

export interface AIPack {
  id: string;
  deployments: number;
  price: number;
  savings: string;
  lemonSqueezyVariantId: string;
}

export interface BillingInfo {
  nif: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanTier;
  deploymentsUsed: number;
  lastBillingDate: string;
  history: any[];
  billingInfo?: BillingInfo;
}

export enum AuthView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  PRICING = 'PRICING',
  APP = 'APP',
  HISTORY = 'HISTORY',
  BILLING_MODAL = 'BILLING_MODAL'
}