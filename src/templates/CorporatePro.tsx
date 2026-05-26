import type { ResumeData } from "../types/resume";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../components/SocialIcons";
import type { TemplatePreset } from "../data/templatesList";

interface TemplateProps {
  data: ResumeData;
  docType: "resume" | "cv";
  preset: TemplatePreset;
}

export default function CorporatePro({ data, docType, preset }: TemplateProps) {
  const { personal, education, experience, projects, skills, certificates, sectionOrder } = data;

  const isResume = docType === "resume";

  // Filter items based on Document Type (Resume vs CV)
  const displayExperience = isResume ? experience.slice(0, 2) : experience;
  
  const displayProjects = isResume 
    ? projects.filter(p => p.selected).slice(0, 2) 
    : projects.filter(p => p.selected);

  const displaySkills = skills.filter(s => s.selected);
  const displayCerts = isResume ? certificates.slice(0, 2) : certificates;
  const displayEducation = isResume ? education.slice(0, 1) : education;

  const getHeaderClass = () => {
    return `corp-section-title header-style-${preset.headerStyle}`;
  };

  const renderSectionContent = (sectionKey: string) => {
    switch (sectionKey) {
      case "summary":
        if (!personal.summary) return null;
        return (
          <div className="corp-section" key="summary">
            <h3 className={getHeaderClass()}>Profile Overview</h3>
            <p className="corp-summary-text">{personal.summary}</p>
          </div>
        );

      case "experience":
        if (displayExperience.length === 0) return null;
        return (
          <div className="corp-section" key="experience">
            <h3 className={getHeaderClass()}>Work Experience</h3>
            <div className="corp-list">
              {displayExperience.map((exp) => (
                <div className="corp-item" key={exp.id}>
                  <div className="corp-item-header">
                    <div>
                      <h4 className="corp-item-role">{exp.role}</h4>
                      <span className="corp-item-org">{exp.company}</span>
                    </div>
                    <div className="corp-item-meta">
                      <span className="corp-item-date">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                      <span className="corp-item-loc">{exp.location}</span>
                    </div>
                  </div>
                  <ul className="corp-bullets">
                    {exp.points.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case "projects":
        if (displayProjects.length === 0) return null;
        return (
          <div className="corp-section" key="projects">
            <h3 className={getHeaderClass()}>Technical Projects</h3>
            <div className="corp-list">
              {displayProjects.map((proj) => (
                <div className="corp-item" key={proj.id}>
                  <div className="corp-item-header" style={{ marginBottom: "4px" }}>
                    <div>
                      <h4 className="corp-item-role">{proj.title}</h4>
                      <span className="corp-tech-stack">{proj.technologies.join(" • ")}</span>
                    </div>
                    <div className="corp-item-links">
                      {proj.githubLink && <a href={proj.githubLink} className="corp-link">Code</a>}
                      {proj.liveLink && <a href={proj.liveLink} className="corp-link">Demo</a>}
                    </div>
                  </div>
                  <p className="corp-desc">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "education":
        if (displayEducation.length === 0) return null;
        return (
          <div className="corp-section" key="education">
            <h3 className={getHeaderClass()}>Education</h3>
            <div className="corp-sidebar-list">
              {displayEducation.map((edu) => (
                <div className="corp-sidebar-item" key={edu.id}>
                  <h4 className="corp-sidebar-item-title">{edu.degree}</h4>
                  <p className="corp-sidebar-item-sub">{edu.fieldOfStudy}</p>
                  <p className="corp-sidebar-item-org">{edu.school}</p>
                  <div className="corp-sidebar-item-footer">
                    <span>{edu.startDate} - {edu.endDate}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "skills":
        if (displaySkills.length === 0) return null;
        const categories = Array.from(new Set(displaySkills.map(s => s.category)));
        return (
          <div className="corp-section" key="skills">
            <h3 className={getHeaderClass()}>Skills</h3>
            <div className="corp-skills-list">
              {categories.map(cat => {
                const catSkills = displaySkills.filter(s => s.category === cat).map(s => s.name);
                return (
                  <div className="corp-skill-cat" key={cat}>
                    <h5>{cat}</h5>
                    <p>{catSkills.join(", ")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "certificates":
        if (displayCerts.length === 0) return null;
        return (
          <div className="corp-section" key="certificates">
            <h3 className={getHeaderClass()}>Credentials</h3>
            <div className="corp-sidebar-list">
              {displayCerts.map((cert) => (
                <div className="corp-sidebar-item" key={cert.id} style={{ marginBottom: "8px" }}>
                  <h4 className="corp-sidebar-item-title" style={{ fontSize: "0.82rem" }}>{cert.title}</h4>
                  <p className="corp-sidebar-item-sub">{cert.issuer} ({cert.date})</p>
                  {cert.link && <a href={cert.link} className="corp-link" style={{ fontSize: "0.75rem" }}>Verify Link</a>}
                </div>
              ))}
            </div>
          </div>
        );

      case "publications":
        const publicationsList = data.publications || [];
        if (publicationsList.length === 0) return null;
        return (
          <div className="corp-section" key="publications">
            <h3 className={getHeaderClass()}>Publications</h3>
            <div className="corp-list">
              {publicationsList.map((pub) => (
                <div className="corp-item" key={pub.id}>
                  <div className="corp-item-header" style={{ marginBottom: "4px" }}>
                    <div>
                      <h4 className="corp-item-role">{pub.title}</h4>
                      <span className="corp-item-org">{pub.publisher}</span>
                    </div>
                    <div className="corp-item-meta">
                      <span className="corp-item-date">{pub.date}</span>
                      {pub.link && <a href={pub.link} className="corp-link">Paper Link</a>}
                    </div>
                  </div>
                  {pub.description && <p className="corp-desc">{pub.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Group sections by column preference
  const leftColKeys = ["summary", "experience", "projects", "publications"];
  const rightColKeys = ["skills", "education", "certificates"];

  const leftColumnSections = sectionOrder.filter(key => leftColKeys.includes(key));
  const rightColumnSections = sectionOrder.filter(key => rightColKeys.includes(key));

  return (
    <div className="corporate-pro-template print-area">
      {/* Top Header Banner */}
      <div className="corp-header-banner">
        <h1 className="corp-name">{personal.name}</h1>
        <h2 className="corp-title">{personal.title}</h2>
      </div>

      {/* Contact Info grid bar */}
      <div className="corp-contact-bar">
        {personal.email && <span><Mail size={11} /> {personal.email}</span>}
        {personal.phone && <span><Phone size={11} /> {personal.phone}</span>}
        {personal.location && <span><MapPin size={11} /> {personal.location}</span>}
        {personal.website && <span><Globe size={11} /> {personal.website.replace(/^https?:\/\//, "")}</span>}
        {personal.github && <span><GithubIcon size={11} /> {personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}</span>}
        {personal.linkedin && <span><LinkedinIcon size={11} /> {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}</span>}
      </div>

      {/* Two Column Layout */}
      <div className="corp-body-grid">
        {/* Left Column (Primary) */}
        <div className="corp-col-left">
          {leftColumnSections.map(key => renderSectionContent(key))}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="corp-col-right">
          {rightColumnSections.map(key => renderSectionContent(key))}
        </div>
      </div>

      <style>{`
        .corporate-pro-template {
          background: #ffffff;
          color: #222222;
          padding: 0;
          font-size: var(--font-size-override, 10pt);
          min-height: 100%;
          width: 100%;
        }

        .corp-header-banner {
          background: #111111;
          color: #ffffff;
          padding: 24px var(--margin-spacing-override, var(--spacing-resume, 40px));
          text-align: center;
          border-bottom: 4px solid var(--accent, #1e3a8a);
        }

        .corp-name {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .corp-title {
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent, #1e3a8a);
        }

        .corp-contact-bar {
          background: #fafafa;
          border-bottom: 1px solid var(--border);
          padding: 12px var(--margin-spacing-override, var(--spacing-resume, 40px));
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px 24px;
          font-size: 0.78rem;
          color: #555555;
        }

        .corp-contact-bar span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .corp-contact-bar svg {
          color: var(--accent, #1e3a8a);
        }

        .corp-body-grid {
          display: grid;
          grid-template-columns: 1.65fr 1fr;
          padding: var(--margin-spacing-override, var(--spacing-resume, 30px 40px));
          gap: var(--section-spacing-override, 30px);
        }

        .corp-col-left {
          display: flex;
          flex-direction: column;
          gap: var(--section-spacing-override, 24px);
        }

        .corp-col-right {
          display: flex;
          flex-direction: column;
          gap: var(--section-spacing-override, 24px);
          border-left: 1px solid var(--border);
          padding-left: 24px;
        }

        .corp-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Dynamic headers styles */
        .corp-section-title {
          font-size: 1rem;
          font-weight: 800;
          color: #111111;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          width: 100%;
        }

        .corp-section-title.header-style-default {
          border: none;
          padding: 0;
        }

        .corp-section-title.header-style-underline {
          border-bottom: 2px solid var(--accent, #1e3a8a);
          padding-bottom: 4px;
        }

        .corp-section-title.header-style-border {
          border-left: 3px solid var(--accent, #1e3a8a);
          padding-left: 8px;
          line-height: 1;
        }

        .corp-section-title.header-style-block {
          background-color: var(--secondary, #f4f4f5);
          border-left: 3.5px solid var(--accent, #1e3a8a);
          padding: 6px 10px;
          border-radius: 4px;
          line-height: 1.2;
        }

        .corp-summary-text {
          font-size: 0.85rem;
          line-height: 1.6;
          color: #4b5563;
        }

        .corp-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .corp-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .corp-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .corp-item-role {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111111;
        }

        .corp-item-org {
          font-size: 0.85rem;
          color: var(--accent, #1e3a8a);
          font-weight: 600;
        }

        .corp-item-meta {
          text-align: right;
          font-size: 0.78rem;
          color: #6b7280;
        }

        .corp-item-meta span {
          display: block;
        }

        .corp-bullets {
          padding-left: 16px;
          font-size: 0.82rem;
          line-height: 1.5;
          color: #4b5563;
        }

        .corp-bullets li {
          margin-bottom: 2px;
        }

        .corp-tech-stack {
          font-size: 0.78rem;
          color: #6b7280;
          font-weight: 500;
        }

        .corp-link {
          font-size: 0.75rem;
          color: var(--accent, #1e3a8a);
          font-weight: 700;
          margin-left: 8px;
        }

        .corp-desc {
          font-size: 0.82rem;
          line-height: 1.5;
          color: #4b5563;
        }

        /* Sidebar layouts */
        .corp-sidebar-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .corp-sidebar-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.85rem;
        }

        .corp-sidebar-item-title {
          font-weight: 700;
          color: #111111;
        }

        .corp-sidebar-item-sub {
          color: var(--accent, #1e3a8a);
          font-weight: 600;
          font-size: 0.8rem;
        }

        .corp-sidebar-item-org {
          color: #4b5563;
          font-size: 0.8rem;
        }

        .corp-sidebar-item-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 2px;
        }

        .corp-skills-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .corp-skill-cat {
          font-size: 0.8rem;
        }

        .corp-skill-cat h5 {
          font-weight: 700;
          color: #111111;
          margin-bottom: 2px;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        .corp-skill-cat p {
          color: #4b5563;
          line-height: 1.4;
        }

        @media print {
          .corporate-pro-template {
            background: transparent;
          }
          .corp-header-banner {
            background: #111111 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .corp-contact-bar {
            background: #fafafa !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
