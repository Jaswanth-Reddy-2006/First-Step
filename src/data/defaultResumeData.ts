import type { ResumeData } from "../types/resume";

// Blank starter — used when creating new documents (user fills in their own data)
export const defaultResumeData: ResumeData = {
  personal: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    website: "",
    summary: "",
    customFields: []
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certificates: [],
  publications: [],
  customSections: [],
  sectionOrder: ["summary", "experience", "projects", "skills", "education", "certificates", "publications"]
};

// Fictional sample data — used EXCLUSIVELY for template preview screenshots
// This is completely made-up and does NOT belong to any real person.
export const samplePreviewData: ResumeData = {
  personal: {
    name: "Alexandra Chen",
    title: "Senior Software Engineer",
    email: "alex.chen@techmail.io",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA",
    github: "github.com/alexc-dev",
    linkedin: "linkedin.com/in/alexandra-chen",
    website: "alexandrachen.dev",
    summary: "Results-driven Senior Software Engineer with 7+ years of experience building scalable full-stack applications and leading cross-functional engineering teams. Expertise in cloud-native architectures, React ecosystems, and Python microservices. Passionate about developer experience, performance optimization, and mentoring junior engineers to reach their full potential."
  },
  education: [
    {
      id: "edu-s1",
      school: "University of California, Berkeley",
      degree: "B.S. Computer Science",
      fieldOfStudy: "Computer Science",
      startDate: "2013",
      endDate: "2017",
      gpa: "3.91",
      location: "Berkeley, CA",
      description: "Concentration in Distributed Systems and Machine Learning. Dean's List (4 semesters). Teaching Assistant for CS61B Data Structures."
    }
  ],
  experience: [
    {
      id: "exp-s1",
      company: "Horizon Technologies",
      role: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "Mar 2021",
      endDate: "Present",
      current: true,
      points: [
        "Architected a real-time analytics dashboard serving 2M+ daily active users, reducing average query latency by 68% through PostgreSQL query optimization and Redis caching layers.",
        "Led a team of 6 engineers to migrate a 5-year-old monolith to microservices on AWS ECS, cutting deployment time from 45 minutes to under 8 minutes.",
        "Designed a reusable React component library adopted by 4 product teams, accelerating feature delivery velocity by 35% across the engineering org."
      ]
    },
    {
      id: "exp-s2",
      company: "NovaSpark Inc.",
      role: "Software Engineer",
      location: "Seattle, WA",
      startDate: "Jun 2017",
      endDate: "Feb 2021",
      current: false,
      points: [
        "Built and maintained Python FastAPI backend services handling 500K+ daily API requests with 99.98% uptime SLA compliance.",
        "Implemented end-to-end CI/CD pipelines using GitHub Actions and Terraform, eliminating 15+ hours of manual release overhead per sprint.",
        "Integrated Stripe payment gateway processing $2.4M in monthly transactions with full PCI-DSS compliance and automated fraud detection."
      ]
    }
  ],
  projects: [
    {
      id: "proj-s1",
      title: "StreamFlow — Real-Time Collaboration Engine",
      technologies: ["TypeScript", "React", "WebSockets", "Redis", "Docker"],
      liveLink: "https://streamflow.app",
      githubLink: "https://github.com/alexc-dev/streamflow",
      description: "Open-source collaborative whiteboard engine supporting 100+ concurrent users per canvas with conflict-free CRDT sync, operational transformation, and sub-50ms end-to-end latency.",
      selected: true
    },
    {
      id: "proj-s2",
      title: "MLPipeline — AutoML Orchestration Platform",
      technologies: ["Python", "FastAPI", "Celery", "PostgreSQL", "Kubernetes"],
      liveLink: "",
      githubLink: "https://github.com/alexc-dev/mlpipeline",
      description: "Automated machine learning pipeline orchestrator reducing model training setup from days to hours, with support for scikit-learn, XGBoost, and PyTorch backends.",
      selected: true
    }
  ],
  skills: [
    { id: "sk-s1", name: "TypeScript", category: "Languages", selected: true },
    { id: "sk-s2", name: "Python", category: "Languages", selected: true },
    { id: "sk-s3", name: "Go", category: "Languages", selected: true },
    { id: "sk-s4", name: "React & Next.js", category: "Frontend", selected: true },
    { id: "sk-s5", name: "Node.js", category: "Backend", selected: true },
    { id: "sk-s6", name: "FastAPI", category: "Backend", selected: true },
    { id: "sk-s7", name: "PostgreSQL", category: "Database", selected: true },
    { id: "sk-s8", name: "AWS (ECS, Lambda, S3)", category: "Cloud", selected: true },
    { id: "sk-s9", name: "Docker & Kubernetes", category: "DevOps", selected: true },
    { id: "sk-s10", name: "GitHub Actions / Terraform", category: "DevOps", selected: true }
  ],
  certificates: [
    {
      id: "cert-s1",
      title: "AWS Solutions Architect — Associate",
      issuer: "Amazon Web Services",
      date: "2022",
      link: "https://aws.amazon.com/verify",
      category: "Certificates"
    },
    {
      id: "cert-s2",
      title: "Best Innovation Award",
      issuer: "TechSummit Global 2023",
      date: "2023",
      link: "",
      category: "Awards"
    }
  ],
  publications: [],
  customSections: [],
  sectionOrder: ["summary", "experience", "projects", "skills", "education", "certificates", "publications"]
};
