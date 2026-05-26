import { useState, useEffect, useRef } from "react";
import { 
  FileEdit, Layers, Cpu, Home, User, Briefcase, Code, 
  GraduationCap, Award, Wrench, Layout, Printer, Download, Search, Check, FileText,
  ChevronDown, ChevronUp, Plus, Trash2, Copy, Sparkles, Upload
} from "lucide-react";
import type { ResumeData } from "../types/resume";
import { defaultResumeData, samplePreviewData } from "../data/defaultResumeData";
import * as resumeService from "../lib/resumeService";
import ResumeForm from "./ResumeForm";
import SectionManager from "./SectionManager";
import AtsAnalyzer from "./AtsAnalyzer";
import { templatesList, fontFamilies } from "../data/templatesList";
import type { TemplatePreset } from "../data/templatesList";
import { parseResumeWithGemini, tailorResumeWithGemini } from "../utils/geminiHelper";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface SavedResume {
  id: string;
  name: string;
  lastModified: string;
  docType: "resume" | "cv";
  presetId: string;
  fontSize?: number;
  sectionSpacing?: number;
  marginSpacing?: number;
  data: ResumeData;
}

interface DashboardProps {
  currentUser: { name: string; email: string };
}

export default function Dashboard({ currentUser }: DashboardProps) {
  // Resume states
  const [resumesList, setResumesList] = useState<SavedResume[]>([]);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [sidebarTab, setSidebarTab] = useState<"home" | "edit" | "ats" | "tailor" | "bullet-enhancer" | "customize-doc" | "import-resume" | "import-template">("home");
  const [formTab, setFormTab] = useState<"personal" | "experience" | "projects" | "education" | "skills" | "certs" | "achievements" | "publications" | "custom-sections">("personal");
  const [docType, setDocType] = useState<"resume" | "cv">("resume");
  
  // Custom sizing override states
  const [fontSizeOverride, setFontSizeOverride] = useState(10.5);
  const [sectionSpacingOverride, setSectionSpacingOverride] = useState(24);
  const [marginSpacingOverride, setMarginSpacingOverride] = useState(35);

  // Collapsible Dropbox and Sub-tabs states — accordion: only one open at a time
  const [openSection, setOpenSection] = useState<"details" | "docs" | "optimize" | "templates" | null>(null);
  const toggleSection = (section: "details" | "docs" | "optimize" | "templates") => {
    setOpenSection(prev => prev === section ? null : section);
  };
  const [configSubTab, setConfigSubTab] = useState<"template" | "arrange" | "export">("template");

  // Custom & Filtered templates library states
  const [customPresets, setCustomPresets] = useState<TemplatePreset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset>(templatesList[0]);

  // AI Import state
  const [importText, setImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [isDragover, setIsDragover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Job Role Tailor state
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [jobDescInput, setJobDescInput] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorError, setTailorError] = useState("");
  const [tailorSuccess, setTailorSuccess] = useState(false);

  // AI Tailor from Home screen state
  const [newAiDocName, setNewAiDocName] = useState("");
  const [newAiJobTitle, setNewAiJobTitle] = useState("");
  const [newAiJobDesc, setNewAiJobDesc] = useState("");
  const [isAiCreating, setIsAiCreating] = useState(false);
  const [aiCreateError, setAiCreateError] = useState("");

  // AI Bullet Enhancer state
  const [weakBullet, setWeakBullet] = useState("");
  const [enhancedBullet, setEnhancedBullet] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState("");

  // Custom Template importer state
  const [customTplName, setCustomTplName] = useState("");
  const [customTplLayout, setCustomTplLayout] = useState<"minimalist" | "corporate" | "creative">("minimalist");
  const [customTplFont, setCustomTplFont] = useState<"space" | "inter" | "roboto" | "lora" | "georgia" | "outfit" | "opensans" | "georgian">("inter");
  const [customTplColor, setCustomTplColor] = useState("#1e3a8a");
  const [customTplSpacing, setCustomTplSpacing] = useState<"compact" | "regular" | "spacious">("regular");
  const [customTplHeader, setCustomTplHeader] = useState<"default" | "underline" | "border" | "block">("default");
  const [customTplSuccess, setCustomTplSuccess] = useState(false);

  // Resume Renaming states
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [newResumeName, setNewResumeName] = useState("");
  const [newDocType, setNewDocType] = useState<"resume" | "cv">("resume");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<"standard" | "ai">("standard");

  const allPresets = [...templatesList, ...customPresets];
  const filteredPresets = allPresets.filter(preset =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load resumes when currentUser is resolved (DB first, localStorage fallback)
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        const parsed = await resumeService.listResumes(currentUser.email);
        if (parsed.length > 0) {
          setResumesList(parsed);
          const activeId = localStorage.getItem(`first_step_active_id_${currentUser.email}`) || parsed[0].id;
          const activeResume = parsed.find(r => r.id === activeId) || parsed[0];
          setCurrentResumeId(activeResume.id);
          // Ensure data has all required fields (backwards compat)
          const safeData = {
            ...defaultResumeData,
            ...activeResume.data,
            personal: { ...defaultResumeData.personal, ...activeResume.data?.personal, customFields: activeResume.data?.personal?.customFields ?? [] },
            customSections: activeResume.data?.customSections ?? []
          };
          setResumeData(safeData);
          setFontSizeOverride(activeResume.fontSize || 10.5);
          setSectionSpacingOverride(activeResume.sectionSpacing || 24);
          setMarginSpacingOverride(activeResume.marginSpacing || 35);
          const savedPresetsCombined = [...templatesList, ...customPresets];
          const matched = savedPresetsCombined.find(p => p.id === activeResume.presetId) || templatesList[0];
          setSelectedPreset(matched);
          setDocType(activeResume.docType || "resume");
        } else {
          await initializeFirstResume(currentUser.email);
        }
      } catch (e) {
        console.error("Error loading resumes:", e);
        await initializeFirstResume(currentUser.email);
      }
    };

    loadData();

    // Load custom presets
    const savedCustom = localStorage.getItem("first_step_custom_presets");
    if (savedCustom) {
      try { setCustomPresets(JSON.parse(savedCustom)); } catch { /* ignore */ }
    }
  }, [currentUser]);

  // Update presets list dynamically when custom presets are loaded
  useEffect(() => {
    if (currentResumeId && resumesList.length > 0) {
      const active = resumesList.find(r => r.id === currentResumeId);
      if (active) {
        const savedPresetsCombined = [...templatesList, ...customPresets];
        const matched = savedPresetsCombined.find(p => p.id === active.presetId) || templatesList[0];
        setSelectedPreset(matched);
      }
    }
  }, [customPresets, currentResumeId]);

  // Save helper — updates state + syncs to service (DB or localStorage)
  const saveResumesList = (updatedList: typeof resumesList) => {
    setResumesList(updatedList);
    if (currentUser) resumeService.saveAllLocal(currentUser.email, updatedList);
  };

  // Sync data saves
  const handleDataChange = (newData: ResumeData) => {
    setResumeData(newData);
    if (currentResumeId && currentUser) {
      const updatedList = resumesList.map(r =>
        r.id === currentResumeId
          ? { ...r, data: newData, lastModified: new Date().toISOString() }
          : r
      );
      saveResumesList(updatedList);
      // Async DB sync in background
      resumeService.updateResume(currentUser.email, currentResumeId, { data: newData }).catch(() => {});
    }
  };

  const handlePresetSelect = (preset: TemplatePreset) => {
    setSelectedPreset(preset);
    if (currentResumeId && currentUser) {
      const updatedList = resumesList.map(r =>
        r.id === currentResumeId ? { ...r, presetId: preset.id, lastModified: new Date().toISOString() } : r
      );
      saveResumesList(updatedList);
      resumeService.updateResume(currentUser.email, currentResumeId, { presetId: preset.id }).catch(() => {});
    }
  };

  const handleDocTypeChange = (type: "resume" | "cv") => {
    setDocType(type);
    if (currentResumeId && currentUser) {
      const updatedList = resumesList.map(r =>
        r.id === currentResumeId ? { ...r, docType: type, lastModified: new Date().toISOString() } : r
      );
      saveResumesList(updatedList);
      resumeService.updateResume(currentUser.email, currentResumeId, { docType: type }).catch(() => {});
    }
  };

  // Override Size settings sync
  const handleSizeChange = (field: "fontSize" | "sectionSpacing" | "marginSpacing", value: number) => {
    if (field === "fontSize") setFontSizeOverride(value);
    if (field === "sectionSpacing") setSectionSpacingOverride(value);
    if (field === "marginSpacing") setMarginSpacingOverride(value);
    if (currentResumeId && currentUser) {
      const updatedList = resumesList.map(r =>
        r.id === currentResumeId ? { ...r, [field]: value, lastModified: new Date().toISOString() } : r
      );
      saveResumesList(updatedList);
      resumeService.updateResume(currentUser.email, currentResumeId, { [field]: value }).catch(() => {});
    }
  };

  const handleSelectResume = (id: string) => {
    const selected = resumesList.find(r => r.id === id);
    if (selected) {
      setCurrentResumeId(id);
      setResumeData(selected.data);
      const savedPresetsCombined = [...templatesList, ...customPresets];
      const matchedPreset = savedPresetsCombined.find(p => p.id === selected.presetId) || templatesList[0];
      setSelectedPreset(matchedPreset);
      setDocType(selected.docType);
      
      setFontSizeOverride(selected.fontSize || 10.5);
      setSectionSpacingOverride(selected.sectionSpacing || 24);
      setMarginSpacingOverride(selected.marginSpacing || 35);

      if (currentUser) {
        localStorage.setItem(`first_step_active_id_${currentUser.email}`, id);
      }
      setSidebarTab("edit");
      setFormTab("personal");
      setOpenSection("details");
    }
  };

  const handleDuplicateResume = async (id: string) => {
    const target = resumesList.find(r => r.id === id);
    if (target && currentUser) {
      const newResume: SavedResume = {
        ...target,
        id: `resume-${Date.now()}`,
        name: `${target.name} (Copy)`,
        lastModified: new Date().toISOString()
      };
      const saved = await resumeService.duplicateResume(currentUser.email, id, newResume);
      saveResumesList([...resumesList, saved]);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (resumesList.length <= 1) {
      alert("You must keep at least one document.");
      return;
    }
    if (!confirm("Are you sure you want to delete this document?") || !currentUser) return;
    const updatedList = resumesList.filter(r => r.id !== id);
    await resumeService.deleteResume(currentUser.email, id);
    saveResumesList(updatedList);
    if (currentResumeId === id) {
      const next = updatedList[0];
      setCurrentResumeId(next.id);
      setResumeData({ ...defaultResumeData, ...next.data, customSections: next.data?.customSections ?? [] });
      const matched = [...templatesList, ...customPresets].find(p => p.id === next.presetId) || templatesList[0];
      setSelectedPreset(matched);
      setDocType(next.docType);
      setFontSizeOverride(next.fontSize || 10.5);
      setSectionSpacingOverride(next.sectionSpacing || 24);
      setMarginSpacingOverride(next.marginSpacing || 35);
      localStorage.setItem(`first_step_active_id_${currentUser.email}`, next.id);
    }
  };

  const handleRenameResumeSubmit = (id: string) => {
    if (!renameValue.trim() || !currentUser) return;
    const updatedList = resumesList.map(r =>
      r.id === id ? { ...r, name: renameValue.trim(), lastModified: new Date().toISOString() } : r
    );
    saveResumesList(updatedList);
    resumeService.updateResume(currentUser.email, id, { name: renameValue.trim() }).catch(() => {});
    setRenameId(null);
    setRenameValue("");
  };

  const handleCreateNewResume = async () => {
    if (!newResumeName.trim() || !currentUser) return;
    const blankResume: SavedResume = {
      id: `resume-${Date.now()}`,
      name: newResumeName.trim(),
      lastModified: new Date().toISOString(),
      docType: newDocType,
      presetId: templatesList[0].id,
      fontSize: 10.5,
      sectionSpacing: 24,
      marginSpacing: 35,
      data: { ...defaultResumeData, customSections: [] }
    };
    const saved = await resumeService.createResume(currentUser.email, blankResume);
    const updatedList = [...resumesList, saved];
    saveResumesList(updatedList);
    setCurrentResumeId(saved.id);
    setResumeData({ ...defaultResumeData, customSections: [] });
    setSelectedPreset(templatesList[0]);
    setDocType(newDocType);
    setFontSizeOverride(10.5);
    setSectionSpacingOverride(24);
    setMarginSpacingOverride(35);
    localStorage.setItem(`first_step_active_id_${currentUser.email}`, saved.id);
    setNewResumeName("");
    setIsCreateModalOpen(false);
    setSidebarTab("edit");
    setFormTab("personal");
  };

  // AI Tailor from Home screen card handler
  const handleAiCreateNewResume = async () => {
    if (!newAiDocName.trim() || !newAiJobTitle.trim() || !newAiJobDesc.trim() || !currentUser) return;
    setIsAiCreating(true);
    setAiCreateError("");

    const savedKey = localStorage.getItem("first_step_gemini_key") || "";
    if (!savedKey) {
      setAiCreateError("Gemini API Key is missing. Please enter your API Key in the ATS Audit panel first.");
      setIsAiCreating(false);
      return;
    }

    try {
      // Call tailor helper to rewrite default resume content
      const tailored = await tailorResumeWithGemini(defaultResumeData, newAiJobTitle, newAiJobDesc, savedKey);
      
      const newResumeData: ResumeData = {
        ...defaultResumeData,
        personal: {
          ...defaultResumeData.personal,
          summary: tailored.tailoredSummary || defaultResumeData.personal.summary
        },
        experience: defaultResumeData.experience.map(exp => {
          const matchingTailored = tailored.tailoredExperiences?.find(te => te.id === exp.id);
          return matchingTailored 
            ? { ...exp, points: matchingTailored.points }
            : exp;
        })
      };

      const newId = `resume-${Date.now()}`;
      const newResume: SavedResume = {
        id: newId,
        name: newAiDocName,
        lastModified: new Date().toLocaleDateString(),
        docType: "resume",
        presetId: templatesList[0].id,
        fontSize: 10.5,
        sectionSpacing: 24,
        marginSpacing: 35,
        data: newResumeData
      };

      const saved = await resumeService.createResume(currentUser.email, newResume);
      const updatedList = [...resumesList, saved];
      saveResumesList(updatedList);

      setCurrentResumeId(saved.id);
      setResumeData(newResumeData);
      setSelectedPreset(templatesList[0]);
      setDocType("resume");

      setFontSizeOverride(10.5);
      setSectionSpacingOverride(24);
      setMarginSpacingOverride(35);

      localStorage.setItem(`first_step_active_id_${currentUser.email}`, saved.id);

      setNewAiDocName("");
      setNewAiJobTitle("");
      setNewAiJobDesc("");
      setIsCreateModalOpen(false);
      setSidebarTab("edit");
      setFormTab("personal");
      setOpenSection("details");
    } catch (err: any) {
      console.error(err);
      setAiCreateError(err.message || "Failed to generate tailored resume with AI.");
    } finally {
      setIsAiCreating(false);
    }
  };



  const initializeFirstResume = async (email: string) => {
    const blankResume: SavedResume = {
      id: `resume-${Date.now()}`,
      name: "My First Resume",
      lastModified: new Date().toISOString(),
      docType: "resume",
      presetId: templatesList[0].id,
      fontSize: 10.5,
      sectionSpacing: 24,
      marginSpacing: 35,
      data: { ...defaultResumeData, customSections: [] }
    };
    const saved = await resumeService.createResume(email, blankResume).catch(() => blankResume);
    const list = [saved];
    setResumesList(list);
    resumeService.saveAllLocal(email, list);
    setCurrentResumeId(saved.id);
    setResumeData({ ...defaultResumeData, customSections: [] });
    setSelectedPreset(templatesList[0]);
    setDocType("resume");
  };

  // Nav link click router
  const navigateToFormTab = (tab: typeof formTab) => {
    setSidebarTab("edit");
    setFormTab(tab);
    setOpenSection("details");
  };

  // AI Details Import Parser
  const handleAiImport = async () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    setImportError("");
    setImportSuccess(false);
    
    const savedKey = localStorage.getItem("first_step_gemini_key") || "";
    if (!savedKey) {
      setImportError("Gemini API Key is missing. Please enter your API Key under the ATS Audit settings first.");
      setIsImporting(false);
      return;
    }

    try {
      const parsed = await parseResumeWithGemini(importText, savedKey);
      const newResumeData: ResumeData = {
        personal: {
          name: parsed.personal?.name || "",
          title: parsed.personal?.title || "",
          email: parsed.personal?.email || "",
          phone: parsed.personal?.phone || "",
          location: parsed.personal?.location || "",
          github: parsed.personal?.github || "",
          linkedin: parsed.personal?.linkedin || "",
          website: parsed.personal?.website || "",
          summary: parsed.personal?.summary || ""
        },
        education: (parsed.education || []).map((edu, idx) => ({
          id: `edu-${Date.now()}-${idx}`,
          school: edu.school || "",
          degree: edu.degree || "",
          fieldOfStudy: edu.fieldOfStudy || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          gpa: edu.gpa || "",
          location: edu.location || "",
          description: edu.description || ""
        })),
        experience: (parsed.experience || []).map((exp, idx) => ({
          id: `exp-${Date.now()}-${idx}`,
          company: exp.company || "",
          role: exp.role || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: exp.current || false,
          points: Array.isArray(exp.points) ? exp.points : []
        })),
        projects: (parsed.projects || []).map((proj, idx) => ({
          id: `proj-${Date.now()}-${idx}`,
          title: proj.title || "",
          technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
          liveLink: proj.liveLink || "",
          githubLink: proj.githubLink || "",
          description: proj.description || "",
          selected: true
        })),
        skills: (parsed.skills || []).map((skill, idx) => ({
          id: `skill-${Date.now()}-${idx}`,
          name: skill.name || "",
          category: skill.category || "languages",
          selected: true
        })),
        certificates: (parsed.certificates || []).map((cert, idx) => ({
          id: `cert-${Date.now()}-${idx}`,
          title: cert.title || "",
          issuer: cert.issuer || "",
          date: cert.date || "",
          link: cert.link || ""
        })),
        publications: [],
        customSections: [],
        sectionOrder: ["personal", "experience", "projects", "skills", "education", "certificates", "publications"]
      };

      handleDataChange(newResumeData);
      setImportSuccess(true);
      setImportText("");
      setTimeout(() => {
        setSidebarTab("edit");
        setFormTab("personal");
        setOpenSection("details");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || "Failed to extract and import details.");
    } finally {
      setIsImporting(false);
    }
  };

  // File drop zone handlers for Import Resume tab
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragover(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (evt) => { setImportText((evt.target?.result as string) || ""); };
    reader.onerror = () => { setImportError("Could not read file. Try a .txt file or paste the resume text directly."); };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (evt) => { setImportText((evt.target?.result as string) || ""); };
    reader.onerror = () => { setImportError("Could not read file. Try a .txt file or paste the resume text directly."); };
    reader.readAsText(file);
  };

  // AI Tailor content trigger
  const handleAiTailor = async () => {
    if (!jobTitleInput.trim() || !jobDescInput.trim()) return;
    setIsTailoring(true);
    setTailorError("");
    setTailorSuccess(false);

    const savedKey = localStorage.getItem("first_step_gemini_key") || "";
    if (!savedKey) {
      setTailorError("Gemini API Key is missing. Please enter your API Key in the ATS Audit panel first.");
      setIsTailoring(false);
      return;
    }

    try {
      const tailored = await tailorResumeWithGemini(resumeData, jobTitleInput, jobDescInput, savedKey);
      const newResumeData = {
        ...resumeData,
        personal: {
          ...resumeData.personal,
          summary: tailored.tailoredSummary || resumeData.personal.summary
        },
        experience: resumeData.experience.map(exp => {
          const matchingTailored = tailored.tailoredExperiences?.find(te => te.id === exp.id);
          return matchingTailored 
            ? { ...exp, points: matchingTailored.points }
            : exp;
        })
      };

      handleDataChange(newResumeData);
      setTailorSuccess(true);
      setTimeout(() => {
        setSidebarTab("edit");
        setFormTab("personal");
        setOpenSection("details");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setTailorError(err.message || "AI tailoring request failed.");
    } finally {
      setIsTailoring(false);
    }
  };

  // AI Bullet Enhancer Trigger
  const handleEnhanceBullet = async () => {
    if (!weakBullet.trim()) return;
    setIsEnhancing(true);
    setEnhanceError("");
    setEnhancedBullet("");

    const savedKey = localStorage.getItem("first_step_gemini_key") || "";
    if (!savedKey) {
      setEnhanceError("Gemini API Key is missing. Please enter your API Key in the ATS Audit panel first.");
      setIsEnhancing(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(savedKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an expert executive resume writer. Enhance the following weak work experience bullet point into a high-impact, professional sentence. Use action verbs and include metrics/numbers where appropriate to demonstrate results.
        
        Weak Bullet: "${weakBullet}"
        
        Provide ONLY the enhanced sentence string as your output. Do not include quotes or conversational text.
      `;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setEnhancedBullet(text.trim());
    } catch (err: any) {
      setEnhanceError(err.message || "Failed to enhance bullet point.");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Import Custom template styling trigger
  const handleAddCustomTemplate = () => {
    if (!customTplName.trim()) return;
    const newPreset: TemplatePreset = {
      id: `custom-tpl-${Date.now()}`,
      name: customTplName,
      layout: customTplLayout,
      font: customTplFont,
      color: customTplColor,
      spacing: customTplSpacing,
      headerStyle: customTplHeader
    };
    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    localStorage.setItem("first_step_custom_presets", JSON.stringify(updatedPresets));
    setCustomTplSuccess(true);
    setCustomTplName("");
    setTimeout(() => {
      setCustomTplSuccess(false);
      setSidebarTab("customize-doc");
      setConfigSubTab("template");
      setOpenSection("templates");
    }, 1500);
  };

  // Render standalone preview helper
  const generateResumeHtmlHelper = (
    docName: string,
    preset: TemplatePreset,
    data: ResumeData,
    fontSizeOverride?: number,
    sectionSpacingOverride?: number,
    marginSpacingOverride?: number
  ): string => {
    const selectedFont = fontFamilies[preset.font] || fontFamilies.inter;
    const accentColor = preset.color;
    
    // Spacings
    const paddingVal = marginSpacingOverride ? `${marginSpacingOverride}px` : "35px";
    const fontSizeVal = fontSizeOverride ? `${fontSizeOverride}pt` : "10.5pt";
    const gapVal = sectionSpacingOverride ? `${sectionSpacingOverride}px` : "24px";

    const personal = data.personal;
    const displayExperience = data.experience;
    const displayProjects = data.projects.filter(p => p.selected);
    const displaySkills = data.skills.filter(s => s.selected);
    const displayEducation = data.education;
    const displayCerts = data.certificates.filter(c => c.category === "Certificates" || !c.category);
    const displayAchievements = data.certificates.filter(c => c.category === "Awards");
    const displayPublications = data.publications || [];

    // Header class styles mapping
    let headerBorderCss = "";
    if (preset.headerStyle === "underline") {
      headerBorderCss = `border-bottom: 2px solid ${accentColor}; padding-bottom: 4px;`;
    } else if (preset.headerStyle === "border") {
      headerBorderCss = `border-left: 3px solid ${accentColor}; padding-left: 8px;`;
    } else if (preset.headerStyle === "block") {
      headerBorderCss = `background-color: #f4f4f5; border-left: 3.5px solid ${accentColor}; padding: 6px 12px; border-radius: 4px;`;
    }

    const expHtml = displayExperience.map(exp => `
      <div class="item">
        <div class="item-header">
          <div>
            <strong>${exp.role}</strong> | <span>${exp.company}</span>
          </div>
          <div class="meta">${exp.startDate} - ${exp.current ? "Present" : exp.endDate} (${exp.location})</div>
        </div>
        <ul class="bullets">
          ${exp.points.map(pt => `<li>${pt}</li>`).join("")}
        </ul>
      </div>
    `).join("");

    const projHtml = displayProjects.map(proj => `
      <div class="item">
        <div class="item-header">
          <div>
            <strong>${proj.title}</strong> <span class="tech">(${proj.technologies.join(", ")})</span>
          </div>
          <div class="meta">
            ${proj.githubLink ? `<a href="${proj.githubLink}" target="_blank">GitHub</a>` : ""}
            ${proj.liveLink ? `<a href="${proj.liveLink}" target="_blank">Live Demo</a>` : ""}
          </div>
        </div>
        <p class="desc">${proj.description}</p>
      </div>
    `).join("");

    const eduHtml = displayEducation.map(edu => `
      <div class="item">
        <div class="item-header">
          <div>
            <strong>${edu.degree} in ${edu.fieldOfStudy}</strong> | <span>${edu.school}</span>
          </div>
          <div class="meta">${edu.startDate} - ${edu.endDate} (${edu.location})</div>
        </div>
        ${edu.gpa ? `<div class="meta">GPA: ${edu.gpa}</div>` : ""}
        ${edu.description ? `<p class="desc">${edu.description}</p>` : ""}
      </div>
    `).join("");

    const categories = Array.from(new Set(displaySkills.map(s => s.category)));
    const skillsHtml = categories.map(cat => {
      const catSkills = displaySkills.filter(s => s.category === cat).map(s => s.name);
      return `
        <div class="skill-row">
          <strong>${cat.toUpperCase()}:</strong> <span>${catSkills.join(", ")}</span>
        </div>
      `;
    }).join("");

    const certsHtml = displayCerts.map(cert => `
      <div class="grid-item">
        <strong>${cert.title}</strong> - <span>${cert.issuer}</span> (${cert.date})
        ${cert.link ? `<br/><a href="${cert.link}" target="_blank" style="font-size: 0.75rem; color: ${accentColor}; text-decoration: none;">Verify Credentials</a>` : ""}
      </div>
    `).join("");

    const achHtml = displayAchievements.map(ach => `
      <div class="grid-item">
        <strong>${ach.title}</strong> - <span>${ach.issuer}</span> (${ach.date})
      </div>
    `).join("");

    const pubHtml = displayPublications.map(pub => `
      <div class="item">
        <div class="item-header">
          <div>
            <strong>${pub.title}</strong> | <span>${pub.publisher}</span>
          </div>
          <div class="meta">
            <span>${pub.date}</span>
            ${pub.link ? `<br/><a href="${pub.link}" target="_blank" style="font-size: 0.75rem; color: ${accentColor}; text-decoration: none;">Paper Link</a>` : ""}
          </div>
        </div>
        ${pub.description ? `<p class="desc">${pub.description}</p>` : ""}
      </div>
    `).join("");

    // Map layouts
    let renderedBody = "";
    if (preset.layout === "corporate") {
      renderedBody = `
        <div class="corp-split" style="display: grid; grid-template-columns: 1.6fr 1fr; gap: ${gapVal}; margin-top: ${gapVal};">
          <div style="display: flex; flex-direction: column; gap: ${gapVal}; border-right: 1px solid #f4f4f5; padding-right: 20px;">
            ${personal.summary ? `
              <div class="section">
                <h3 class="section-title">Executive Summary</h3>
                <p class="desc">${personal.summary}</p>
              </div>
            ` : ""}
            ${displayExperience.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Work Experience</h3>
                <div class="list">${expHtml}</div>
              </div>
            ` : ""}
            ${displayProjects.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Key Projects</h3>
                <div class="list">${projHtml}</div>
              </div>
            ` : ""}
            ${displayPublications.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Publications</h3>
                <div class="list">${pubHtml}</div>
              </div>
            ` : ""}
          </div>
          <div style="display: flex; flex-direction: column; gap: ${gapVal}; padding-left: 10px;">
            ${displaySkills.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Expertise Skills</h3>
                <div class="skills-wrap">${skillsHtml}</div>
              </div>
            ` : ""}
            ${displayEducation.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Education</h3>
                <div class="list">${eduHtml}</div>
              </div>
            ` : ""}
            ${displayCerts.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Certificates</h3>
                <div class="grid-layout" style="display: flex; flex-direction: column; gap: 8px;">${certsHtml}</div>
              </div>
            ` : ""}
            ${displayAchievements.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Achievements</h3>
                <div class="grid-layout" style="display: flex; flex-direction: column; gap: 8px;">${achHtml}</div>
              </div>
            ` : ""}
          </div>
        </div>
      `;
    } else if (preset.layout === "creative") {
      renderedBody = `
        <div class="creative-split" style="display: grid; grid-template-columns: 1fr 2.1fr; gap: ${gapVal}; margin-top: ${gapVal};">
          <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: ${gapVal}; border: 1px solid #f4f4f5;">
            ${displaySkills.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Skills</h3>
                <div class="skills-wrap">${skillsHtml}</div>
              </div>
            ` : ""}
            ${displayEducation.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Education</h3>
                <div class="list">${eduHtml}</div>
              </div>
            ` : ""}
            ${displayCerts.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Credentials</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">${certsHtml}</div>
              </div>
            ` : ""}
          </div>
          <div style="display: flex; flex-direction: column; gap: ${gapVal};">
            ${personal.summary ? `
              <div class="section">
                <h3 class="section-title">Profile Summary</h3>
                <p class="desc">${personal.summary}</p>
              </div>
            ` : ""}
            ${displayExperience.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Professional Journey</h3>
                <div class="list">${expHtml}</div>
              </div>
            ` : ""}
            ${displayProjects.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Core Projects</h3>
                <div class="list">${projHtml}</div>
              </div>
            ` : ""}
            ${displayPublications.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Research Papers</h3>
                <div class="list">${pubHtml}</div>
              </div>
            ` : ""}
            ${displayAchievements.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Honors & Awards</h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">${achHtml}</div>
              </div>
            ` : ""}
          </div>
        </div>
      `;
    } else {
      renderedBody = `
        <div style="display: flex; flex-direction: column; gap: ${gapVal}; margin-top: ${gapVal};">
          ${personal.summary ? `
            <div class="section">
              <h3 class="section-title">Professional Summary</h3>
              <p class="desc">${personal.summary}</p>
            </div>
          ` : ""}
          ${displayExperience.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Work Experience</h3>
              <div class="list">${expHtml}</div>
            </div>
          ` : ""}
          ${displayProjects.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Projects</h3>
              <div class="list">${projHtml}</div>
            </div>
          ` : ""}
          ${displayEducation.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Education</h3>
              <div class="list">${eduHtml}</div>
            </div>
          ` : ""}
          ${displaySkills.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Skills</h3>
              <div class="skills-wrap">${skillsHtml}</div>
            </div>
          ` : ""}
          ${displayCerts.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Certificates</h3>
              <div class="grid-layout">${certsHtml}</div>
            </div>
          ` : ""}
          ${displayAchievements.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Achievements</h3>
              <div class="grid-layout">${achHtml}</div>
          </div>
          ` : ""}
          ${displayPublications.length > 0 ? `
            <div class="section">
              <h3 class="section-title">Publications</h3>
              <div class="list">${pubHtml}</div>
            </div>
          ` : ""}
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Document Viewer - ${docName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Lora:ital,wght@0,400;0,700;1,400&family=Outfit:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;700;900&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --accent: ${accentColor};
            --font-family-resume: ${selectedFont};
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: var(--font-family-resume);
            background-color: #f4f4f5;
            color: #222222;
            line-height: 1.5;
            padding: 40px 0;
          }
          .toolbar {
            width: 210mm;
            margin: 0 auto 20px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
            padding: 12px 24px;
            border-radius: 8px;
            border: 1px solid #e4e4e7;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          }
          .toolbar h1 { font-size: 1rem; color: #09090b; font-weight: 700; }
          .toolbar button {
            background-color: var(--accent);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .toolbar button:hover { opacity: 0.9; }
          
          .sheet {
            width: 210mm;
            min-height: 297mm;
            background: #ffffff;
            margin: 0 auto;
            padding: ${paddingVal};
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            border: 1px solid #e4e4e7;
            border-radius: 4px;
            font-size: ${fontSizeVal};
            display: flex;
            flex-direction: column;
            gap: ${gapVal};
          }
          
          .header-banner { border-bottom: 2px solid ${accentColor}; padding-bottom: 16px; }
          .header-name { font-size: 2.2rem; font-weight: 800; color: #111; margin-bottom: 4px; }
          .header-title { font-size: 1.1rem; font-weight: 600; color: var(--accent); margin-bottom: 12px; }
          .contacts { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 0.8rem; color: #555; }
          .contacts span { display: inline-flex; align-items: center; gap: 4px; }
          .section-title { font-size: 1.05rem; font-weight: 800; text-transform: uppercase; color: #111; ${headerBorderCss} }
          .item-header { display: flex; justify-content: space-between; font-size: 0.9rem; }
          .meta { color: #6b7280; font-size: 0.82rem; }
          .bullets { margin-left: 18px; font-size: 0.88rem; color: #374151; line-height: 1.4; }
          .desc { font-size: 0.88rem; color: #374151; line-height: 1.4; }
          .tech { color: var(--accent); font-weight: 600; font-size: 0.85rem; }
          .skills-wrap { display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem; }
          .skill-row strong { color: #111; }
          .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; }
          .grid-item { padding: 8px; border: 1px solid #f3f4f6; border-radius: 4px; background: #fafafa; }

          @media print {
            body { padding: 0; background: none; }
            .toolbar { display: none; }
            .sheet { box-shadow: none; width: 100%; height: 100%; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <h1>Document Viewer - ${docName}</h1>
          <button onclick="window.print()">Print Document</button>
        </div>
        <div class="sheet">
          <div class="header-banner">
            <h1 class="header-name">${personal.name || "Sample Candidate"}</h1>
            <h2 class="header-title">${personal.title || "Professional Title"}</h2>
            <div class="contacts">
              ${personal.email ? `<span>Email: ${personal.email}</span>` : ""}
              ${personal.phone ? `<span>Phone: ${personal.phone}</span>` : ""}
              ${personal.location ? `<span>Location: ${personal.location}</span>` : ""}
              ${personal.website ? `<span>Website: ${personal.website}</span>` : ""}
              ${personal.github ? `<span>GitHub: ${personal.github}</span>` : ""}
              ${personal.linkedin ? `<span>LinkedIn: ${personal.linkedin}</span>` : ""}
            </div>
          </div>
          ${renderedBody}
        </div>
      </body>
      </html>
    `;
  };

  const handleViewResumeInNewTab = (res: SavedResume) => {
    const html = generateResumeHtmlHelper(
      res.name,
      templatesList.find(p => p.id === res.presetId) || templatesList[0],
      res.data,
      res.fontSize,
      res.sectionSpacing,
      res.marginSpacing
    );
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  const handlePreviewTemplateSample = (preset: TemplatePreset) => {
    // Always use fictional dummy data for template previews — never user data
    const html = generateResumeHtmlHelper(
      `Sample Layout — ${preset.name}`,
      preset,
      samplePreviewData,
      10.5,
      24,
      35
    );
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-side-navbar no-print">
        <div className="side-navbar-content">
          {/* SECTION 1: HOME/DASHBOARD BUTTON */}
          <div className="nav-group">
            <button 
              className={`nav-item-btn ${sidebarTab === "home" ? "active" : ""}`}
              onClick={() => {
                setSidebarTab("home");
                setOpenSection(null);
              }}
              type="button"
            >
              <Home size={14} className="nav-item-icon" />
              <span>Dashboard Home</span>
            </button>
          </div>

          {/* SECTION 2: DETAILS DROPDOWN */}
          <div className="nav-group">
            <button 
              className="nav-group-toggle"
              onClick={() => toggleSection("details")}
              type="button"
            >
              <span>Details</span>
              {openSection === "details" ? <ChevronUp size={14} className="nav-group-toggle-icon" /> : <ChevronDown size={14} className="nav-group-toggle-icon" />}
            </button>
            {openSection === "details" && (
              <ul className="nav-list nav-sub-list">
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "personal" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("personal")}
                    type="button"
                  >
                    <User size={14} className="nav-item-icon" />
                    <span>Personal Info</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "experience" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("experience")}
                    type="button"
                  >
                    <Briefcase size={14} className="nav-item-icon" />
                    <span>Work History</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "projects" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("projects")}
                    type="button"
                  >
                    <Code size={14} className="nav-item-icon" />
                    <span>Technical Projects</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "skills" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("skills")}
                    type="button"
                  >
                    <Wrench size={14} className="nav-item-icon" />
                    <span>Skills Inventory</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "education" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("education")}
                    type="button"
                  >
                    <GraduationCap size={14} className="nav-item-icon" />
                    <span>Education</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "certs" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("certs")}
                    type="button"
                  >
                    <Award size={14} className="nav-item-icon" />
                    <span>Certificates</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "achievements" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("achievements")}
                    type="button"
                  >
                    <Award size={14} className="nav-item-icon" />
                    <span>Achievements</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "publications" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("publications")}
                    type="button"
                  >
                    <FileText size={14} className="nav-item-icon" />
                    <span>Publications</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "edit" && formTab === "custom-sections" ? "active" : ""}`}
                    onClick={() => navigateToFormTab("custom-sections")}
                    type="button"
                  >
                    <Layers size={14} className="nav-item-icon" />
                    <span>Custom Sections</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "import-resume" ? "active" : ""}`}
                    onClick={() => {
                      setSidebarTab("import-resume");
                      setOpenSection("details");
                    }}
                    type="button"
                    style={{ borderTop: "1px dashed var(--border)", borderRadius: "0", marginTop: "4px", paddingTop: "8px" }}
                  >
                    <Upload size={14} className="nav-item-icon" style={{ color: "var(--accent)" }} />
                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>Import Resume</span>
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* SECTION 3: CREATE DOCUMENTATION DROPDOWN */}
          <div className="nav-group">
            <button 
              className="nav-group-toggle"
              onClick={() => toggleSection("docs")}
              type="button"
            >
              <span>Create Documentation</span>
              {openSection === "docs" ? <ChevronUp size={14} className="nav-group-toggle-icon" /> : <ChevronDown size={14} className="nav-group-toggle-icon" />}
            </button>
            {openSection === "docs" && (
              <ul className="nav-list nav-sub-list">
                <li>
                  <button
                    className={`nav-item-btn ${sidebarTab === "customize-doc" && docType === "resume" ? "active" : ""}`}
                    onClick={() => {
                      handleDocTypeChange("resume");
                      setSidebarTab("customize-doc");
                      setConfigSubTab("template");
                    }}
                    type="button"
                  >
                    <Layout size={14} className="nav-item-icon" />
                    <span>Resume (1-Page)</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-item-btn ${sidebarTab === "customize-doc" && docType === "cv" ? "active" : ""}`}
                    onClick={() => {
                      handleDocTypeChange("cv");
                      setSidebarTab("customize-doc");
                      setConfigSubTab("template");
                    }}
                    type="button"
                  >
                    <Layers size={14} className="nav-item-icon" />
                    <span>CV (Multi-Page)</span>
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* SECTION 4: OPTIMIZE AI DROPDOWN */}
          <div className="nav-group">
            <button 
              className="nav-group-toggle"
              onClick={() => toggleSection("optimize")}
              type="button"
            >
              <span>Optimize</span>
              {openSection === "optimize" ? <ChevronUp size={14} className="nav-group-toggle-icon" /> : <ChevronDown size={14} className="nav-group-toggle-icon" />}
            </button>
            {openSection === "optimize" && (
              <ul className="nav-list nav-sub-list">
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "ats" ? "active" : ""}`}
                    onClick={() => {
                      setSidebarTab("ats");
                      setOpenSection("optimize");
                    }}
                    type="button"
                  >
                    <Cpu size={14} className="nav-item-icon" />
                    <span>Test ATS Compatibility</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "tailor" ? "active" : ""}`}
                    onClick={() => {
                      setSidebarTab("tailor");
                      setOpenSection("optimize");
                    }}
                    type="button"
                  >
                    <Sparkles size={14} className="nav-item-icon" />
                    <span>Tailor for Job Role</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "bullet-enhancer" ? "active" : ""}`}
                    onClick={() => {
                      setSidebarTab("bullet-enhancer");
                      setOpenSection("optimize");
                    }}
                    type="button"
                  >
                    <FileEdit size={14} className="nav-item-icon" />
                    <span>AI Bullet Enhancer</span>
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* SECTION 5: TEMPLATES LIBRARY DROPDOWN */}
          <div className="nav-group">
            <button 
              className="nav-group-toggle"
              onClick={() => toggleSection("templates")}
              type="button"
            >
              <span>Templates</span>
              {openSection === "templates" ? <ChevronUp size={14} className="nav-group-toggle-icon" /> : <ChevronDown size={14} className="nav-group-toggle-icon" />}
            </button>
            {openSection === "templates" && (
              <ul className="nav-list nav-sub-list">
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "customize-doc" && configSubTab === "template" ? "active" : ""}`}
                    onClick={() => {
                      setSidebarTab("customize-doc");
                      setConfigSubTab("template");
                      setOpenSection("templates");
                    }}
                    type="button"
                  >
                    <Layout size={14} className="nav-item-icon" />
                    <span>Browse templates</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-item-btn ${sidebarTab === "import-template" ? "active" : ""}`}
                    onClick={() => {
                      setSidebarTab("import-template");
                      setOpenSection("templates");
                    }}
                    type="button"
                  >
                    <Plus size={14} className="nav-item-icon" />
                    <span>Add template</span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

      </aside>

      {/* Editor Panel (Middle column in desktop) */}
      <div className="dashboard-sidebar no-print">
        <div className="sidebar-workspace">
          
          {/* TAB 1: WORKSPACE HOME DASHBOARD */}
          {sidebarTab === "home" && (() => {
            // Compute checklist
            const hasContacts = !!(resumeData.personal.name && resumeData.personal.email);
            const hasSummary = !!(resumeData.personal.summary && resumeData.personal.summary.length > 25);
            const hasExperience = resumeData.experience.length > 0 && !!resumeData.experience[0].role;
            const hasProjects = resumeData.projects.length > 0 && !!resumeData.projects[0].title;
            const hasSkills = resumeData.skills.length > 0;
            const hasEducation = resumeData.education.length > 0 && !!resumeData.education[0].school;

            const checklistItems = [
              { label: "Contact Details", completed: hasContacts },
              { label: "Professional Summary", completed: hasSummary },
              { label: "Work History", completed: hasExperience },
              { label: "Projects Portfolio", completed: hasProjects },
              { label: "Key Skills", completed: hasSkills },
              { label: "Education History", completed: hasEducation },
            ];
            const completedCount = checklistItems.filter(item => item.completed).length;
            const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

            return (
              <div className="dashboard-home-view" style={{ animation: "fade-in-section 0.25s ease-out" }}>
                <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #111 0%, #333 100%)", color: "white", padding: "24px", borderRadius: "var(--radius)", marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "4px" }}>Welcome back, {currentUser.name}!</h3>
                  <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>Manage your resumes, check optimization scores, and tailor custom layout templates client-side.</p>
                </div>

                {/* Statistics Row */}
                <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                  <div className="stat-card" style={{ border: "1px solid var(--border)", background: "white", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                    <h6 style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "6px" }}>Created Documents</h6>
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--foreground)" }}>{resumesList.length}</span>
                  </div>
                  <div className="stat-card" style={{ border: "1px solid var(--border)", background: "white", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                    <h6 style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "6px" }}>Active Template</h6>
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--accent)", display: "block", marginTop: "8px" }}>{selectedPreset.name}</span>
                  </div>
                  <div className="stat-card" style={{ border: "1px solid var(--border)", background: "white", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                    <h6 style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "6px" }}>Library Presets</h6>
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--foreground)" }}>{allPresets.length}</span>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="quick-actions-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                  <button 
                    onClick={() => {
                      setIsCreateModalOpen(true);
                      setCreateModalType("standard");
                    }} 
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "20px", background: "white", border: "1px solid var(--border)", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s ease" }}
                    className="quick-action-btn"
                    type="button"
                  >
                    <Plus size={20} style={{ color: "var(--accent)" }} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground)" }}>New Resume/CV</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsCreateModalOpen(true);
                      setCreateModalType("ai");
                    }} 
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "20px", background: "white", border: "1px solid var(--border)", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s ease" }}
                    className="quick-action-btn"
                    type="button"
                  >
                    <Sparkles size={20} style={{ color: "#a21caf" }} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground)" }}>AI Tailored Resume</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSidebarTab("import-resume");
                      setOpenSection("details");
                    }} 
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "20px", background: "white", border: "1px solid var(--border)", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s ease" }}
                    className="quick-action-btn"
                    type="button"
                  >
                    <Upload size={20} style={{ color: "#10b981" }} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground)" }}>Import Text</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSidebarTab("ats");
                      setOpenSection("optimize");
                    }} 
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "20px", background: "white", border: "1px solid var(--border)", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s ease" }}
                    className="quick-action-btn"
                    type="button"
                  >
                    <Cpu size={20} style={{ color: "#3b82f6" }} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground)" }}>ATS Match Score</span>
                  </button>
                </div>

                {/* Split 2-Column Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px" }}>
                  
                  {/* Saved Documents */}
                  <div className="home-block">
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>Your Saved Documents</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {resumesList.map((res) => {
                        const isEditingThis = res.id === currentResumeId;
                        return (
                          <div 
                            key={res.id} 
                            onClick={() => handleSelectResume(res.id)}
                            className={`saved-resume-card ${isEditingThis ? "active" : ""}`}
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "space-between", 
                              padding: "16px", 
                              background: isEditingThis ? "var(--accent-light)" : "white", 
                              border: isEditingThis ? "1px solid var(--accent)" : "1px solid var(--border)", 
                              borderRadius: "12px",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {renameId === res.id ? (
                                <div style={{ display: "flex", gap: "6px", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                                  <input 
                                    type="text" 
                                    className="form-input" 
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    style={{ height: "30px", fontSize: "0.85rem", padding: "4px 8px" }}
                                  />
                                  <button className="btn btn-primary" onClick={() => handleRenameResumeSubmit(res.id)} style={{ height: "30px", padding: "0 10px", fontSize: "0.75rem" }}>Save</button>
                                  <button className="btn btn-secondary" onClick={() => setRenameId(null)} style={{ height: "30px", padding: "0 10px", fontSize: "0.75rem" }}>Cancel</button>
                                </div>
                              ) : (
                                <div>
                                  <h5 style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--foreground)", margin: 0, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                    {res.name}
                                  </h5>
                                  <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                                    {res.docType.toUpperCase()} • {new Date(res.lastModified).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                </div>
                              )}
                            </div>

                            {renameId !== res.id && (
                              <div style={{ display: "flex", gap: "6px" }} className="no-print" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={() => handleViewResumeInNewTab(res)}
                                  style={{ height: "30px", padding: "0 10px", fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.08)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)" }}
                                >
                                  View
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={() => {
                                    setRenameId(res.id);
                                    setRenameValue(res.name);
                                  }}
                                  style={{ height: "30px", width: "30px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                                  title="Rename Document"
                                >
                                  <FileEdit size={12} />
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={() => handleDuplicateResume(res.id)}
                                  style={{ height: "30px", width: "30px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                                  title="Duplicate Document"
                                >
                                  <Copy size={12} />
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => handleDeleteResume(res.id)}
                                  style={{ height: "30px", width: "30px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                                  title="Delete Document"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scoreboard Checklist Column */}
                  <div className="home-block">
                    <div className="analytics-card" style={{ border: "1px solid var(--border)", background: "white", borderRadius: "12px", padding: "20px" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Check size={16} style={{ color: "var(--accent)" }} /> Profile Scoreboard
                      </h4>
                      
                      {/* Progress Bar */}
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "6px" }}>
                          <span>Completion Score</span>
                          <span style={{ color: progressPercent === 100 ? "#10b981" : "var(--accent)" }}>{completedCount}/{checklistItems.length} · {progressPercent}%</span>
                        </div>
                        <div style={{ height: "6px", background: "var(--secondary)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--accent)", borderRadius: "3px", transition: "width 0.3s ease" }}></div>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {checklistItems.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem" }}>
                            {item.completed ? (
                              <Check size={14} style={{ color: "#10b981", flexShrink: 0 }} />
                            ) : (
                              <span style={{ color: "#f59e0b", fontSize: "1.1rem", lineHeight: 1, flexShrink: 0, display: "flex", alignItems: "center" }}>●</span>
                            )}
                            <span style={{ color: item.completed ? "var(--foreground)" : "var(--muted-foreground)" }}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* ATS Match Preview box */}
                      <div style={{ borderTop: "1px dashed var(--border)", marginTop: "20px", paddingTop: "20px" }}>
                        <h5 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Cpu size={14} style={{ color: "#3b82f6" }} /> ATS Audit Score
                        </h5>
                        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", lineHeight: 1.4, marginBottom: "12px" }}>
                          Analyze your resume compatibility against dynamic job descriptions using Gemini LLM scanning.
                        </p>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => {
                            setSidebarTab("ats");
                            setOpenSection("optimize");
                          }}
                          style={{ width: "100%", height: "32px", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                          type="button"
                        >
                          Run Audit Check
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* TAB 2: RESUME FORM FIELDS */}
          {sidebarTab === "edit" && (
            <ResumeForm data={resumeData} onChange={handleDataChange} activeTab={formTab} />
          )}

          {/* TAB 3: ATS COMPATIBILITY CHECK */}
          {sidebarTab === "ats" && (
            <AtsAnalyzer data={resumeData} onChange={handleDataChange} />
          )}

          {/* TAB 4: TAILOR RESUME BY JOB ROLE */}
          {sidebarTab === "tailor" && (
            <div className="tailor-role-workspace" style={{ animation: "fade-in-section 0.25s ease-out" }}>
              <h3 className="section-form-title">Tailor Content for Job Role</h3>
              <p className="form-tab-instruction">
                Enter your target Job Title and Description. Gemini AI will automatically rewrite your professional summary and experience points to optimize keyword relevance.
              </p>

              <div className="form-group">
                <label className="form-label">Target Job Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea 
                  className="form-input" 
                  rows={8} 
                  placeholder="Paste the full job posting details here..."
                  value={jobDescInput}
                  onChange={(e) => setJobDescInput(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              {tailorError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>
                  {tailorError}
                </div>
              )}

              {tailorSuccess && (
                <div style={{ color: "#10b981", fontSize: "0.85rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>
                  Resume tailored successfully! Returning to personal info forms...
                </div>
              )}

              <button 
                className="btn btn-primary" 
                onClick={handleAiTailor} 
                disabled={isTailoring || !jobTitleInput.trim() || !jobDescInput.trim()}
                style={{ width: "100%", height: "42px" }}
              >
                {isTailoring ? "Generating Tailored Resume..." : "Tailor Resume Content"}
              </button>
            </div>
          )}

          {/* TAB 5: AI BULLET ENHANCER */}
          {sidebarTab === "bullet-enhancer" && (
            <div className="bullet-enhancer-workspace" style={{ animation: "fade-in-section 0.25s ease-out" }}>
              <h3 className="section-form-title">AI Experience Bullet Enhancer</h3>
              <p className="form-tab-instruction">
                Paste a generic description of a task you did, and let Gemini AI enhance it into a high-impact, results-driven professional sentence with active verbs.
              </p>

              <div className="form-group">
                <label className="form-label">Weak Bullet Point</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  placeholder="e.g. I worked on a website and speeded it up"
                  value={weakBullet}
                  onChange={(e) => setWeakBullet(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              <button 
                className="btn btn-secondary" 
                onClick={handleEnhanceBullet} 
                disabled={isEnhancing || !weakBullet.trim()}
                style={{ width: "100%", height: "38px", marginBottom: "20px" }}
              >
                {isEnhancing ? "Enhancing sentence..." : "Enhance Bullet Point"}
              </button>

              {enhanceError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.05)", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>
                  {enhanceError}
                </div>
              )}

              {enhancedBullet && (
                <div className="enhanced-output-card" style={{ border: "1.5px solid var(--accent)", borderRadius: "var(--radius)", padding: "16px", background: "var(--accent-light)" }}>
                  <h5 style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.9rem", marginBottom: "8px" }}>AI Enhanced Bullet:</h5>
                  <p style={{ fontSize: "0.85rem", color: "#333", lineHeight: 1.4, userSelect: "all", marginBottom: "12px" }}>{enhancedBullet}</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(enhancedBullet);
                      alert("Copied to clipboard!");
                    }}
                    style={{ height: "30px", fontSize: "0.75rem", padding: "0 12px" }}
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DOCUMENT SETTINGS (TEMPLATE / ARRANGE / EXPORT) */}
          {sidebarTab === "customize-doc" && (
            <div className="customize-doc-workspace">
              <h3 className="section-form-title">
                Configure {docType === "resume" ? "Resume" : "CV"}
              </h3>
              <p className="form-tab-instruction">
                Select your styling template, arrange section order, and export your documentation.
              </p>

              {/* Horizontal Sub-Tabs Switcher */}
              <div className="doc-sub-tabs">
                <button
                  className={`doc-sub-tab-btn ${configSubTab === "template" ? "active" : ""}`}
                  onClick={() => setConfigSubTab("template")}
                  type="button"
                >
                  <Layout size={14} />
                  <span>Template</span>
                </button>
                <button
                  className={`doc-sub-tab-btn ${configSubTab === "arrange" ? "active" : ""}`}
                  onClick={() => setConfigSubTab("arrange")}
                  type="button"
                >
                  <Layers size={14} />
                  <span>Arrange</span>
                </button>
                <button
                  className={`doc-sub-tab-btn ${configSubTab === "export" ? "active" : ""}`}
                  onClick={() => setConfigSubTab("export")}
                  type="button"
                >
                  <Download size={14} />
                  <span>Export</span>
                </button>
              </div>

              {/* Sub-Tab Workspaces */}
              <div className="doc-sub-tab-content">
                {configSubTab === "template" && (
                  <div className="templates-search-workspace">
                    <div className="template-search-group">
                      <Search size={16} className="search-icon-field" />
                      <input 
                        type="text" 
                        className="form-input template-search-input" 
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="presets-list-scroll">
                      {filteredPresets.length === 0 ? (
                        <p className="presets-empty-state">No matching templates found.</p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="form-grid">
                          {filteredPresets.map((preset) => {
                            const isSelected = selectedPreset.id === preset.id;
                            const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
                            return (
                              <div 
                                key={preset.id} 
                                className={`preset-card-item ${isSelected ? "selected" : ""}`}
                                onClick={() => handlePresetSelect(preset)}
                                style={{ flexDirection: "column", gap: "10px", alignItems: "flex-start", padding: "12px" }}
                              >
                                {/* Miniature CSS Layout Visual instead of plain text names */}
                                <div className="preset-mini-layout-visual">
                                  {preset.layout === "minimalist" && (
                                    <div className="mini-layout-minimalist">
                                      <div className="mini-header" style={{ borderColor: preset.color }}>
                                        <div className="mini-bar-name" style={{ backgroundColor: "#333" }}></div>
                                        <div className="mini-bar-subtitle" style={{ backgroundColor: preset.color }}></div>
                                      </div>
                                      <div className="mini-body">
                                        <div className="mini-section-header" style={{ borderColor: preset.color }}></div>
                                        <div className="mini-bar-line long"></div>
                                        <div className="mini-bar-line medium"></div>
                                        <div className="mini-section-header" style={{ borderColor: preset.color }}></div>
                                        <div className="mini-bar-line long"></div>
                                      </div>
                                    </div>
                                  )}
                                  {preset.layout === "corporate" && (
                                    <div className="mini-layout-corporate">
                                      <div className="mini-header" style={{ backgroundColor: preset.color }}>
                                        <div className="mini-bar-name" style={{ backgroundColor: "#fff" }}></div>
                                      </div>
                                      <div className="mini-body-split">
                                        <div className="mini-col-left">
                                          <div className="mini-section-header" style={{ borderColor: preset.color }}></div>
                                          <div className="mini-bar-line"></div>
                                          <div className="mini-bar-line"></div>
                                        </div>
                                        <div className="mini-col-right" style={{ borderLeft: "1px solid #eee" }}>
                                          <div className="mini-section-header" style={{ borderColor: preset.color }}></div>
                                          <div className="mini-bar-line"></div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {preset.layout === "creative" && (
                                    <div className="mini-layout-creative">
                                      <div className="mini-left-sidebar" style={{ backgroundColor: "#222" }}>
                                        <div className="mini-avatar" style={{ backgroundColor: preset.color }}></div>
                                        <div className="mini-bar-line sidebar-line" style={{ backgroundColor: preset.color }}></div>
                                        <div className="mini-bar-line sidebar-line"></div>
                                      </div>
                                      <div className="mini-right-content">
                                        <div className="mini-section-header" style={{ borderColor: preset.color }}></div>
                                        <div className="mini-bar-line long"></div>
                                        <div className="mini-bar-line long"></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="preset-card-details" style={{ width: "100%" }}>
                                  <div className="preset-card-header" style={{ justifyContent: "space-between", width: "100%" }}>
                                    <h5 style={{ fontSize: "0.85rem", margin: 0 }}>{preset.name}</h5>
                                    {isSelected && <Check size={14} style={{ color: "var(--accent)" }} />}
                                  </div>
                                  <div className="preset-card-tags" style={{ marginTop: "4px" }}>
                                    <span className="preset-tag" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>{capitalize(preset.font)}</span>
                                    <span className="preset-tag" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>{capitalize(preset.spacing)}</span>
                                  </div>
                                  <button
                                    className="btn btn-secondary preview-tpl-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePreviewTemplateSample(preset);
                                    }}
                                    style={{ 
                                      width: "100%", 
                                      fontSize: "0.72rem", 
                                      padding: "6px 8px", 
                                      marginTop: "8px",
                                      background: "rgba(59, 130, 246, 0.08)",
                                      color: "#3b82f6",
                                      border: "1px solid rgba(59, 130, 246, 0.2)",
                                      borderRadius: "6px",
                                      fontWeight: 600,
                                      cursor: "pointer"
                                    }}
                                    type="button"
                                  >
                                    Preview Template
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {configSubTab === "arrange" && (
                  <div className="arrange-sections-workspace" style={{ animation: "fade-in-section 0.25s ease-out" }}>
                    <p className="form-tab-instruction" style={{ marginBottom: "16px" }}>
                      Reorder details segments by using the UP and DOWN buttons below. Your layout updates in real-time.
                    </p>
                    <SectionManager
                      order={resumeData.sectionOrder}
                      onChangeOrder={(newOrder) => handleDataChange({ ...resumeData, sectionOrder: newOrder })}
                    />
                  </div>
                )}

                {configSubTab === "export" && (
                  <div className="export-documentation-workspace" style={{ animation: "fade-in-section 0.25s ease-out", display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    {/* Advanced Sizes Control Settings */}
                    <div className="spacing-settings-box" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px", background: "white" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "12px" }}>Spacing & Sizing Controls</h4>
                      
                      <div className="form-group" style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                          <span className="form-label" style={{ textTransform: "none" }}>Base Font Size</span>
                          <span style={{ fontWeight: 600 }}>{fontSizeOverride}pt</span>
                        </div>
                        <input 
                          type="range" 
                          min={8} 
                          max={16} 
                          step={0.5}
                          value={fontSizeOverride}
                          onChange={(e) => handleSizeChange("fontSize", parseFloat(e.target.value))}
                          style={{ width: "100%", accentColor: "var(--accent)" }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                          <span className="form-label" style={{ textTransform: "none" }}>Section Gaps</span>
                          <span style={{ fontWeight: 600 }}>{sectionSpacingOverride}px</span>
                        </div>
                        <input 
                          type="range" 
                          min={10} 
                          max={40} 
                          step={1}
                          value={sectionSpacingOverride}
                          onChange={(e) => handleSizeChange("sectionSpacing", parseInt(e.target.value))}
                          style={{ width: "100%", accentColor: "var(--accent)" }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                          <span className="form-label" style={{ textTransform: "none" }}>Outer Margins</span>
                          <span style={{ fontWeight: 600 }}>{marginSpacingOverride}px</span>
                        </div>
                        <input 
                          type="range" 
                          min={15} 
                          max={60} 
                          step={1}
                          value={marginSpacingOverride}
                          onChange={(e) => handleSizeChange("marginSpacing", parseInt(e.target.value))}
                          style={{ width: "100%", accentColor: "var(--accent)" }}
                        />
                      </div>
                    </div>

                    <div className="export-action-cards" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                      {/* View in Browser card */}
                      <div className="export-card" style={{ border: "1px solid rgba(99,102,241,0.3)", borderRadius: "var(--radius)", padding: "16px", background: "rgba(99,102,241,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "4px" }}>View in Browser</h5>
                          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Opens your fully-rendered resume in a new tab with the active template styling applied.</p>
                        </div>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => {
                            const active = resumesList.find(r => r.id === currentResumeId);
                            if (active) handleViewResumeInNewTab(active);
                          }}
                          type="button"
                          style={{ padding: "10px 18px", fontSize: "0.85rem", whiteSpace: "nowrap", background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.3)" }}
                        >
                          <FileText size={14} />
                          View Resume
                        </button>
                      </div>

                      <div className="export-card" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "4px" }}>Print to PDF Document</h5>
                          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Generates a high-fidelity PDF optimized for recruitment platforms.</p>
                        </div>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => window.print()}
                          type="button"
                          style={{ padding: "10px 18px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                        >
                          <Printer size={14} />
                          Print PDF
                        </button>
                      </div>

                      <div className="export-card" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "4px" }}>Download PowerPoint Slide Deck</h5>
                          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Generates widescreen slides of your profile details for presentations.</p>
                        </div>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => {
                            import("../utils/pptxGenerator").then(m => m.generateResumePptx(resumeData));
                          }}
                          type="button"
                          style={{ padding: "10px 18px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                        >
                          <Download size={14} />
                          Get PPT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: AI IMPORT RESUME TEXT */}
          {sidebarTab === "import-resume" && (
            <div className="import-resume-workspace" style={{ animation: "fade-in-section 0.25s ease-out" }}>
              <h3 className="section-form-title">Import from Previous Resume</h3>
              <p className="form-tab-instruction">
                Drop your resume/CV file below, or paste the plain text. Gemini AI will extract all sections and auto-fill your profile forms.
              </p>

              {/* Drag-and-Drop File Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragover(true); }}
                onDragLeave={() => setIsDragover(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragover ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "12px",
                  background: isDragover ? "var(--accent-light)" : "var(--secondary)",
                  padding: "36px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginBottom: "16px"
                }}
              >
                <Upload size={32} style={{ color: isDragover ? "var(--accent)" : "var(--muted-foreground)", margin: "0 auto 12px", display: "block" }} />
                <p style={{ fontWeight: 700, fontSize: "0.92rem", color: isDragover ? "var(--accent)" : "var(--foreground)", marginBottom: "4px" }}>
                  {isDragover ? "Drop your file here!" : "Drag & Drop your Resume or CV"}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                  PDF or TXT files supported — or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </div>

              {/* OR Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 500 }}>or paste text below</span>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              </div>

              <div className="form-group">
                <textarea 
                  className="form-input" 
                  rows={6} 
                  placeholder="Paste your resume or CV plain text here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              {importError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div style={{ color: "#10b981", fontSize: "0.85rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>
                  ✓ Resume details imported! Redirecting to the details builder...
                </div>
              )}

              <button 
                className="btn btn-primary" 
                onClick={handleAiImport} 
                disabled={isImporting || !importText.trim()}
                style={{ width: "100%", height: "42px" }}
              >
                {isImporting ? "AI is Extracting Details..." : "AI Import Details"}
              </button>
            </div>
          )}

          {/* TAB 8: IMPORT / ADD CUSTOM TEMPLATE FROM OUTSIDE */}
          {sidebarTab === "import-template" && (
            <div className="import-template-workspace" style={{ animation: "fade-in-section 0.25s ease-out" }}>
              <h3 className="section-form-title">Add Custom Design Style</h3>
              <p className="form-tab-instruction">
                Create and add your own custom template style to the library by configuring layouts, custom typography fonts, margins, and header accents.
              </p>

              <div className="form-group">
                <label className="form-label">Template Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Jaswanth Tech Modern"
                  value={customTplName}
                  onChange={(e) => setCustomTplName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Base Layout Grid</label>
                <select 
                  className="form-input" 
                  value={customTplLayout}
                  onChange={(e: any) => setCustomTplLayout(e.target.value)}
                >
                  <option value="minimalist">Minimalist (Clean 1-Column)</option>
                  <option value="corporate">Corporate (Split-Column Top Banner)</option>
                  <option value="creative">Creative (Timeline Left Sidebar)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Typography Font</label>
                <select 
                  className="form-input" 
                  value={customTplFont}
                  onChange={(e: any) => setCustomTplFont(e.target.value)}
                >
                  <option value="inter">Inter (Modern Sans-Serif)</option>
                  <option value="space">Space Grotesk (Tech Monospace/Bold)</option>
                  <option value="roboto">Roboto (Clean Corporate)</option>
                  <option value="lora">Lora (Premium serif)</option>
                  <option value="georgia">Georgia (Academic Classical)</option>
                  <option value="outfit">Outfit (Elegant Rounded)</option>
                  <option value="opensans">Open Sans (High Readability)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Accent Theme Color</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input 
                    type="color" 
                    value={customTplColor}
                    onChange={(e) => setCustomTplColor(e.target.value)}
                    style={{ width: "40px", height: "40px", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", background: "none", padding: 0 }}
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    value={customTplColor}
                    onChange={(e) => setCustomTplColor(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Density Margins</label>
                <select 
                  className="form-input" 
                  value={customTplSpacing}
                  onChange={(e: any) => setCustomTplSpacing(e.target.value)}
                >
                  <option value="compact">Compact (Dense layout)</option>
                  <option value="regular">Regular spacing</option>
                  <option value="spacious">Spacious margins</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Section Header Accent</label>
                <select 
                  className="form-input" 
                  value={customTplHeader}
                  onChange={(e: any) => setCustomTplHeader(e.target.value)}
                >
                  <option value="default">Default Bold Title</option>
                  <option value="underline">Underlined Title Line</option>
                  <option value="border">Left Accent Bar</option>
                  <option value="block">Colored Heading Blocks</option>
                </select>
              </div>

              {customTplSuccess && (
                <div style={{ color: "#10b981", fontSize: "0.85rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>
                  Custom template added successfully! Opening presets list...
                </div>
              )}

              <button 
                className="btn btn-primary" 
                onClick={handleAddCustomTemplate} 
                disabled={!customTplName.trim()}
                style={{ width: "100%", height: "42px" }}
              >
                Add Custom Style Preset
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Floating Create Document Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Create New Document</h4>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)} type="button">&times;</button>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              <button 
                className={`modal-tab-btn ${createModalType === "standard" ? "active" : ""}`}
                onClick={() => setCreateModalType("standard")}
                type="button"
              >
                Standard Creator
              </button>
              <button 
                className={`modal-tab-btn ${createModalType === "ai" ? "active" : ""}`}
                onClick={() => setCreateModalType("ai")}
                type="button"
              >
                AI Tailored Resume
              </button>
            </div>

            <div className="modal-body">
              {createModalType === "standard" ? (
                <div>
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">Document Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Senior Software Engineer Resume"
                      value={newResumeName}
                      onChange={(e) => setNewResumeName(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">Document Type</label>
                    <div style={{ display: "flex", background: "var(--secondary)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <button
                        className={`doc-type-toggle-btn ${newDocType === "resume" ? "active" : ""}`}
                        onClick={() => setNewDocType("resume")}
                        type="button"
                        style={{ flex: 1, padding: "8px", fontSize: "0.78rem", background: newDocType === "resume" ? "white" : "transparent", color: newDocType === "resume" ? "var(--accent)" : "var(--muted-foreground)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                      >
                        Resume (1-Page)
                      </button>
                      <button
                        className={`doc-type-toggle-btn ${newDocType === "cv" ? "active" : ""}`}
                        onClick={() => setNewDocType("cv")}
                        type="button"
                        style={{ flex: 1, padding: "8px", fontSize: "0.78rem", background: newDocType === "cv" ? "white" : "transparent", color: newDocType === "cv" ? "var(--accent)" : "var(--muted-foreground)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                      >
                        CV (Multi-Page)
                      </button>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    onClick={handleCreateNewResume} 
                    disabled={!newResumeName.trim()}
                    style={{ width: "100%", height: "42px" }}
                    type="button"
                  >
                    Create Document
                  </button>
                </div>
              ) : (
                <div>
                  <div className="form-group" style={{ marginBottom: "12px" }}>
                    <label className="form-label">Document Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Google tailored Resume"
                      value={newAiDocName}
                      onChange={(e) => setNewAiDocName(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: "12px" }}>
                    <label className="form-label">Job Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Frontend developer"
                      value={newAiJobTitle}
                      onChange={(e) => setNewAiJobTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">Job Description</label>
                    <textarea 
                      className="form-input" 
                      rows={4} 
                      placeholder="Paste the target job description here..."
                      value={newAiJobDesc}
                      onChange={(e) => setNewAiJobDesc(e.target.value)}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {aiCreateError && (
                    <div style={{ color: "#ef4444", fontSize: "0.78rem", marginBottom: "12px" }}>
                      {aiCreateError}
                    </div>
                  )}

                  <button 
                    className="btn btn-primary" 
                    onClick={async () => {
                      await handleAiCreateNewResume();
                    }} 
                    disabled={isAiCreating || !newAiDocName.trim() || !newAiJobTitle.trim() || !newAiJobDesc.trim()}
                    style={{ width: "100%", height: "42px", background: "linear-gradient(135deg, var(--accent) 0%, #a21caf 100%)" }}
                    type="button"
                  >
                    {isAiCreating ? "AI is generating profile..." : "Generate AI tailored Resume"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 90%;
          max-width: 480px;
          padding: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .modal-header h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--foreground);
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--muted-foreground);
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: var(--foreground);
        }

        .modal-tabs {
          display: flex;
          background: var(--secondary);
          padding: 3px;
          border-radius: 8px;
          gap: 4px;
          margin-bottom: 20px;
        }

        .modal-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--muted-foreground);
          transition: all 0.2s;
        }

        .modal-tab-btn.active {
          background: #ffffff;
          color: var(--accent);
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .quick-action-btn {
          transition: all 0.2s ease;
        }

        .quick-action-btn:hover {
          border-color: var(--accent) !important;
          background-color: var(--accent-light) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .saved-resume-card:hover {
          border-color: var(--accent) !important;
          background-color: var(--accent-light) !important;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          height: calc(100vh - 80px);
          margin-top: 80px;
          overflow: hidden;
        }

        /* Rebuilt side navbar matching screenshot style */
        .dashboard-side-navbar {
          background-color: #ffffff;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          width: 240px;
        }

        .nav-brand-area {
          padding: 24px;
          border-bottom: 1px solid #f4f4f5;
        }

        .logo-sidebar {
          font-size: 1.25rem !important;
          cursor: default;
        }

        .side-navbar-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-group-header {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #111111; /* Dark group header */
          padding-left: 12px;
          margin-bottom: 4px;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          color: #71717a; /* Gray links */
          font-weight: 500;
          font-size: 0.88rem;
          text-align: left;
          transition: var(--transition-fast);
        }

        .nav-item-btn:hover {
          color: var(--foreground);
          background-color: var(--secondary);
        }

        .nav-item-btn.active {
          background-color: var(--accent-light);
          color: var(--accent) !important;
          font-weight: 600;
        }

        .nav-item-icon {
          flex-shrink: 0;
        }

        .nav-group-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          padding: 8px 12px;
          cursor: pointer;
          color: #111111;
          font-weight: 700;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
          transition: var(--transition-fast);
          border-radius: 8px;
        }

        .nav-group-toggle:hover {
          background-color: var(--secondary);
        }

        .nav-group-toggle-icon {
          color: #71717a;
          transition: transform 0.2s ease;
        }

        .nav-sub-list {
          padding-left: 8px;
          border-left: 1px solid #f4f4f5;
          margin-left: 12px;
          margin-top: 4px;
        }

        /* Customize Documentation panel subtabs */
        .customize-doc-workspace {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 16px;
          animation: fade-in-section 0.25s ease-out;
        }

        .doc-sub-tabs {
          display: flex;
          background-color: var(--secondary);
          border: 1px solid var(--border);
          padding: 4px;
          border-radius: var(--radius);
          gap: 4px;
          margin-bottom: 8px;
        }

        .doc-sub-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--secondary-foreground);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .doc-sub-tab-btn:hover {
          color: var(--foreground);
        }

        .doc-sub-tab-btn.active {
          background: #ffffff;
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .doc-sub-tab-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .nav-footer-area {
          padding: 16px;
          border-top: 1px solid #f4f4f5;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
        }

        .version-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #a1a1aa;
        }

        .dot-sep {
          color: #e4e4e7;
        }

        .footer-github-icon {
          color: #71717a;
          transition: var(--transition-fast);
          display: block;
        }

        .footer-github-icon:hover {
          color: var(--accent);
        }

        /* Workspace template picker stylings */
        .templates-search-workspace {
          animation: fade-in-section 0.25s ease-out;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .template-search-group {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        .search-icon-field {
          position: absolute;
          left: 14px;
          color: var(--muted-foreground);
        }

        .template-search-input {
          padding-left: 40px;
        }

        .presets-list-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-right: 2px;
        }

        .preset-card-item {
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 14px 18px;
          cursor: pointer;
          background: var(--background);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: var(--transition-fast);
        }

        .preset-card-item:hover {
          border-color: var(--accent);
          background-color: var(--accent-light);
        }

        .preset-card-item.selected {
          border-color: var(--accent);
          background-color: var(--accent-light);
        }

        .preset-card-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .preset-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .preset-color-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .preset-card-header h5 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .preset-card-tags {
          display: flex;
          gap: 6px;
        }

        .preset-tag {
          font-size: 0.72rem;
          background: var(--secondary);
          color: var(--secondary-foreground);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }

        .preset-check-wrapper {
          color: var(--accent);
        }

        .presets-empty-state {
          text-align: center;
          padding: 30px 10px;
          color: var(--muted-foreground);
          font-size: 0.9rem;
        }

        /* Miniature CSS Layout Visuals for Templates chooser */
        .preset-mini-layout-visual {
          width: 80px;
          height: 100px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: #ffffff;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          transition: var(--transition-fast);
        }

        .preset-card-item:hover .preset-mini-layout-visual {
          border-color: var(--accent);
        }

        /* Minimalist layout visual */
        .mini-layout-minimalist {
          width: 100%;
          height: 100%;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mini-layout-minimalist .mini-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 4px;
        }

        .mini-layout-minimalist .mini-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mini-layout-minimalist .mini-section-header {
          height: 2px;
          width: 30%;
          border-bottom: 1px solid var(--border);
        }

        .mini-bar-line {
          height: 2px;
          background-color: #e4e4e7;
          border-radius: 1px;
        }

        .mini-bar-line.long { width: 100%; }
        .mini-bar-line.medium { width: 75%; }
        .mini-bar-line.short { width: 50%; }

        /* Corporate Layout visual */
        .mini-layout-corporate {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .mini-layout-corporate .mini-header {
          height: 18px;
          width: 100%;
          display: flex;
          align-items: center;
          padding-left: 8px;
        }

        .mini-layout-corporate .mini-bar-name {
          width: 50%;
          height: 3px;
          background-color: white;
        }

        .mini-body-split {
          flex: 1;
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          padding: 6px;
          gap: 4px;
        }

        .mini-col-left, .mini-col-right {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Creative Layout visual */
        .mini-layout-creative {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: 1fr 2fr;
        }

        .mini-left-sidebar {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 6px;
          gap: 4px;
        }

        .mini-avatar {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .mini-bar-line.sidebar-line {
          width: 70%;
          height: 1.5px;
        }

        .mini-right-content {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Desktop columns layout with specific scrolls */
        .dashboard-sidebar {
          border-right: 1px solid var(--border);
          background-color: #fafafa;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .sidebar-workspace {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }

        @media (max-width: 1024px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
            height: calc(100vh - 80px);
            margin-top: 80px;
          }
          .dashboard-side-navbar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
