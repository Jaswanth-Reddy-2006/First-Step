import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ResumeData, AtsReport } from "../types/resume";

// Initialize genAI client
function getGenAIModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash as it is fast and highly capable for text analysis tasks
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
}

export async function analyzeAtsWithGemini(
  resume: ResumeData, 
  jobDescription: string, 
  apiKey: string
): Promise<AtsReport> {
  try {
    const model = getGenAIModel(apiKey);
    
    // Construct a concise text summary of the resume to feed to Gemini
    const resumeSummary = `
      Name: ${resume.personal.name}
      Title: ${resume.personal.title}
      Summary: ${resume.personal.summary}
      
      Work Experience:
      ${resume.experience.map(exp => `- ${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.points.join("; ")}`).join("\n")}
      
      Projects:
      ${resume.projects.filter(p => p.selected).map(proj => `- ${proj.title}: ${proj.description} (Tech: ${proj.technologies.join(", ")})`).join("\n")}
      
      Skills:
      ${resume.skills.filter(s => s.selected).map(s => s.name).join(", ")}
      
      Education:
      ${resume.education.map(edu => `- ${edu.degree} in ${edu.fieldOfStudy} from ${edu.school}`).join("\n")}
    `;

    const prompt = `
      You are an expert ATS (Applicant Tracking System) parser and recruiter.
      Analyze the candidate's resume content against the provided Job Description.
      
      Resume Content:
      """
      ${resumeSummary}
      """
      
      Job Description:
      """
      ${jobDescription}
      """
      
      Calculate an ATS score from 0 to 100 based on keyword match, relevance, and formatting completeness.
      Provide a list of matching keywords and missing keywords found in the job description that the candidate should add.
      Provide structured, bulleted actionable feedback to improve their resume alignment.
      Also generate a custom, high-impact Profile Summary (about 3-4 sentences) optimized for this specific job role.

      Return ONLY a JSON object matching this schema:
      {
        "score": number,
        "matchingKeywords": string[],
        "missingKeywords": string[],
        "feedback": string,
        "suggestedSummary": string
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean and parse JSON
    const parsedData = JSON.parse(responseText.trim());
    return {
      score: typeof parsedData.score === "number" ? parsedData.score : 50,
      matchingKeywords: Array.isArray(parsedData.matchingKeywords) ? parsedData.matchingKeywords : [],
      missingKeywords: Array.isArray(parsedData.missingKeywords) ? parsedData.missingKeywords : [],
      feedback: parsedData.feedback || "ATS analysis complete.",
      suggestedSummary: parsedData.suggestedSummary || ""
    };
  } catch (error) {
    console.error("Error running Gemini ATS analysis:", error);
    throw new Error("Failed to communicate with Gemini API. Please check your API key and network connection.");
  }
}

export async function optimizeProjectsAndSkillsWithGemini(
  resume: ResumeData,
  jobDescription: string,
  apiKey: string
): Promise<{ recommendedProjectIds: string[]; recommendedSkillIds: string[] }> {
  try {
    const model = getGenAIModel(apiKey);
    
    const projectsList = resume.projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      tech: p.technologies
    }));
    
    const skillsList = resume.skills.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category
    }));

    const prompt = `
      You are an AI career coach. You need to select the most relevant projects and skills from the candidate's portfolio that best fit the target Job Description.
      
      Projects available:
      ${JSON.stringify(projectsList, null, 2)}
      
      Skills available:
      ${JSON.stringify(skillsList, null, 2)}
      
      Job Description:
      """
      ${jobDescription}
      """
      
      1. Choose the top 2 projects that are most relevant to the job requirements.
      2. Choose all skills that match or are highly relevant to the technologies and soft skills listed in the job description.
      
      Return ONLY a JSON object matching this schema:
      {
        "recommendedProjectIds": string[],
        "recommendedSkillIds": string[]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText.trim());
    
    return {
      recommendedProjectIds: Array.isArray(parsedData.recommendedProjectIds) ? parsedData.recommendedProjectIds : [],
      recommendedSkillIds: Array.isArray(parsedData.recommendedSkillIds) ? parsedData.recommendedSkillIds : []
    };
  } catch (error) {
    console.error("Error optimizing projects/skills with Gemini:", error);
    throw new Error("Failed to retrieve suggestions from Gemini API.");
  }
}

export async function parseResumeWithGemini(
  resumeText: string,
  apiKey: string
): Promise<Partial<ResumeData>> {
  try {
    const model = getGenAIModel(apiKey);
    const prompt = `
      You are an expert resume parser. Extract information from the following raw resume text and organize it into a structured JSON format matching this schema:
      
      {
        "personal": {
          "name": string,
          "title": string,
          "email": string,
          "phone": string,
          "location": string,
          "github": string,
          "linkedin": string,
          "website": string,
          "summary": string
        },
        "education": [
          {
            "school": string,
            "degree": string,
            "fieldOfStudy": string,
            "startDate": string,
            "endDate": string,
            "gpa": string,
            "location": string,
            "description": string
          }
        ],
        "experience": [
          {
            "company": string,
            "role": string,
            "location": string,
            "startDate": string,
            "endDate": string,
            "current": boolean,
            "points": string[]
          }
        ],
        "projects": [
          {
            "title": string,
            "technologies": string[],
            "liveLink": string,
            "githubLink": string,
            "description": string
          }
        ],
        "skills": [
          {
            "name": string,
            "category": string
          }
        ],
        "certificates": [
          {
            "title": string,
            "issuer": string,
            "date": string,
            "link": string
          }
        ]
      }
      
      Notes:
      - Assign a unique name/category to skills (like "languages", "frontend", "backend", "tools").
      - Make sure strings are clean and empty strings are used for missing values.
      
      Raw Resume Text:
      """
      ${resumeText}
      """
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText.trim());
    return parsedData;
  } catch (error) {
    console.error("Error parsing resume with Gemini:", error);
    throw new Error("Failed to parse resume text. Please check your API key or text format.");
  }
}

export async function tailorResumeWithGemini(
  resume: ResumeData,
  jobTitle: string,
  jobDescription: string,
  apiKey: string
): Promise<{
  tailoredSummary: string;
  tailoredExperiences: { id: string; points: string[] }[];
}> {
  try {
    const model = getGenAIModel(apiKey);
    const resumeSummary = `
      Name: ${resume.personal.name}
      Title: ${resume.personal.title}
      Summary: ${resume.personal.summary}
      
      Work Experience:
      ${resume.experience.map(exp => `- ID: ${exp.id}, Role: ${exp.role} at ${exp.company}: ${exp.points.join("; ")}`).join("\n")}
    `;

    const prompt = `
      You are an expert executive resume writer. Tailor the candidate's professional summary and work experience bullet points to match the target Job Title and Description.
      
      Job Title: ${jobTitle}
      Job Description:
      """
      ${jobDescription}
      """
      
      Candidate's Content:
      """
      ${resumeSummary}
      """
      
      Rewrite the professional summary to highlight matching skills and background.
      For each work experience, rewrite the experience bullet points (points) to sound highly impactful, utilizing industry keywords and metrics where possible, matching the job description.
      
      Return ONLY a JSON object matching this schema:
      {
        "tailoredSummary": string,
        "tailoredExperiences": [
          {
            "id": string,
            "points": string[]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText.trim());
    return parsedData;
  } catch (error) {
    console.error("Error tailoring resume with Gemini:", error);
    throw new Error("Failed to tailor resume with Gemini API.");
  }
}
