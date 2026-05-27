import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type {
  ResumeData, Experience, Project, Education, Certificate, Skill,
  Publication, CustomField, CustomSection, CustomEntry
} from "../types/resume";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  activeTab: "personal" | "experience" | "projects" | "education" | "skills" | "certs" | "achievements" | "publications" | "custom-sections";
}

// ── Month/Year selector helpers ──────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1969 }, (_, i) => String(currentYear - i));

function parseMonthYear(value: string): { month: string; year: string } {
  const parts = value?.split(" ") ?? [];
  if (parts.length === 2 && MONTHS.includes(parts[0])) return { month: parts[0], year: parts[1] };
  if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return { month: "", year: parts[0] };
  return { month: "", year: "" };
}

interface MonthYearPickerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function MonthYearPicker({ value, onChange, disabled, placeholder }: MonthYearPickerProps) {
  const { month, year } = parseMonthYear(value);
  const emit = (m: string, y: string) => onChange(m && y ? `${m} ${y}` : y || m || "");
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <select
        className="form-input"
        value={month}
        disabled={disabled}
        onChange={e => emit(e.target.value, year)}
        style={{ flex: 1, minWidth: 0 }}
      >
        <option value="">{placeholder ?? "Month"}</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select
        className="form-input"
        value={year}
        disabled={disabled}
        onChange={e => emit(month, e.target.value)}
        style={{ flex: 1, minWidth: 0 }}
      >
        <option value="">Year</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

// ── Year-only picker ─────────────────────────────────────────────────────────
function YearPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="form-input" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select Year</option>
      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResumeForm({ data, onChange, activeTab }: ResumeFormProps) {

  // ── Personal Info ────────────────────────────────────────────────────────
  const handlePersonalChange = (field: keyof typeof data.personal, value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const addCustomField = () => {
    const newField: CustomField = { id: `cf-${Date.now()}`, label: "", value: "" };
    const current = data.personal.customFields ?? [];
    onChange({ ...data, personal: { ...data.personal, customFields: [...current, newField] } });
  };

  const updateCustomField = (id: string, key: "label" | "value", val: string) => {
    const updated = (data.personal.customFields ?? []).map(f => f.id === id ? { ...f, [key]: val } : f);
    onChange({ ...data, personal: { ...data.personal, customFields: updated } });
  };

  const removeCustomField = (id: string) => {
    const updated = (data.personal.customFields ?? []).filter(f => f.id !== id);
    onChange({ ...data, personal: { ...data.personal, customFields: updated } });
  };

  // ── Experience ───────────────────────────────────────────────────────────
  const handleExpChange = (id: string, field: keyof Experience, value: any) => {
    const updated = data.experience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onChange({ ...data, experience: updated });
  };

  const addBullet = (expId: string) => {
    const updated = data.experience.map(exp =>
      exp.id === expId ? { ...exp, points: [...exp.points, ""] } : exp
    );
    onChange({ ...data, experience: updated });
  };

  const updateBullet = (expId: string, idx: number, val: string) => {
    const updated = data.experience.map(exp => {
      if (exp.id !== expId) return exp;
      const newPts = [...exp.points];
      newPts[idx] = val;
      return { ...exp, points: newPts };
    });
    onChange({ ...data, experience: updated });
  };

  const removeBullet = (expId: string, idx: number) => {
    const updated = data.experience.map(exp => {
      if (exp.id !== expId) return exp;
      const newPts = exp.points.filter((_, i) => i !== idx);
      return { ...exp, points: newPts.length > 0 ? newPts : [""] };
    });
    onChange({ ...data, experience: updated });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`, company: "", role: "", location: "",
      startDate: "", endDate: "", current: false, points: [""]
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const removeExperience = (id: string) => onChange({ ...data, experience: data.experience.filter(e => e.id !== id) });

  // ── Projects ─────────────────────────────────────────────────────────────
  const handleProjectChange = (id: string, field: keyof Project, value: any) => {
    const updated = data.projects.map(p => {
      if (p.id !== id) return p;
      if (field === "technologies") {
        return { ...p, technologies: value.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0) };
      }
      return { ...p, [field]: value };
    });
    onChange({ ...data, projects: updated });
  };

  const addProject = () => {
    const newProj: Project = { id: `proj-${Date.now()}`, title: "", technologies: [], liveLink: "", githubLink: "", description: "", selected: true };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const removeProject = (id: string) => onChange({ ...data, projects: data.projects.filter(p => p.id !== id) });

  // ── Education ────────────────────────────────────────────────────────────
  const handleEduChange = (id: string, field: keyof Education, value: any) => {
    const updated = data.education.map(e => e.id === id ? { ...e, [field]: value } : e);
    onChange({ ...data, education: updated });
  };

  const addEducation = () => {
    const newEdu: Education = { id: `edu-${Date.now()}`, school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "", location: "", description: "" };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const removeEducation = (id: string) => onChange({ ...data, education: data.education.filter(e => e.id !== id) });

  // ── Skills ───────────────────────────────────────────────────────────────
  const handleSkillToggle = (id: string) => {
    const updated = data.skills.map(s => s.id === id ? { ...s, selected: !s.selected } : s);
    onChange({ ...data, skills: updated });
  };

  const removeSkill = (id: string) => onChange({ ...data, skills: data.skills.filter(s => s.id !== id) });

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCat, setNewSkillCat] = useState("Languages");
  const [newSkillCatCustom, setNewSkillCatCustom] = useState("");
  const [isCustomCat, setIsCustomCat] = useState(false);

  // Get all unique categories from skills
  const allCategories = Array.from(new Set(data.skills.map(s => s.category))).filter(Boolean);

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const cat = isCustomCat ? newSkillCatCustom.trim() || "Other" : newSkillCat;
    const newSkill: Skill = { id: `sk-${Date.now()}`, name: newSkillName.trim(), category: cat, selected: true };
    onChange({ ...data, skills: [...data.skills, newSkill] });
    setNewSkillName("");
  };

  // ── Certificates ─────────────────────────────────────────────────────────
  const handleCertChange = (id: string, field: keyof Certificate, value: any) => {
    const updated = data.certificates.map(c => c.id === id ? { ...c, [field]: value } : c);
    onChange({ ...data, certificates: updated });
  };

  const addCertificate = (category: "Certificates" | "Awards") => {
    const newCert: Certificate = { id: `cert-${Date.now()}`, title: "", issuer: "", date: "", link: "", category };
    onChange({ ...data, certificates: [...data.certificates, newCert] });
  };

  const removeCertificate = (id: string) => onChange({ ...data, certificates: data.certificates.filter(c => c.id !== id) });

  const certsList = data.certificates.filter(c => c.category === "Certificates" || !c.category);
  const achievementsList = data.certificates.filter(c => c.category === "Awards");

  // ── Publications ─────────────────────────────────────────────────────────
  const handlePubChange = (id: string, field: keyof Publication, value: any) => {
    const pubs = data.publications ?? [];
    const updated = pubs.map(p => p.id === id ? { ...p, [field]: value } : p);
    onChange({ ...data, publications: updated });
  };

  const addPublication = () => {
    const newPub: Publication = { id: `pub-${Date.now()}`, title: "", publisher: "", date: "", link: "", description: "" };
    onChange({ ...data, publications: [...(data.publications ?? []), newPub] });
  };

  const removePublication = (id: string) => {
    onChange({ ...data, publications: (data.publications ?? []).filter(p => p.id !== id) });
  };

  // ── Custom Sections ──────────────────────────────────────────────────────
  const addCustomSection = () => {
    const newSection: CustomSection = { id: `cs-${Date.now()}`, title: "Custom Section", entries: [] };
    onChange({ ...data, customSections: [...(data.customSections ?? []), newSection] });
  };

  const updateSectionTitle = (id: string, title: string) => {
    const updated = (data.customSections ?? []).map(s => s.id === id ? { ...s, title } : s);
    onChange({ ...data, customSections: updated });
  };

  const removeCustomSection = (id: string) => {
    onChange({ ...data, customSections: (data.customSections ?? []).filter(s => s.id !== id) });
  };

  const addSectionEntry = (sectionId: string) => {
    const newEntry: CustomEntry = { id: `ce-${Date.now()}`, heading: "", body: "" };
    const updated = (data.customSections ?? []).map(s =>
      s.id === sectionId ? { ...s, entries: [...s.entries, newEntry] } : s
    );
    onChange({ ...data, customSections: updated });
  };

  const updateSectionEntry = (sectionId: string, entryId: string, field: "heading" | "body", val: string) => {
    const updated = (data.customSections ?? []).map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, entries: s.entries.map(e => e.id === entryId ? { ...e, [field]: val } : e) };
    });
    onChange({ ...data, customSections: updated });
  };

  const removeSectionEntry = (sectionId: string, entryId: string) => {
    const updated = (data.customSections ?? []).map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, entries: s.entries.filter(e => e.id !== entryId) };
    });
    onChange({ ...data, customSections: updated });
  };

  const publicationsList = data.publications ?? [];
  const customSections = data.customSections ?? [];

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="resume-form-container">
      <div className="form-content">

        {/* ── PERSONAL INFO ─────────────────────────────────────────────── */}
        {activeTab === "personal" && (
          <div className="form-section">
            <h3 className="section-form-title">Personal Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={data.personal.name}
                  onChange={e => handlePersonalChange("name", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Professional Title</label>
                <input type="text" className="form-input" value={data.personal.title}
                  onChange={e => handlePersonalChange("title", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={data.personal.email}
                  onChange={e => handlePersonalChange("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" placeholder="+1 (555) 000-0000" value={data.personal.phone}
                  onChange={e => handlePersonalChange("phone", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Location (City, Country)</label>
                <input type="text" className="form-input" placeholder="e.g. San Francisco, CA" value={data.personal.location}
                  onChange={e => handlePersonalChange("location", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Personal Website</label>
                <input type="text" className="form-input" placeholder="yoursite.com" value={data.personal.website}
                  onChange={e => handlePersonalChange("website", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input type="text" className="form-input" placeholder="linkedin.com/in/username" value={data.personal.linkedin}
                  onChange={e => handlePersonalChange("linkedin", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input type="text" className="form-input" placeholder="github.com/username" value={data.personal.github}
                  onChange={e => handlePersonalChange("github", e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Professional Summary</label>
              <textarea className="form-input form-textarea" rows={5} value={data.personal.summary}
                onChange={e => handlePersonalChange("summary", e.target.value)} />
            </div>

            {/* Custom Fields */}
            {(data.personal.customFields ?? []).length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>Custom Contact Fields</h4>
                {(data.personal.customFields ?? []).map(field => (
                  <div key={field.id} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                    <input type="text" className="form-input" placeholder="Label (e.g. Portfolio)" value={field.label}
                      onChange={e => updateCustomField(field.id, "label", e.target.value)}
                      style={{ flex: 1 }} />
                    <input type="text" className="form-input" placeholder="Value (e.g. mysite.com)" value={field.value}
                      onChange={e => updateCustomField(field.id, "value", e.target.value)}
                      style={{ flex: 2 }} />
                    <button type="button" className="btn btn-danger btn-icon-only" onClick={() => removeCustomField(field.id)}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="btn btn-secondary btn-sm" onClick={addCustomField}
              style={{ marginTop: "12px" }}>
              <Plus size={13} /> Add Custom Field
            </button>
          </div>
        )}

        {/* ── WORK EXPERIENCE ──────────────────────────────────────────────── */}
        {activeTab === "experience" && (
          <div className="form-section">
            <div className="section-form-header">
              <h3 className="section-form-title">Work History</h3>
              <button className="btn btn-secondary btn-sm" onClick={addExperience} type="button">
                <Plus size={14} /> Add Experience
              </button>
            </div>

            {data.experience.length === 0 ? (
              <p className="form-empty-state">No experience added yet. Click above to add one.</p>
            ) : (
              data.experience.map((exp, index) => (
                <div key={exp.id} className="form-card-item">
                  <div className="form-card-header">
                    <span className="form-card-title-group">
                      <span className="badge">#{index + 1}</span>
                      <strong style={{ fontSize: "0.95rem" }}>{exp.role || "Role"}</strong>
                      {exp.company && <> at <strong>{exp.company}</strong></>}
                    </span>
                    <button className="btn btn-danger btn-icon-only" onClick={() => removeExperience(exp.id)} type="button">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Job Title / Role</label>
                      <input type="text" className="form-input" placeholder="e.g. Senior Software Engineer"
                        value={exp.role} onChange={e => handleExpChange(exp.id, "role", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input type="text" className="form-input" placeholder="e.g. Google" value={exp.company}
                        onChange={e => handleExpChange(exp.id, "company", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input type="text" className="form-input" placeholder="e.g. San Francisco, CA" value={exp.location}
                        onChange={e => handleExpChange(exp.id, "location", e.target.value)} />
                    </div>
                    <div className="form-group">
                      {/* "Currently work here" checkbox inline */}
                      <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Start Date</span>
                      </label>
                      <MonthYearPicker value={exp.startDate} onChange={v => handleExpChange(exp.id, "startDate", v)} />
                    </div>

                    {/* Checkbox row spanning full width */}
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="checkbox-label">
                        <input type="checkbox" checked={exp.current}
                          onChange={e => handleExpChange(exp.id, "current", e.target.checked)} />
                        <span>I currently work here</span>
                      </label>
                    </div>

                    {/* End date — only shown when NOT current */}
                    {!exp.current && (
                      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label">End Date</label>
                        <MonthYearPicker value={exp.endDate} onChange={v => handleExpChange(exp.id, "endDate", v)} />
                      </div>
                    )}
                  </div>

                  {/* Bullet Points — individual items */}
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <label className="form-label" style={{ margin: 0 }}>Key Achievements / Responsibilities</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => addBullet(exp.id)}>
                        <Plus size={12} /> Add Bullet
                      </button>
                    </div>
                    {exp.points.map((pt, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--accent)", fontWeight: 700, paddingTop: "10px", fontSize: "0.9rem", flexShrink: 0 }}>•</span>
                        <input type="text" className="form-input" placeholder="Describe a key achievement or responsibility..."
                          value={pt} onChange={e => updateBullet(exp.id, idx, e.target.value)}
                          style={{ flex: 1 }} />
                        <button type="button" className="btn btn-danger btn-icon-only"
                          onClick={() => removeBullet(exp.id, idx)}
                          style={{ flexShrink: 0, marginTop: "2px" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TECHNICAL PROJECTS ────────────────────────────────────────────── */}
        {activeTab === "projects" && (
          <div className="form-section">
            <div className="section-form-header">
              <h3 className="section-form-title">Technical Projects</h3>
              <button className="btn btn-secondary btn-sm" onClick={addProject} type="button">
                <Plus size={14} /> Add Project
              </button>
            </div>

            {data.projects.length === 0 ? (
              <p className="form-empty-state">No projects added yet. Click above to add one.</p>
            ) : (
              data.projects.map((proj, index) => (
                <div key={proj.id} className={`form-card-item ${!proj.selected ? "inactive-card" : ""}`}>
                  <div className="form-card-header">
                    <span className="form-card-title-group">
                      <span className="badge">#{index + 1}</span>
                      <strong style={{ fontSize: "0.95rem" }}>{proj.title || "Project Name"}</strong>
                    </span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <label className="checkbox-label" style={{ fontSize: "0.8rem" }}>
                        <input type="checkbox" checked={proj.selected}
                          onChange={e => handleProjectChange(proj.id, "selected", e.target.checked)} />
                        Include in Resume
                      </label>
                      <button className="btn btn-danger btn-icon-only" onClick={() => removeProject(proj.id)} type="button">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Project Title</label>
                      <input type="text" className="form-input" value={proj.title}
                        onChange={e => handleProjectChange(proj.id, "title", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Technologies (comma-separated)</label>
                      <input type="text" className="form-input" placeholder="React, Node.js, PostgreSQL"
                        value={proj.technologies.join(", ")}
                        onChange={e => handleProjectChange(proj.id, "technologies", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Live Demo URL</label>
                      <input type="text" className="form-input" placeholder="https://..." value={proj.liveLink}
                        onChange={e => handleProjectChange(proj.id, "liveLink", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GitHub Repository URL</label>
                      <input type="text" className="form-input" placeholder="https://github.com/..." value={proj.githubLink}
                        onChange={e => handleProjectChange(proj.id, "githubLink", e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: "16px" }}>
                    <label className="form-label">Project Description</label>
                    <textarea className="form-input form-textarea" rows={3} value={proj.description}
                      onChange={e => handleProjectChange(proj.id, "description", e.target.value)} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── EDUCATION ─────────────────────────────────────────────────────── */}
        {activeTab === "education" && (
          <div className="form-section">
            <div className="section-form-header">
              <h3 className="section-form-title">Education History</h3>
              <button className="btn btn-secondary btn-sm" onClick={addEducation} type="button">
                <Plus size={14} /> Add Education
              </button>
            </div>

            {data.education.length === 0 ? (
              <p className="form-empty-state">No education added yet. Click above to add one.</p>
            ) : (
              data.education.map((edu, index) => (
                <div key={edu.id} className="form-card-item">
                  <div className="form-card-header">
                    <span className="form-card-title-group">
                      <span className="badge">#{index + 1}</span>
                      <strong style={{ fontSize: "0.95rem" }}>{edu.degree || "Degree"}</strong>
                      {edu.school && <> at <strong>{edu.school}</strong></>}
                    </span>
                    <button className="btn btn-danger btn-icon-only" onClick={() => removeEducation(edu.id)} type="button">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">School / Institution</label>
                      <input type="text" className="form-input" value={edu.school}
                        onChange={e => handleEduChange(edu.id, "school", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree Obtained</label>
                      <input type="text" className="form-input" placeholder="e.g. B.Tech Computer Science"
                        value={edu.degree} onChange={e => handleEduChange(edu.id, "degree", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Field of Study</label>
                      <input type="text" className="form-input" value={edu.fieldOfStudy}
                        onChange={e => handleEduChange(edu.id, "fieldOfStudy", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location (City, Country)</label>
                      <input type="text" className="form-input" value={edu.location}
                        onChange={e => handleEduChange(edu.id, "location", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Start Year</label>
                      <YearPicker value={edu.startDate} onChange={v => handleEduChange(edu.id, "startDate", v)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Year (or Expected)</label>
                      <YearPicker value={edu.endDate} onChange={v => handleEduChange(edu.id, "endDate", v)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GPA / Grade Scale</label>
                      <input type="text" className="form-input" placeholder="e.g. 9.2/10 or 3.8/4.0"
                        value={edu.gpa} onChange={e => handleEduChange(edu.id, "gpa", e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: "16px" }}>
                    <label className="form-label">Additional Courses / Notes</label>
                    <textarea className="form-input form-textarea" rows={2} value={edu.description}
                      onChange={e => handleEduChange(edu.id, "description", e.target.value)} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── SKILLS INVENTORY ──────────────────────────────────────────────── */}
        {activeTab === "skills" && (
          <div className="form-section">
            <h3 className="section-form-title">Skills Inventory</h3>
            <p className="form-tab-instruction">
              Click a skill to toggle it on/off in your resume. Hit × to delete. Add new skills below.
            </p>

            {/* Dynamic categories from data */}
            {allCategories.map(category => {
              const catSkills = data.skills.filter(s => s.category.toLowerCase() === category.toLowerCase());
              return (
                <div key={category} className="skills-edit-group">
                  <h4 className="skills-edit-cat-title">{category}</h4>
                  <div className="skills-checkbox-grid">
                    {catSkills.map(skill => (
                      <div key={skill.id} className={`skill-checkbox-card ${skill.selected ? "selected" : ""}`}
                        onClick={() => handleSkillToggle(skill.id)}
                        style={{ cursor: "pointer", position: "relative" }}>
                        <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 600 }}>{skill.name}</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeSkill(skill.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "0 2px", lineHeight: 1, fontSize: "0.85rem" }}
                          title="Remove skill">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {allCategories.length === 0 && (
              <p className="form-empty-state">No skills added yet. Use the form below to add your first skill.</p>
            )}

            {/* Add Skill Form */}
            <form onSubmit={addCustomSkill} className="custom-skill-form">
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "14px" }}>Add New Skill</h4>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 2, minWidth: "140px", marginBottom: 0 }}>
                  <label className="form-label">Skill Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Kubernetes"
                    value={newSkillName} onChange={e => setNewSkillName(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: "120px", marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  {isCustomCat ? (
                    <input type="text" className="form-input" placeholder="Category name"
                      value={newSkillCatCustom} onChange={e => setNewSkillCatCustom(e.target.value)} />
                  ) : (
                    <select className="form-input" value={newSkillCat} onChange={e => {
                      if (e.target.value === "__custom__") { setIsCustomCat(true); }
                      else setNewSkillCat(e.target.value);
                    }}>
                      {allCategories.length === 0 && <option value="Languages">Languages</option>}
                      {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__custom__">+ New Category…</option>
                    </select>
                  )}
                </div>
                {isCustomCat && (
                  <button type="button" className="btn btn-secondary" style={{ height: "42px" }}
                    onClick={() => setIsCustomCat(false)}>Cancel</button>
                )}
                <button className="btn btn-primary" type="submit" style={{ height: "42px" }}>
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── CERTIFICATES ──────────────────────────────────────────────────── */}
        {activeTab === "certs" && (
          <div className="form-section">
            <div className="section-form-header">
              <h3 className="section-form-title">Certificates & Licenses</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => addCertificate("Certificates")} type="button">
                <Plus size={14} /> Add Certificate
              </button>
            </div>

            {certsList.length === 0 ? (
              <p className="form-empty-state">No certificates added yet. Click above to add one.</p>
            ) : (
              certsList.map((cert, index) => (
                <div key={cert.id} className="form-card-item">
                  <div className="form-card-header">
                    <span className="form-card-title-group">
                      <span className="badge">#{index + 1}</span>
                      <strong style={{ fontSize: "0.95rem" }}>{cert.title || "Certificate Title"}</strong>
                    </span>
                    <button className="btn btn-danger btn-icon-only" onClick={() => removeCertificate(cert.id)} type="button">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Certificate Title</label>
                      <input type="text" className="form-input" value={cert.title}
                        onChange={e => handleCertChange(cert.id, "title", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Issuer / Organization</label>
                      <input type="text" className="form-input" value={cert.issuer}
                        onChange={e => handleCertChange(cert.id, "issuer", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date (Year)</label>
                      <YearPicker value={cert.date} onChange={v => handleCertChange(cert.id, "date", v)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Verification URL</label>
                      <input type="text" className="form-input" value={cert.link}
                        onChange={e => handleCertChange(cert.id, "link", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ACHIEVEMENTS ──────────────────────────────────────────────────── */}
        {activeTab === "achievements" && (
          <div className="form-section">
            <div className="section-form-header">
              <h3 className="section-form-title">Achievements & Awards</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => addCertificate("Awards")} type="button">
                <Plus size={14} /> Add Achievement
              </button>
            </div>

            {achievementsList.length === 0 ? (
              <p className="form-empty-state">No achievements added yet. Click above to add one.</p>
            ) : (
              achievementsList.map((ach, index) => (
                <div key={ach.id} className="form-card-item">
                  <div className="form-card-header">
                    <span className="form-card-title-group">
                      <span className="badge">#{index + 1}</span>
                      <strong style={{ fontSize: "0.95rem" }}>{ach.title || "Achievement"}</strong>
                    </span>
                    <button className="btn btn-danger btn-icon-only" onClick={() => removeCertificate(ach.id)} type="button">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Award / Achievement Title</label>
                      <input type="text" className="form-input" value={ach.title}
                        onChange={e => handleCertChange(ach.id, "title", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Issuer / Event</label>
                      <input type="text" className="form-input" value={ach.issuer}
                        onChange={e => handleCertChange(ach.id, "issuer", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date (Year)</label>
                      <YearPicker value={ach.date} onChange={v => handleCertChange(ach.id, "date", v)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reference URL</label>
                      <input type="text" className="form-input" value={ach.link}
                        onChange={e => handleCertChange(ach.id, "link", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── PUBLICATIONS ──────────────────────────────────────────────────── */}
        {activeTab === "publications" && (
          <div className="form-section">
            <div className="section-form-header">
              <h3 className="section-form-title">Publications & Research</h3>
              <button className="btn btn-secondary btn-sm" onClick={addPublication} type="button">
                <Plus size={14} /> Add Publication
              </button>
            </div>

            {publicationsList.length === 0 ? (
              <p className="form-empty-state">No publications added yet. Click above to add one.</p>
            ) : (
              publicationsList.map((pub, index) => (
                <div key={pub.id} className="form-card-item">
                  <div className="form-card-header">
                    <span className="form-card-title-group">
                      <span className="badge">#{index + 1}</span>
                      <strong style={{ fontSize: "0.95rem" }}>{pub.title || "Paper Title"}</strong>
                    </span>
                    <button className="btn btn-danger btn-icon-only" onClick={() => removePublication(pub.id)} type="button">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Publication Title</label>
                      <input type="text" className="form-input" value={pub.title}
                        onChange={e => handlePubChange(pub.id, "title", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Publisher / Journal / Conf</label>
                      <input type="text" className="form-input" value={pub.publisher}
                        onChange={e => handlePubChange(pub.id, "publisher", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date (Year)</label>
                      <YearPicker value={pub.date} onChange={v => handlePubChange(pub.id, "date", v)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Paper Link URL</label>
                      <input type="text" className="form-input" value={pub.link}
                        onChange={e => handlePubChange(pub.id, "link", e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: "16px" }}>
                    <label className="form-label">Brief Abstract / Description</label>
                    <textarea className="form-input form-textarea" rows={2} value={pub.description}
                      onChange={e => handlePubChange(pub.id, "description", e.target.value)} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── CUSTOM SECTIONS ───────────────────────────────────────────────── */}
        {activeTab === "custom-sections" && (
          <div className="form-section">
            <div className="section-form-header">
              <h3 className="section-form-title">Custom Sections</h3>
              <button className="btn btn-secondary btn-sm" onClick={addCustomSection} type="button">
                <Plus size={14} /> New Section
              </button>
            </div>

            <p className="form-tab-instruction">
              Create your own sections with a custom title and entries. Great for Volunteering, Languages, Interests, References, etc.
            </p>

            {customSections.length === 0 ? (
              <p className="form-empty-state">No custom sections yet. Click "New Section" to create one.</p>
            ) : (
              customSections.map((section, sIdx) => (
                <div key={section.id} className="form-card-item">
                  {/* Section header */}
                  <div className="form-card-header">
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="badge">S{sIdx + 1}</span>
                      <input type="text" className="form-input" value={section.title}
                        onChange={e => updateSectionTitle(section.id, e.target.value)}
                        style={{ fontWeight: 700, fontSize: "0.95rem", flex: 1 }}
                        placeholder="Section Title (e.g. Volunteer Work)" />
                    </div>
                    <button className="btn btn-danger btn-icon-only" onClick={() => removeCustomSection(section.id)} type="button">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Entries */}
                  {section.entries.map((entry, eIdx) => (
                    <div key={entry.id} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px", marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Entry #{eIdx + 1}</span>
                        <button type="button" className="btn btn-danger btn-icon-only"
                          onClick={() => removeSectionEntry(section.id, entry.id)}>
                          <X size={12} />
                        </button>
                      </div>
                      <div className="form-group" style={{ marginBottom: "10px" }}>
                        <label className="form-label">Heading</label>
                        <input type="text" className="form-input" placeholder="e.g. Lead Volunteer — Red Cross"
                          value={entry.heading}
                          onChange={e => updateSectionEntry(section.id, entry.id, "heading", e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Details / Description</label>
                        <textarea className="form-input form-textarea" rows={2} placeholder="Describe this entry..."
                          value={entry.body}
                          onChange={e => updateSectionEntry(section.id, entry.id, "body", e.target.value)} />
                      </div>
                    </div>
                  ))}

                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => addSectionEntry(section.id)}>
                    <Plus size={12} /> Add Entry
                  </button>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      <style>{`
        .resume-form-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 20px;
        }

        .form-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
        }

        .form-section {
          animation: fade-in-section 0.25s ease-out;
        }

        .section-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-form-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-textarea {
          resize: vertical;
        }

        .form-empty-state {
          text-align: center;
          padding: 40px 20px;
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          color: var(--secondary-foreground);
          font-size: 0.95rem;
        }

        .form-card-item {
          background: var(--secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          margin-bottom: 20px;
          transition: var(--transition-fast);
        }

        .form-card-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .inactive-card {
          opacity: 0.6;
          background: var(--background);
          border-style: dashed;
        }

        .form-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }

        .form-card-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-icon-only {
          padding: 8px;
          border-radius: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          height: 100%;
          margin-bottom: 0;
          padding-top: 28px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .form-tab-instruction {
          font-size: 0.9rem;
          color: var(--secondary-foreground);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .skills-edit-group {
          margin-bottom: 24px;
        }

        .skills-edit-cat-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 6px;
          margin-bottom: 14px;
        }

        .skills-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
        }

        .skill-checkbox-card {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--background);
          font-size: 0.82rem;
          font-weight: 600;
          transition: var(--transition-fast);
          user-select: none;
        }

        .skill-checkbox-card:hover {
          border-color: var(--foreground);
        }

        .skill-checkbox-card.selected {
          border-color: var(--accent);
          background-color: var(--accent-light);
          color: var(--accent);
        }

        .skill-checkbox-card input {
          display: none;
        }

        .custom-skill-form {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px dashed var(--border);
        }

        .btn-sm {
          padding: 8px 14px;
          font-size: 0.85rem;
          height: auto;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        @keyframes fade-in-section {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .checkbox-group {
            padding-top: 0;
          }
        }
      `}</style>
    </div>
  );
}
