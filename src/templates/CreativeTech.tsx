import type { ResumeData } from "../types/resume";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../components/SocialIcons";
import type { TemplatePreset } from "../data/templatesList";

interface TemplateProps {
  data: ResumeData;
  docType: "resume" | "cv";
  preset: TemplatePreset;
}

export default function CreativeTech({ data, docType, preset }: TemplateProps) {
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

  const getHeaderClass = (column: "side" | "main") => {
    return column === "side" 
      ? `tech-side-title header-style-${preset.headerStyle}`
      : `tech-main-title header-style-${preset.headerStyle}`;
  };

  const renderSectionContent = (sectionKey: string) => {
    switch (sectionKey) {
      case "summary":
        if (!personal.summary) return null;
        return (
          <div className="tech-main-section" key="summary">
            <h3 className={getHeaderClass("main")}>Profile Outline</h3>
            <p className="tech-summary-text">{personal.summary}</p>
          </div>
        );

      case "experience":
        if (displayExperience.length === 0) return null;
        return (
          <div className="tech-main-section" key="experience">
            <h3 className={getHeaderClass("main")}>Experience Timeline</h3>
            <div className="tech-timeline-wrap">
              {displayExperience.map((exp) => (
                <div className="tech-timeline-item" key={exp.id}>
                  <div className="tech-timeline-dot"></div>
                  <div className="tech-timeline-header">
                    <div>
                      <h4 className="tech-role-title">{exp.role}</h4>
                      <span className="tech-company-name">{exp.company}</span>
                    </div>
                    <div className="tech-date-lbl">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</div>
                  </div>
                  <ul className="tech-bullets">
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
          <div className="tech-main-section" key="projects">
            <h3 className={getHeaderClass("main")}>Technical Creations</h3>
            <div className="tech-projects-list">
              {displayProjects.map((proj) => (
                <div className="tech-project-item" key={proj.id}>
                  <div className="tech-project-header">
                    <h4 className="tech-project-name">{proj.title}</h4>
                    <div className="tech-project-links">
                      {proj.githubLink && <a href={proj.githubLink} className="tech-preview-link">GitHub</a>}
                      {proj.liveLink && <a href={proj.liveLink} className="tech-preview-link">Live</a>}
                    </div>
                  </div>
                  <div className="tech-project-tags">
                    {proj.technologies.map((t, idx) => (
                      <span key={idx} className="tech-tag">{t}</span>
                    ))}
                  </div>
                  <p className="tech-project-desc">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "education":
        if (displayEducation.length === 0) return null;
        return (
          <div className="tech-side-section" key="education">
            <h3 className={getHeaderClass("side")}>Education</h3>
            {displayEducation.map((edu) => (
              <div className="tech-side-item" key={edu.id}>
                <h4 className="tech-side-item-title">{edu.degree}</h4>
                <p className="tech-side-item-sub">{edu.fieldOfStudy}</p>
                <p className="tech-side-item-org">{edu.school}</p>
                <div className="tech-side-item-dates">
                  <span>{edu.startDate} - {edu.endDate}</span>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        );

      case "skills":
        if (displaySkills.length === 0) return null;
        const categories = Array.from(new Set(displaySkills.map(s => s.category)));
        return (
          <div className="tech-side-section" key="skills">
            <h3 className={getHeaderClass("side")}>Skills</h3>
            <div className="tech-side-skills">
              {categories.map(cat => {
                const catSkills = displaySkills.filter(s => s.category === cat).map(s => s.name);
                return (
                  <div className="tech-skill-group" key={cat}>
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
          <div className="tech-side-section" key="certificates">
            <h3 className={getHeaderClass("side")}>Achievements</h3>
            {displayCerts.map((cert) => (
              <div className="tech-side-item" key={cert.id} style={{ marginBottom: "10px" }}>
                <h4 className="tech-side-item-title" style={{ fontSize: "0.8rem" }}>{cert.title}</h4>
                <p className="tech-side-item-org" style={{ color: "rgba(255, 255, 255, 0.6)" }}>{cert.issuer}</p>
                <div className="tech-side-item-dates">
                  <span>{cert.date}</span>
                  {cert.link && <a href={cert.link} className="tech-side-link">Link</a>}
                </div>
              </div>
            ))}
          </div>
        );

      case "publications":
        const publicationsList = data.publications || [];
        if (publicationsList.length === 0) return null;
        return (
          <div className="tech-main-section" key="publications">
            <h3 className={getHeaderClass("main")}>Publications</h3>
            <div className="tech-projects-list">
              {publicationsList.map((pub) => (
                <div className="tech-project-item" key={pub.id}>
                  <div className="tech-project-header">
                    <h4 className="tech-project-name">{pub.title}</h4>
                    <div className="tech-project-links">
                      {pub.link && <a href={pub.link} className="tech-preview-link">View Paper</a>}
                    </div>
                  </div>
                  <div className="tech-project-tags" style={{ fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 6px 0", fontStyle: "italic" }}>
                    Published in: {pub.publisher} ({pub.date})
                  </div>
                  {pub.description && <p className="tech-project-desc">{pub.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const leftColKeys = ["education", "skills", "certificates"];
  const rightColKeys = ["summary", "experience", "projects", "publications"];

  const sidebarSections = sectionOrder.filter(key => leftColKeys.includes(key));
  const mainSections = sectionOrder.filter(key => rightColKeys.includes(key));

  return (
    <div className="creative-tech-template print-area">
      {/* Sidebar Column (Left) */}
      <div className="tech-sidebar">
        <div className="tech-profile-card">
          <h1 className="tech-name">{personal.name}</h1>
          <h2 className="tech-title">{personal.title}</h2>
        </div>

        {/* Contact details */}
        <div className="tech-contact-list">
          {personal.email && (
            <div className="tech-contact-row">
              <Mail size={12} className="tech-contact-icon" />
              <span>{personal.email}</span>
            </div>
          )}
          {personal.phone && (
            <div className="tech-contact-row">
              <Phone size={12} className="tech-contact-icon" />
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.location && (
            <div className="tech-contact-row">
              <MapPin size={12} className="tech-contact-icon" />
              <span>{personal.location}</span>
            </div>
          )}
          {personal.website && (
            <div className="tech-contact-row">
              <Globe size={12} className="tech-contact-icon" />
              <span>{personal.website.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
          {personal.github && (
            <div className="tech-contact-row">
              <GithubIcon size={12} className="tech-contact-icon" />
              <span>{personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}</span>
            </div>
          )}
          {personal.linkedin && (
            <div className="tech-contact-row">
              <LinkedinIcon size={12} className="tech-contact-icon" />
              <span>{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}</span>
            </div>
          )}
        </div>

        {/* Sidebar Sections */}
        <div className="tech-sidebar-sections">
          {sidebarSections.map(key => renderSectionContent(key))}
        </div>
      </div>

      {/* Main Content Column (Right) */}
      <div className="tech-main">
        {mainSections.map(key => renderSectionContent(key))}
      </div>

      <style>{`
        .creative-tech-template {
          display: grid;
          grid-template-columns: 1.15fr 2fr;
          background: #ffffff;
          font-size: var(--font-size-override, 10pt);
          min-height: 100%;
          width: 100%;
        }

        .tech-sidebar {
          background: #111111;
          color: #ffffff;
          padding: var(--margin-spacing-override, var(--spacing-resume, 40px 30px));
          display: flex;
          flex-direction: column;
          gap: var(--section-spacing-override, 30px);
        }

        .tech-profile-card {
          border-bottom: 2px solid var(--accent, #1e3a8a);
          padding-bottom: 20px;
        }

        .tech-name {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 6px;
        }

        .tech-title {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent, #1e3a8a);
        }

        .tech-contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.75rem;
        }

        .tech-contact-row {
          display: flex;
          align-items: center;
          gap: 10px;
          word-break: break-all;
        }

        .tech-contact-icon {
          color: var(--accent, #1e3a8a);
          flex-shrink: 0;
        }

        .tech-sidebar-sections {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .tech-side-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Dynamic headers styles (Sidebar) */
        .tech-side-title {
          font-size: 0.88rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          display: block;
          width: 100%;
        }

        .tech-side-title.header-style-default {
          border: none;
          padding: 0;
        }

        .tech-side-title.header-style-underline {
          border-bottom: 1.5px solid var(--accent, #1e3a8a);
          padding-bottom: 4px;
        }

        .tech-side-title.header-style-border {
          border-left: 3px solid var(--accent, #1e3a8a);
          padding-left: 8px;
        }

        .tech-side-title.header-style-block {
          background-color: rgba(255, 255, 255, 0.06);
          border-left: 3px solid var(--accent, #1e3a8a);
          padding: 6px 10px;
          border-radius: 4px;
        }

        .tech-side-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.8rem;
        }

        .tech-side-item-title {
          font-weight: 700;
          color: #ffffff;
        }

        .tech-side-item-sub {
          color: var(--accent, #1e3a8a);
          font-weight: 600;
        }

        .tech-side-item-org {
          color: rgba(255, 255, 255, 0.7);
        }

        .tech-side-item-dates {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.72rem;
          margin-top: 2px;
        }

        .tech-side-link {
          color: var(--accent, #1e3a8a);
          font-weight: 700;
        }

        .tech-side-skills {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tech-skill-group h5 {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent, #1e3a8a);
          margin-bottom: 2px;
        }

        .tech-skill-group p {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.4;
        }

        /* Main Content styles */
        .tech-main {
          padding: var(--margin-spacing-override, var(--spacing-resume, 40px));
          display: flex;
          flex-direction: column;
          gap: var(--section-spacing-override, 28px);
        }

        .tech-main-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Dynamic headers styles (Main panel) */
        .tech-main-title {
          font-size: 1.05rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #111111;
          display: block;
          width: 100%;
        }

        .tech-main-title.header-style-default {
          border: none;
          padding: 0;
        }

        .tech-main-title.header-style-underline {
          border-bottom: 2px solid var(--accent, #1e3a8a);
          padding-bottom: 6px;
        }

        .tech-main-title.header-style-border {
          border-left: 3px solid var(--accent, #1e3a8a);
          padding-left: 8px;
        }

        .tech-main-title.header-style-block {
          background-color: var(--secondary, #f4f4f5);
          border-left: 3.5px solid var(--accent, #1e3a8a);
          padding: 6px 12px;
          border-radius: 4px;
        }

        .tech-summary-text {
          font-size: 0.85rem;
          line-height: 1.6;
          color: #4b5563;
        }

        .tech-timeline-wrap {
          display: flex;
          flex-direction: column;
          position: relative;
          padding-left: 20px;
        }

        .tech-timeline-wrap::before {
          content: "";
          position: absolute;
          left: 4px;
          top: 6px;
          bottom: 6px;
          width: 1.5px;
          background: var(--border);
        }

        .tech-timeline-item {
          position: relative;
          padding-bottom: 18px;
        }

        .tech-timeline-item:last-child {
          padding-bottom: 0;
        }

        .tech-timeline-dot {
          position: absolute;
          left: -20px;
          top: 6px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid var(--accent, #1e3a8a);
        }

        .tech-timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }

        .tech-role-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111111;
        }

        .tech-company-name {
          font-size: 0.82rem;
          color: var(--accent, #1e3a8a);
          font-weight: 600;
        }

        .tech-date-lbl {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .tech-bullets {
          padding-left: 16px;
          font-size: 0.82rem;
          line-height: 1.5;
          color: #4b5563;
        }

        .tech-bullets li {
          margin-bottom: 2px;
        }

        .tech-projects-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tech-project-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tech-project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tech-project-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111111;
        }

        .tech-preview-link {
          font-size: 0.75rem;
          color: var(--accent, #1e3a8a);
          font-weight: 700;
          margin-left: 8px;
        }

        .tech-project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tech-tag {
          font-size: 0.72rem;
          font-weight: 600;
          background: var(--secondary);
          color: var(--secondary-foreground);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .tech-project-desc {
          font-size: 0.82rem;
          line-height: 1.5;
          color: #4b5563;
        }

        @media print {
          .creative-tech-template {
            grid-template-columns: 1.15fr 2fr;
            height: 100% !important;
          }
          .tech-sidebar {
            background: #111111 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
