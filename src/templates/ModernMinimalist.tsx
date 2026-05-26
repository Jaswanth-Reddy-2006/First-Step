import type { ResumeData } from "../types/resume";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../components/SocialIcons";
import type { TemplatePreset } from "../data/templatesList";

interface TemplateProps {
  data: ResumeData;
  docType: "resume" | "cv";
  preset: TemplatePreset;
}

export default function ModernMinimalist({ data, docType, preset }: TemplateProps) {
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
    return `section-title-preview header-style-${preset.headerStyle}`;
  };

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "summary":
        if (!personal.summary) return null;
        return (
          <div className="template-section" key="summary">
            <h3 className={getHeaderClass()}>Profile Summary</h3>
            <p className="summary-text-preview">{personal.summary}</p>
          </div>
        );

      case "experience":
        if (displayExperience.length === 0) return null;
        return (
          <div className="template-section" key="experience">
            <h3 className={getHeaderClass()}>Professional Experience</h3>
            <div className="list-preview">
              {displayExperience.map((exp) => (
                <div className="item-preview" key={exp.id}>
                  <div className="item-header-preview">
                    <div className="item-title-group">
                      <strong className="item-role">{exp.role}</strong>
                      <span className="item-separator">|</span>
                      <span className="item-org">{exp.company}</span>
                    </div>
                    <div className="item-meta-group">
                      <span className="item-date">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                      <span className="item-location">({exp.location})</span>
                    </div>
                  </div>
                  <ul className="item-bullets-preview">
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
          <div className="template-section" key="projects">
            <h3 className={getHeaderClass()}>Featured Projects</h3>
            <div className="list-preview">
              {displayProjects.map((proj) => (
                <div className="item-preview" key={proj.id}>
                  <div className="item-header-preview">
                    <div className="item-title-group">
                      <strong className="item-role">{proj.title}</strong>
                      <span className="item-tech">({proj.technologies.join(", ")})</span>
                    </div>
                    <div className="item-links-preview">
                      {proj.githubLink && (
                        <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="preview-link">
                          GitHub
                        </a>
                      )}
                      {proj.liveLink && (
                        <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" className="preview-link">
                          Live
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="item-desc-preview">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "education":
        if (displayEducation.length === 0) return null;
        return (
          <div className="template-section" key="education">
            <h3 className={getHeaderClass()}>Education History</h3>
            <div className="list-preview">
              {displayEducation.map((edu) => (
                <div className="item-preview" key={edu.id}>
                  <div className="item-header-preview">
                    <div className="item-title-group">
                      <strong className="item-role">{edu.degree} in {edu.fieldOfStudy}</strong>
                      <span className="item-separator">|</span>
                      <span className="item-org">{edu.school}</span>
                    </div>
                    <div className="item-meta-group">
                      <span className="item-date">{edu.startDate} - {edu.endDate}</span>
                      {edu.gpa && <span className="item-gpa">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                  {edu.description && <p className="item-desc-preview">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case "skills":
        if (displaySkills.length === 0) return null;
        const categories = Array.from(new Set(displaySkills.map(s => s.category)));
        return (
          <div className="template-section" key="skills">
            <h3 className={getHeaderClass()}>Skills & Tools</h3>
            <div className="skills-grid-preview">
              {categories.map(cat => {
                const catSkills = displaySkills.filter(s => s.category === cat).map(s => s.name);
                return (
                  <div className="skills-row-preview" key={cat}>
                    <strong className="skill-cat-lbl-preview">{cat}: </strong>
                    <span className="skill-values-preview">{catSkills.join(", ")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "certificates":
        if (displayCerts.length === 0) return null;
        return (
          <div className="template-section" key="certificates">
            <h3 className={getHeaderClass()}>Achievements & Certificates</h3>
            <div className="certs-grid-preview">
              {displayCerts.map((cert) => (
                <div className="cert-item-preview" key={cert.id}>
                  <div className="cert-header-preview">
                    <strong className="cert-title-preview">{cert.title}</strong>
                    <span className="cert-date-preview">{cert.date}</span>
                  </div>
                  <div className="cert-body-preview">
                    <span className="cert-issuer-preview">{cert.issuer}</span>
                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noopener noreferrer" className="preview-link">
                        Verify
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "publications":
        const publicationsList = data.publications || [];
        if (publicationsList.length === 0) return null;
        return (
          <div className="template-section" key="publications">
            <h3 className={getHeaderClass()}>Publications & Research</h3>
            <div className="list-preview">
              {publicationsList.map((pub) => (
                <div className="item-preview" key={pub.id}>
                  <div className="item-header-preview">
                    <div className="item-title-group">
                      <strong className="item-role">{pub.title}</strong>
                      <span className="item-separator">|</span>
                      <span className="item-org">{pub.publisher}</span>
                    </div>
                    <div className="item-meta-group">
                      <span className="item-date">{pub.date}</span>
                      {pub.link && (
                        <a href={pub.link} target="_blank" rel="noopener noreferrer" className="preview-link">
                          Link
                        </a>
                      )}
                    </div>
                  </div>
                  {pub.description && <p className="item-desc-preview">{pub.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modern-minimalist-template print-area">
      {/* Resume Header */}
      <div className="resume-header-preview">
        <h1 className="name-preview">{personal.name}</h1>
        <h2 className="title-preview">{personal.title}</h2>
        
        {/* Contact Info bar */}
        <div className="contact-info-preview">
          {personal.email && (
            <span className="contact-item">
              <Mail size={12} />
              {personal.email}
            </span>
          )}
          {personal.phone && (
            <span className="contact-item">
              <Phone size={12} />
              {personal.phone}
            </span>
          )}
          {personal.location && (
            <span className="contact-item">
              <MapPin size={12} />
              {personal.location}
            </span>
          )}
          {personal.website && (
            <span className="contact-item">
              <Globe size={12} />
              {personal.website.replace(/^https?:\/\//, "")}
            </span>
          )}
          {personal.github && (
            <span className="contact-item">
              <GithubIcon size={12} />
              {personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
            </span>
          )}
          {personal.linkedin && (
            <span className="contact-item">
              <LinkedinIcon size={12} />
              {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
            </span>
          )}
        </div>
      </div>

      {/* Render sections in order */}
      <div className="resume-body-preview">
        {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
      </div>

      <style>{`
        .modern-minimalist-template {
          background: #ffffff;
          color: #222222;
          padding: var(--margin-spacing-override, var(--spacing-resume, 40px));
          font-size: var(--font-size-override, 10pt);
          min-height: 100%;
          width: 100%;
        }

        .resume-body-preview {
          display: flex;
          flex-direction: column;
          gap: var(--section-spacing-override, 24px);
        }

        .resume-header-preview {
          text-align: left;
          border-bottom: 2px solid var(--accent, #1e3a8a);
          padding-bottom: 20px;
          margin-bottom: 24px;
        }

        .name-preview {
          font-size: 2.2rem;
          font-weight: 800;
          color: #111111;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .title-preview {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--accent, #1e3a8a);
          margin-bottom: 14px;
        }

        .contact-info-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 18px;
          font-size: 0.8rem;
          color: #555555;
        }

        .contact-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .contact-item svg {
          color: var(--accent, #1e3a8a);
        }

        .resume-body-preview {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .template-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Dynamic headers styles */
        .section-title-preview {
          font-size: 1.05rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #111111;
          letter-spacing: 0.05em;
          display: block;
          width: 100%;
        }

        .section-title-preview.header-style-default {
          border: none;
          padding: 0;
        }

        .section-title-preview.header-style-underline {
          border-bottom: 2px solid var(--accent, #1e3a8a);
          padding-bottom: 4px;
        }

        .section-title-preview.header-style-border {
          border-left: 3px solid var(--accent, #1e3a8a);
          padding-left: 8px;
        }

        .section-title-preview.header-style-block {
          background-color: var(--secondary, #f4f4f5);
          border-left: 3.5px solid var(--accent, #1e3a8a);
          padding: 6px 12px;
          border-radius: 4px;
        }

        .summary-text-preview {
          font-size: 0.88rem;
          line-height: 1.6;
          color: #4b5563;
        }

        .list-preview {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .item-preview {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-header-preview {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 4px;
        }

        .item-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .item-role {
          font-size: 0.95rem;
          color: #111111;
          font-weight: 700;
        }

        .item-separator {
          color: var(--border);
        }

        .item-org {
          font-size: 0.9rem;
          color: #374151;
          font-weight: 500;
        }

        .item-tech {
          font-size: 0.8rem;
          color: var(--accent, #1e3a8a);
          font-weight: 600;
        }

        .item-meta-group {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .item-bullets-preview {
          padding-left: 16px;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #4b5563;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-bullets-preview li {
          margin-bottom: 2px;
        }

        .item-desc-preview {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #4b5563;
        }

        .preview-link {
          font-size: 0.75rem;
          color: var(--accent, #1e3a8a);
          font-weight: 700;
          border-bottom: 1px solid transparent;
          margin-left: 8px;
        }

        .preview-link:hover {
          border-color: var(--accent, #1e3a8a);
        }

        .skills-grid-preview {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.85rem;
        }

        .skills-row-preview {
          line-height: 1.5;
        }

        .skill-cat-lbl-preview {
          color: #111111;
          font-weight: 700;
        }

        .skill-values-preview {
          color: #4b5563;
        }

        .certs-grid-preview {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px 24px;
        }

        .cert-item-preview {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.85rem;
          background: #fafafa;
          border: 1px solid var(--border);
          padding: 10px 14px;
          border-radius: 6px;
        }

        .cert-header-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cert-title-preview {
          font-weight: 700;
          color: #111111;
        }

        .cert-date-preview {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .cert-body-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #6b7280;
        }

        @media print {
          .modern-minimalist-template {
            padding: 0;
            background: transparent;
          }
        }
      `}</style>
    </div>
  );
}
