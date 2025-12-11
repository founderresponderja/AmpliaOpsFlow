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
  priority: Priority,
  repoUrl?: string
): Promise<DeploymentConfig> => {
  
  const languageName = getLanguageName(lang);
  
  let contextPrompt = "";
  let priorityContext = "";

  switch (priority) {
    case 'High':
      priorityContext = "This is a HIGH PRIORITY production deployment. Emphasize high availability, strict security policies, redundancy, and performance optimization in the configuration. Cost is secondary.";
      break;
    case 'Medium':
      priorityContext = "This is a standard priority deployment. Balance performance and cost. Use standard security practices.";
      break;
    case 'Low':
      priorityContext = "This is a LOW PRIORITY (e.g., staging/dev) deployment. Prioritize cost minimization and simplicity over redundancy.";
      break;
  }
  
  if (repoUrl) {
    contextPrompt = `
      I am connecting a Git repository located at: ${repoUrl}.
      Project Type: ${projectType}.
      Target: ${target}.
      Priority Level: ${priority}.
      Additional Context provided by user: "${details}".

      Please analyze the typical structure of a ${projectType} repository and generate the deployment configuration files assuming standard best practices for this stack. 
      Since I cannot directly access private code, infer the requirements based on the project type and the user's additional context.
    `;
  } else {
    contextPrompt = `
      I have a ${projectType} project that I want to deploy to ${target}.
      Priority Level: ${priority}.
      Project Details: ${details}.
    `;
  }

  const prompt = `
    ${contextPrompt}
    ${priorityContext}
    
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
  lang: Language,
  repoUrl?: string,
  shouldFail: boolean = false
): Promise<string[]> => {
  const languageName = getLanguageName(lang);
  const sourceContext = repoUrl ? `cloning from ${repoUrl}` : "using local source";
  const outcomeContext = shouldFail 
    ? "The deployment MUST fail at a late stage (e.g., build error, permission denied, or health check timeout). The last 3-4 logs should indicate the failure." 
    : "The deployment MUST succeed.";

  const prompt = `
    Generate a detailed list of 12 to 18 realistic deployment log messages for deploying a ${projectType} app to ${target}, ${sourceContext}.
    ${outcomeContext}
    
    The logs must follow a realistic DevOps pipeline flow.
    If failing, end with specific error details suitable for analysis.
    If succeeding, end with "Deployment Successful".

    The log messages should be in ${languageName}, but keep technical terms (like 'Docker', 'Git', 'Build', 'Push', 'Terraform', 'Registry', 'Error', 'Exception') in English if that is standard for the language.
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
  if (!text) return ["Initializing...", "Error: Connection lost."];
  
  try {
    return JSON.parse(text) as string[];
  } catch (e) {
    return ["Initializing..."];
  }
};

export const analyzeDeploymentError = async (
  logs: LogEntry[],
  projectType: ProjectType,
  target: DeploymentTarget,
  lang: Language
): Promise<ErrorAnalysis> => {
  const languageName = getLanguageName(lang);
  const logContent = logs.map(l => `[${l.level.toUpperCase()}] ${l.message}`).join('\n');

  const prompt = `
    You are an expert DevOps AI Assistant. A deployment has failed.
    
    Project Type: ${projectType}
    Target: ${target}
    
    Logs:
    ${logContent}

    Please analyze the logs to identify the root cause of the failure.
    1. Provide a short 'diagnosis' (what went wrong).
    2. Provide a 'solution' (how to fix it conceptually).
    3. Provide a 'fixedContext' string. This string will be appended to the user's original project details to help the AI regenerate a correct configuration in the next attempt. It should be directive, e.g., "Ensure Dockerfile exposes port 8080" or "Add node_modules to .dockerignore".

    Output must be in ${languageName}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
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

  const text = response.text;
  if (!text) throw new Error("No analysis generated");

  return JSON.parse(text) as ErrorAnalysis;
};

export const analyzeRepo = async (repoUrl: string, branch: string = 'main', lang: Language): Promise<string> => {
  // 1. Parse URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error("Only GitHub repositories are supported for automatic analysis.");
  }
  const [_, owner, repoRaw] = match;
  const repo = repoRaw.replace(/\.git$/, '');

  // 2. Fetch Tree
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const resp = await fetch(apiUrl);
  if (!resp.ok) {
    throw new Error("Failed to fetch repository data. Ensure it is public.");
  }
  const data = await resp.json();
  
  // 3. Extract Files (limit to ~100 important files/paths to save tokens)
  const files = data.tree
    .filter((item: any) => item.type === 'blob')
    .map((item: any) => item.path)
    .filter((path: string) => {
        // Keep root files
        if (!path.includes('/')) return true;
        // Keep key config files in depth
        if (path.match(/(package\.json|requirements\.txt|Dockerfile|docker-compose|gemfile|pom\.xml|build\.gradle|\.env|\.config|next\.config|vite\.config)/i)) return true;
        // Limit depth
        return path.split('/').length < 3;
    })
    .slice(0, 100)
    .join('\n');

  if (!files) return "Empty repository.";

  // 4. AI Analysis
  const languageName = getLanguageName(lang);
  const prompt = `
    Analyze the following file structure from a GitHub repository:
    
    ${files}
    
    Identify the project type (Node, Python, etc.), framework (React, Django, etc.), and key infrastructure requirements (Docker, Databases inferred from configs).
    Provide a concise technical summary (2-3 sentences) describing the project stack and what is needed for deployment.
    Response must be in ${languageName}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  
  return response.text || "Analysis failed.";
};