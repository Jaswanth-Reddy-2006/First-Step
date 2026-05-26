export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface CustomEntry {
  id: string;
  heading: string;
  body: string;
}

export interface CustomSection {
  id: string;
  title: string;
  entries: CustomEntry[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
  summary: string;
  customFields?: CustomField[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
  location: string;
  description: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  points: string[];
}

export interface Project {
  id: string;
  title: string;
  technologies: string[];
  liveLink: string;
  githubLink: string;
  description: string;
  selected: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  selected: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link: string;
  category?: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  link: string;
  description: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certificates: Certificate[];
  publications?: Publication[];
  customSections?: CustomSection[];
  sectionOrder: string[];
}

export interface AtsReport {
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  feedback: string;
  suggestedSummary?: string;
}
