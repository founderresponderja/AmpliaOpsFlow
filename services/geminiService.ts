
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectType, DeploymentTarget, DeploymentConfig, Language, ErrorAnalysis, LogEntry, Priority } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (lang: Language) => {
  switch (lang) {
    case 'pt': return 'European Portuguese';
    case 'es': return 'Spanish';
    default: return 'English';
  }
};

export const generateDeploymentConfig = async (
  projectType: ProjectType,
  target: DeploymentTarget,
  details: string,
  lang: Language,
  priority: Priority
): Promise<DeploymentConfig> => {
  const languageName = getLanguageName(lang);
  const prompt = `
    Task: World-Class DevOps Architect.
    Generate a production-ready configuration for ${projectType} on ${target}.
    Priority: ${priority}. Context: ${details}.
    Language: ${languageName}.
    
    Include:
    1. Optimized Dockerfile with multi-stage build.
    2. CI/CD Pipeline (GitHub Actions or similar).
    3. Production Environment Variables (Keys and Descriptions).
    4. Database pooling and backup recommendations.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 24576 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                filename: { type: Type.STRING },
                content: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['filename', 'content', 'description']
            }
          },
          envVars: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING },
                value: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['key', 'value', 'description']
            }
          },
          dbConfig: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              recommendedPoolSize: { type: Type.NUMBER },
              indexingStrategy: { type: Type.STRING },
              backupPolicy: { type: Type.STRING }
            },
            required: ['type', 'recommendedPoolSize', 'indexingStrategy', 'backupPolicy']
          },
          estimatedCost: { type: Type.STRING },
          securityRating: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['files', 'envVars', 'dbConfig', 'estimatedCost', 'securityRating', 'recommendations']
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateDeploymentLogs = async (
  projectType: ProjectType,
  target: DeploymentTarget,
  lang: Language
): Promise<string[]> => {
  const prompt = `Generate 10 realistic, dynamic deployment terminal logs for ${projectType} deploying to ${target}. 
  Language: ${getLanguageName(lang)}. Include build steps, environment verification, and containerization status.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text);
};

export const analyzeDeploymentError = async (
  logs: LogEntry[],
  projectType: ProjectType,
  target: DeploymentTarget,
  lang: Language
): Promise<ErrorAnalysis> => {
  const logContent = logs.map(l => l.message).join('\n');
  const prompt = `Analyze these deployment logs for ${projectType} on ${target} and use Google Search to find real solutions for any identified errors. 
  Logs: ${logContent}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          solution: { type: Type.STRING },
          fixedContext: { type: Type.STRING }
        },
        required: ['diagnosis', 'solution', 'fixedContext']
      }
    }
  });

  // Extract URLs if grounding metadata exists (UI can then render them)
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  console.debug("Grounding Sources:", chunks);

  return JSON.parse(response.text);
};
