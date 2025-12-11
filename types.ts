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

export enum AppState {
  INPUT = 'INPUT',
  GENERATING = 'GENERATING',
  REVIEW = 'REVIEW',
  DEPLOYING = 'DEPLOYING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}