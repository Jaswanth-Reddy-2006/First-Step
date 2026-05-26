// src/lib/resumeService.ts — Resume persistence (DB + localStorage hybrid)
import { api } from "./api";
import { getToken, isGuestToken } from "./auth";
import type { ResumeData } from "../types/resume";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SavedResume {
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

// ── localStorage helpers ──────────────────────────────────────────────────────
function localKey(email: string) {
  return `first_step_resumes_${email}`;
}

function getLocalResumes(email: string): SavedResume[] {
  try {
    const raw = localStorage.getItem(localKey(email));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setLocalResumes(email: string, resumes: SavedResume[]) {
  localStorage.setItem(localKey(email), JSON.stringify(resumes));
}

// ── Determine mode ────────────────────────────────────────────────────────────
function useDb(): boolean {
  const token = getToken();
  return !isGuestToken(token);
}

// ── API ───────────────────────────────────────────────────────────────────────
interface DbResume {
  id: string;
  name: string;
  doc_type: "resume" | "cv";
  preset_id: string;
  font_size: number;
  section_gap: number;
  margin_gap: number;
  resume_data: ResumeData;
  last_modified: string;
  created_at: string;
}

function dbToSaved(r: DbResume): SavedResume {
  return {
    id: r.id,
    name: r.name,
    lastModified: r.last_modified || r.created_at,
    docType: r.doc_type,
    presetId: r.preset_id,
    fontSize: r.font_size,
    sectionSpacing: r.section_gap,
    marginSpacing: r.margin_gap,
    data: r.resume_data,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function listResumes(email: string): Promise<SavedResume[]> {
  if (!useDb()) return getLocalResumes(email);
  try {
    const res = await api.get<{ resumes: DbResume[] }>("/resumes");
    const dbResumes = res.resumes.map(dbToSaved);
    // Sync to localStorage for offline access
    setLocalResumes(email, dbResumes);
    return dbResumes;
  } catch {
    // Fallback to localStorage
    return getLocalResumes(email);
  }
}

export async function createResume(
  email: string,
  resume: SavedResume
): Promise<SavedResume> {
  if (!useDb()) {
    const all = getLocalResumes(email);
    setLocalResumes(email, [...all, resume]);
    return resume;
  }
  try {
    const res = await api.post<{ resume: DbResume }>("/resumes", {
      name: resume.name,
      docType: resume.docType,
      presetId: resume.presetId,
      fontSize: resume.fontSize,
      sectionGap: resume.sectionSpacing,
      marginGap: resume.marginSpacing,
      resumeData: resume.data,
    });
    const saved = { ...resume, id: res.resume.id };
    // Update localStorage too
    const all = getLocalResumes(email);
    setLocalResumes(email, [...all, saved]);
    return saved;
  } catch {
    const all = getLocalResumes(email);
    setLocalResumes(email, [...all, resume]);
    return resume;
  }
}

export async function updateResume(
  email: string,
  resumeId: string,
  updates: Partial<SavedResume>
): Promise<void> {
  // Always update localStorage immediately (optimistic)
  const all = getLocalResumes(email);
  const updated = all.map(r =>
    r.id === resumeId ? { ...r, ...updates, lastModified: new Date().toISOString() } : r
  );
  setLocalResumes(email, updated);

  if (!useDb()) return;

  // Sync to DB in the background (non-blocking)
  api.put(`/resumes/${resumeId}`, {
    name: updates.name,
    docType: updates.docType,
    presetId: updates.presetId,
    fontSize: updates.fontSize,
    sectionGap: updates.sectionSpacing,
    marginGap: updates.marginSpacing,
    resumeData: updates.data,
  }).catch(err => console.warn("DB sync warning:", err.message));
}

export async function deleteResume(email: string, resumeId: string): Promise<void> {
  // Remove from localStorage
  const all = getLocalResumes(email);
  setLocalResumes(email, all.filter(r => r.id !== resumeId));

  if (!useDb()) return;
  await api.delete(`/resumes/${resumeId}`).catch(err => console.warn("DB delete warning:", err.message));
}

export async function duplicateResume(
  email: string,
  originalId: string,
  newResume: SavedResume
): Promise<SavedResume> {
  if (!useDb()) {
    const all = getLocalResumes(email);
    setLocalResumes(email, [...all, newResume]);
    return newResume;
  }
  try {
    const res = await api.post<{ resume: DbResume }>(`/resumes/${originalId}/duplicate`, {});
    const saved = { ...newResume, id: res.resume.id };
    const all = getLocalResumes(email);
    setLocalResumes(email, [...all, saved]);
    return saved;
  } catch {
    const all = getLocalResumes(email);
    setLocalResumes(email, [...all, newResume]);
    return newResume;
  }
}

// Batch-save entire list (used when reordering or bulk changes)
export function saveAllLocal(email: string, resumes: SavedResume[]): void {
  setLocalResumes(email, resumes);
}
