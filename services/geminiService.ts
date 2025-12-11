import { GoogleGenAI, Type } from "@google/genai";
import { ProjectType, DeploymentTarget, DeploymentConfig, Language } from '../types';

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
  lang: Language
): Promise<DeploymentConfig> => {
  
  const languageName = getLanguageName(lang);
  
  const prompt = `
    I have a ${projectType} project that I want to deploy to ${target}.
    Project Details: ${details}.
    
    Please generate the necessary deployment configuration files (e.g., Dockerfile, nginx.conf, GitHub Actions workflow, or build scripts).
    Also estimate the monthly cost (low traffic) and give a brief security rating and recommendations.

    IMPORTANT: 
    - The code inside the files MUST follow standard conventions (usually English).
    - The 'description' field for each file MUST be written in ${languageName}.
    - The 'estimatedCost', 'securityRating', and 'recommendations' MUST be written in ${languageName}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
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
          estimatedCost: { type: Type.STRING },
          securityRating: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['files', 'estimatedCost', 'securityRating', 'recommendations']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  try {
    return JSON.parse(text) as DeploymentConfig;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("AI response format error");
  }
};

export const generateDeploymentLogs = async (
  projectType: ProjectType,
  target: DeploymentTarget,
  lang: Language
): Promise<string[]> => {
  const languageName = getLanguageName(lang);

  const prompt = `
    Generate a list of 8 to 12 realistic deployment log messages for deploying a ${projectType} app to ${target}.
    The logs should start with "Initializing" and end with "Deployment Successful".
    The log messages should be in ${languageName}, but keep technical terms (like 'Docker', 'Build', 'Push') in English if that is standard for the language.
    Return a JSON array of strings.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const text = response.text;
  if (!text) return ["Initializing...", "Building...", "Deploying...", "Success."];
  
  try {
    return JSON.parse(text) as string[];
  } catch (e) {
    return ["Initializing..."];
  }
};