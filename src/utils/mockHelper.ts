import type { ResumeData, AtsReport } from "../types/resume";

// Simple local helper to compute ATS score and matching when no API Key is provided
export function calculateLocalAtsScore(resume: ResumeData, jobDescription: string): AtsReport {
  if (!jobDescription || jobDescription.trim().length === 0) {
    return {
      score: 0,
      matchingKeywords: [],
      missingKeywords: [],
      feedback: "Please provide a job description to analyze your resume against."
    };
  }

  const jdText = jobDescription.toLowerCase();
  
  // Collect all words from the resume
  const resumeTextParts: string[] = [];
  resumeTextParts.push(resume.personal.name);
  resumeTextParts.push(resume.personal.title);
  resumeTextParts.push(resume.personal.summary);
  
  resume.experience.forEach(exp => {
    resumeTextParts.push(exp.role);
    resumeTextParts.push(exp.company);
    exp.points.forEach(p => resumeTextParts.push(p));
  });

  resume.projects.forEach(proj => {
    resumeTextParts.push(proj.title);
    resumeTextParts.push(proj.description);
    proj.technologies.forEach(t => resumeTextParts.push(t));
  });

  resume.skills.forEach(skill => {
    if (skill.selected) {
      resumeTextParts.push(skill.name);
    }
  });

  const fullResumeText = resumeTextParts.join(" ").toLowerCase();

  // Define some common industry keywords to check
  const commonKeywords = [
    "react", "next.js", "typescript", "javascript", "python", "node.js", "express", 
    "sql", "postgresql", "mongodb", "git", "docker", "aws", "cloud", "frontend", 
    "backend", "full stack", "api", "database", "ui", "ux", "dsa", "algorithms",
    "machine learning", "ai", "dashboard", "agile", "scrum", "ci/cd", "rest api"
  ];

  // Find which of these keywords are in the JD
  const jdKeywords = commonKeywords.filter(kw => jdText.includes(kw));
  
  if (jdKeywords.length === 0) {
    // If no specific keywords found, split JD into words and filter some stop words
    const words = jdText.split(/\W+/).filter(w => w.length > 4);
    const uniqueWords = Array.from(new Set(words)).slice(0, 15);
    jdKeywords.push(...uniqueWords);
  }

  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  jdKeywords.forEach(kw => {
    if (fullResumeText.includes(kw)) {
      matchingKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // Calculate score based on matches, presence of education, projects, contact info
  let score = 20; // Base score for having a resume structure
  
  // Keyword matching weight (50% max)
  if (jdKeywords.length > 0) {
    const matchPercentage = matchingKeywords.length / jdKeywords.length;
    score += Math.round(matchPercentage * 50);
  }

  // Completeness weights (30% max)
  if (resume.personal.email && resume.personal.phone) score += 5;
  if (resume.personal.github || resume.personal.linkedin) score += 5;
  if (resume.experience.length > 0) score += 10;
  if (resume.projects.filter(p => p.selected).length > 0) score += 5;
  if (resume.education.length > 0) score += 5;

  score = Math.min(score, 100);

  // Generate structured local feedback
  let feedback = `Your resume has an estimated ATS score of ${score}%. \n\n`;
  
  if (score < 50) {
    feedback += "⚠️ Strong Optimization Needed: Your resume has low alignment with the job description. Try adding more relevant keywords and completing missing sections.";
  } else if (score < 80) {
    feedback += "👍 Good alignment, but there is room for improvement. Focus on incorporating the missing technical keywords listed below.";
  } else {
    feedback += "✨ Excellent alignment! Your profile matches the job description very closely. Ready for submission.";
  }

  feedback += "\n\nSuggestions:\n";
  if (missingKeywords.length > 0) {
    feedback += `• Add these keywords to your skills or project descriptions: ${missingKeywords.slice(0, 5).join(", ")}.\n`;
  }
  if (resume.personal.summary.length < 50) {
    feedback += "• Expand your personal summary to highlight your specific expertise related to this role.\n";
  }
  if (resume.experience.some(exp => exp.points.length < 2)) {
    feedback += "• Add more descriptive bullet points to your work experiences detailing your achievements.\n";
  }

  return {
    score,
    matchingKeywords,
    missingKeywords,
    feedback,
    suggestedSummary: `A results-driven AI Frontend Developer and Computer Science student with practical experience in full-stack web applications. Demonstrated technical proficiency in ${matchingKeywords.slice(0, 4).join(", ") || "software development"} and a strong focus on building responsive UI interfaces. Proven capability to optimize code performance, solve algorithmic challenges, and integrate user-facing systems.`
  };
}

// Recommend which projects and skills match the job description locally
export function recommendLocalProjectsAndSkills(resume: ResumeData, jobDescription: string) {
  if (!jobDescription || jobDescription.trim().length === 0) {
    return {
      recommendedProjectIds: resume.projects.map(p => p.id),
      recommendedSkillIds: resume.skills.map(s => s.id)
    };
  }

  const jd = jobDescription.toLowerCase();

  // Score projects
  const recommendedProjectIds = resume.projects.map(proj => {
    let matchCount = 0;
    proj.technologies.forEach(tech => {
      if (jd.includes(tech.toLowerCase())) matchCount += 3;
    });
    const descWords = proj.description.toLowerCase().split(/\W+/);
    descWords.forEach(word => {
      if (word.length > 3 && jd.includes(word)) matchCount += 1;
    });
    return { id: proj.id, score: matchCount };
  })
  .sort((a, b) => b.score - a.score)
  // Recommends top matching projects
  .map(item => item.id);

  // Recommend skills
  const recommendedSkillIds = resume.skills.map(skill => {
    const isMatched = jd.includes(skill.name.toLowerCase());
    return { id: skill.id, matched: isMatched };
  })
  .filter(item => item.matched)
  .map(item => item.id);

  // If no skills are matched, fallback to all selected skills
  const skillIdsToReturn = recommendedSkillIds.length > 0 
    ? recommendedSkillIds 
    : resume.skills.filter(s => s.selected).map(s => s.id);

  return {
    recommendedProjectIds: recommendedProjectIds.slice(0, 2), // Keep top 2 projects
    recommendedSkillIds: skillIdsToReturn
  };
}
