import { useState, useEffect } from "react";
import { Cpu, Sparkles, AlertCircle, Check, RefreshCw, Key, Eye, EyeOff, Save, Trash2, Lock, ChevronDown, ChevronUp } from "lucide-react";
import type { ResumeData, AtsReport } from "../types/resume";
import { calculateLocalAtsScore, recommendLocalProjectsAndSkills } from "../utils/mockHelper";
import { analyzeAtsWithGemini, optimizeProjectsAndSkillsWithGemini } from "../utils/geminiHelper";

interface AtsAnalyzerProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

export default function AtsAnalyzer({ data, onChange }: AtsAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AtsReport | null>(null);
  const [isUsingAi, setIsUsingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recommendations state
  const [recommendedProjects, setRecommendedProjects] = useState<string[]>([]);
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);

  // API Key state
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [showApiPanel, setShowApiPanel] = useState(false);

  // Load key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key") || "";
    setApiKey(savedKey);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem("gemini_api_key", apiKey.trim());
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
    }, 1500);
  };

  const handleClearKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
    }, 1000);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    const storedKey = localStorage.getItem("gemini_api_key") || "";

    if (storedKey) {
      try {
        setIsUsingAi(true);
        // 1. Run ATS Analysis
        const atsResult = await analyzeAtsWithGemini(data, jobDescription, storedKey);
        setReport(atsResult);

        // 2. Run Projects & Skills matching recommendation
        const matchResult = await optimizeProjectsAndSkillsWithGemini(data, jobDescription, storedKey);
        setRecommendedProjects(matchResult.recommendedProjectIds);
        setRecommendedSkills(matchResult.recommendedSkillIds);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to analyze using Gemini API. Falling back to local analyzer.");
        runLocalAnalysis();
      } finally {
        setLoading(false);
      }
    } else {
      setIsUsingAi(false);
      runLocalAnalysis();
      setLoading(false);
    }
  };

  const runLocalAnalysis = () => {
    const localReport = calculateLocalAtsScore(data, jobDescription);
    setReport(localReport);

    const localRecs = recommendLocalProjectsAndSkills(data, jobDescription);
    setRecommendedProjects(localRecs.recommendedProjectIds);
    setRecommendedSkills(localRecs.recommendedSkillIds);
  };

  const applySummary = () => {
    if (!report || !report.suggestedSummary) return;
    onChange({
      ...data,
      personal: {
        ...data.personal,
        summary: report.suggestedSummary
      }
    });
  };

  const applyProjectsAndSkills = () => {
    const updatedProjects = data.projects.map(proj => ({
      ...proj,
      selected: recommendedProjects.includes(proj.id)
    }));

    const updatedSkills = data.skills.map(skill => ({
      ...skill,
      selected: recommendedSkills.includes(skill.id)
    }));

    onChange({
      ...data,
      projects: updatedProjects,
      skills: updatedSkills
    });
  };

  return (
    <div className="ats-analyzer-container">
      <h3 className="section-form-title">ATS Optimization</h3>
      <p className="form-tab-instruction">
        Paste the job description of the position you are targeting. The system will audit your content and suggest custom adjustments.
      </p>

      {/* integrated collapsible API key card */}
      <div className="api-key-accordion-card">
        <button 
          className="api-accordion-header"
          onClick={() => setShowApiPanel(!showApiPanel)}
          type="button"
        >
          <div className="api-header-left">
            <Key size={16} className="api-key-icon" />
            <span>Gemini AI Configuration {apiKey ? "(Configured)" : "(Optional)"}</span>
          </div>
          {showApiPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showApiPanel && (
          <div className="api-accordion-body">
            <p className="api-desc-text">
              Enter your Gemini API Key to enable deep semantic AI match scoring, keyword expansions, and summary rewrites.
            </p>
            
            <div className="api-secure-badge">
              <Lock size={12} />
              <span>Saved locally in your browser. Never sent to our servers.</span>
            </div>

            <div className="form-group" style={{ marginBottom: "12px" }}>
              <div className="api-input-wrapper">
                <input
                  type={showKey ? "text" : "password"}
                  className="form-input api-key-field"
                  placeholder="Paste AIzaSy... key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  type="button"
                  className="api-field-toggle-btn"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="api-action-row">
              {apiKey && (
                <button className="btn btn-clear-api" onClick={handleClearKey} type="button">
                  <Trash2 size={12} />
                  Clear Key
                </button>
              )}
              <div style={{ flex: 1 }}></div>
              <button 
                className="btn btn-primary btn-save-api" 
                onClick={handleSaveKey} 
                disabled={keySaved}
                type="button"
              >
                {keySaved ? (
                  <>
                    <Check size={12} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={12} />
                    Save Key
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input panel */}
      <div className="form-group" style={{ marginTop: "16px" }}>
        <label className="form-label">Job Description</label>
        <textarea
          rows={6}
          className="form-input form-textarea jd-textarea"
          placeholder="Paste requirements, job role, and qualifications..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary analyze-btn"
        disabled={loading || !jobDescription.trim()}
        onClick={handleAnalyze}
      >
        {loading ? (
          <>
            <RefreshCw className="loading-spinner" size={16} />
            Analyzing Resume Alignment...
          </>
        ) : (
          <>
            <Cpu size={16} />
            Analyze ATS Score
          </>
        )}
      </button>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      {/* Warning if no key */}
      {!localStorage.getItem("gemini_api_key") && !showApiPanel && (
        <div className="key-warning-card">
          <AlertCircle size={18} className="warning-icon-red" />
          <div className="warning-text-group">
            <h5>Basic Matcher Active</h5>
            <p>Expand the AI Config card above to insert your Gemini key and activate smart feedback.</p>
          </div>
        </div>
      )}

      {/* Results panel */}
      {report && (
        <div className="ats-results-panel">
          {/* Score card */}
          <div className="ats-score-row">
            <div className="ats-score-gauge">
              <svg viewBox="0 0 36 36" className="circular-chart red">
                <path className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${report.score}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">{report.score}%</text>
              </svg>
            </div>
            
            <div className="ats-score-info">
              <h4>ATS Match Score</h4>
              <p className="engine-badge">
                {isUsingAi ? <Sparkles size={12} /> : <Cpu size={12} />}
                {isUsingAi ? "Powered by Gemini AI" : "Local Keyword Indexer"}
              </p>
              <p className="score-desc-text">
                This score indicates how well your experience, skills, and projects align with the uploaded job description.
              </p>
            </div>
          </div>

          {/* Actionable feedback */}
          <div className="ats-feedback-card">
            <h5>Recruitment Feedback</h5>
            <div className="feedback-content">
              {report.feedback.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>

          {/* Keywords Lists */}
          <div className="keywords-lists-grid">
            <div className="kw-box matched-box">
              <h5>Matched Key Terms ({report.matchingKeywords.length})</h5>
              <div className="kw-badges-wrap">
                {report.matchingKeywords.length === 0 ? (
                  <span className="kw-empty">No keywords matched yet.</span>
                ) : (
                  report.matchingKeywords.map((kw, i) => (
                    <span key={i} className="kw-badge kw-badge-match">
                      <Check size={10} />
                      {kw}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="kw-box missing-box">
              <h5>Missing Key Terms ({report.missingKeywords.length})</h5>
              <div className="kw-badges-wrap">
                {report.missingKeywords.length === 0 ? (
                  <span className="kw-empty" style={{ color: "#22c55e" }}>All keywords present!</span>
                ) : (
                  report.missingKeywords.map((kw, i) => (
                    <span key={i} className="kw-badge kw-badge-missing">
                      {kw}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Profile Summary Suggestion */}
          {report.suggestedSummary && (
            <div className="ai-suggestion-box">
              <div className="suggestion-header">
                <h5>AI Optimized Summary</h5>
                <button className="btn btn-secondary btn-sm" onClick={applySummary}>
                  Apply to Resume
                </button>
              </div>
              <p className="suggested-summary-text">{report.suggestedSummary}</p>
            </div>
          )}

          {/* AI Project & Skill Match Applicator */}
          {(recommendedProjects.length > 0 || recommendedSkills.length > 0) && (
            <div className="ai-suggestion-box optimization-box">
              <div className="suggestion-header">
                <div className="header-info">
                  <h5>Tailor Skills & Projects</h5>
                  <p className="sub-hint">
                    Selects only the {recommendedProjects.length} projects and {recommendedSkills.length} skills that match this role.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={applyProjectsAndSkills}>
                  Apply Filtering
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .ats-analyzer-container {
          animation: fade-in-section 0.25s ease-out;
        }

        /* Accordion Settings Card */
        .api-key-accordion-card {
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          background: var(--background);
          overflow: hidden;
          margin-bottom: 12px;
        }

        .api-accordion-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: var(--secondary);
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--foreground);
        }

        .api-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .api-key-icon {
          color: var(--accent);
        }

        .api-accordion-body {
          padding: 16px 18px;
          border-top: 1px solid var(--border);
          background: #ffffff;
          animation: slide-down-faq 0.2s ease-out;
        }

        .api-desc-text {
          font-size: 0.82rem;
          color: var(--secondary-foreground);
          line-height: 1.4;
          margin-bottom: 12px;
        }

        .api-secure-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.06);
          border: 1px solid rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.75rem;
          margin-bottom: 14px;
        }

        .api-secure-badge span {
          line-height: 1.2;
        }

        .api-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .api-key-field {
          padding-right: 42px;
          font-family: monospace;
          font-size: 0.85rem;
        }

        .api-field-toggle-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
        }

        .api-action-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .btn-clear-api {
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: transparent;
          color: #ef4444;
          font-size: 0.8rem;
          padding: 6px 12px;
          height: 32px;
          border-radius: 6px;
        }

        .btn-clear-api:hover {
          background: rgba(239, 68, 68, 0.06);
        }

        .btn-save-api {
          font-size: 0.8rem;
          padding: 6px 14px;
          height: 32px;
          border-radius: 6px;
        }

        .jd-textarea {
          font-family: monospace;
          font-size: 0.85rem;
        }

        .analyze-btn {
          width: 100%;
          margin-bottom: 24px;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: var(--radius);
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .key-warning-card {
          display: flex;
          gap: 12px;
          background: var(--accent-light);
          border: 1px solid rgba(255, 49, 49, 0.15);
          border-radius: var(--radius);
          padding: 16px;
          margin-bottom: 24px;
        }

        .warning-icon-red {
          color: var(--accent);
          flex-shrink: 0;
        }

        .warning-text-group h5 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 4px;
        }

        .warning-text-group p {
          font-size: 0.8rem;
          color: var(--secondary-foreground);
          line-height: 1.4;
        }

        .ats-results-panel {
          border-top: 1px dashed var(--border);
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fade-in-section 0.3s ease-out;
        }

        .ats-score-row {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .ats-score-gauge {
          width: 90px;
          height: 90px;
          flex-shrink: 0;
        }

        .circular-chart {
          display: block;
          max-width: 100%;
          max-height: 100%;
        }

        .circle-bg {
          fill: none;
          stroke: var(--secondary);
          stroke-width: 2.8;
        }

        .circle {
          fill: none;
          stroke-width: 2.8;
          stroke-linecap: round;
          stroke: var(--accent);
          animation: progress 1s ease-out forwards;
        }

        .percentage {
          fill: var(--foreground);
          font-family: var(--font-space);
          font-weight: 700;
          font-size: 8px;
          text-anchor: middle;
        }

        .ats-score-info h4 {
          font-size: 1.15rem;
          margin-bottom: 4px;
        }

        .engine-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent);
          background-color: var(--accent-light);
          padding: 3px 8px;
          border-radius: 99px;
          margin-bottom: 8px;
        }

        .score-desc-text {
          font-size: 0.8rem;
          color: var(--secondary-foreground);
          line-height: 1.4;
        }

        .ats-feedback-card {
          background: var(--secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
        }

        .ats-feedback-card h5 {
          font-size: 0.95rem;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted-foreground);
        }

        .feedback-content {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--foreground);
          white-space: pre-line;
        }

        .keywords-lists-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .kw-box {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
        }

        .kw-box h5 {
          font-size: 0.85rem;
          margin-bottom: 12px;
          color: var(--foreground);
        }

        .kw-badges-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .kw-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .kw-badge-match {
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .kw-badge-missing {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .kw-empty {
          font-size: 0.8rem;
          color: var(--secondary-foreground);
        }

        .ai-suggestion-box {
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          background: var(--background);
        }

        .suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 16px;
        }

        .suggestion-header h5 {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .suggested-summary-text {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--secondary-foreground);
          font-style: italic;
        }

        .optimization-box {
          background: var(--accent-light);
          border-color: rgba(255, 49, 49, 0.15);
        }

        .sub-hint {
          font-size: 0.75rem;
          color: var(--accent);
          font-weight: 600;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .keywords-lists-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .ats-score-row {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .ats-score-gauge {
            margin: 0 auto;
          }
          
          .suggestion-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .suggestion-header button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
