import { useState } from "react";
import { Cpu, ListOrdered, Layers, Download, CheckCircle, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { ThreeDMarquee } from "./ThreeDMarquee";
import type { MarqueeTemplate } from "./ThreeDMarquee";

interface LandingPageProps {
  onStart: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sampleTemplates: MarqueeTemplate[] = [
    { name: "Slate Minimal", layout: "minimalist", color: "#475569" },
    { name: "Navy Corporate", layout: "corporate", color: "#1e3a8a" },
    { name: "Emerald Creative", layout: "creative", color: "#10b981" },
    { name: "Coral Minimal", layout: "minimalist", color: "#f97316" },
    { name: "Indigo Corporate", layout: "corporate", color: "#4f46e5" },
    { name: "Violet Creative", layout: "creative", color: "#8b5cf6" },
    { name: "Charcoal Slate", layout: "corporate", color: "#334155" },
    { name: "Teal Minimalist", layout: "minimalist", color: "#0d9488" }
  ];

  const steps = [
    {
      icon: <Layers size={22} />,
      title: "1. Add Your Details",
      desc: "Fill in your profile details including personal info, education, history, achievements, projects, and skills."
    },
    {
      icon: <Cpu size={22} />,
      title: "2. Analyze ATS Compatibility",
      desc: "Input your target job description. The platform calculates your match score and lists missing key terms."
    },
    {
      icon: <ListOrdered size={22} />,
      title: "3. Reorder Sections & Filter",
      desc: "Reorder resume blocks dynamically and let the AI auto-select the best matching projects and skills."
    },
    {
      icon: <Download size={22} />,
      title: "4. Premium Template Export",
      desc: "Choose from 100+ design templates, export to high-fidelity PDF, or download a structured PowerPoint slide deck."
    }
  ];

  const features = [
    {
      title: "100+ Template Combos",
      desc: "Instantly swap between layouts, fonts, colors, and margins. Professional templates using Navy, Slate, and Emerald. No bright red/black defaults."
    },
    {
      title: "Resume & CV Modes",
      desc: "Switch between single-page resume layout guidelines or comprehensive multi-page CV rendering with automated page breaking."
    },
    {
      title: "Local & Private Storage",
      desc: "We do not host databases. All of your personal details, credentials, and API settings are cached locally in your own browser."
    },
    {
      title: "PowerPoint (PPT) slide generation",
      desc: "Convert text blocks into elegant slide decks. Ideal for presenting your project portfolio during technical interviews."
    },
    {
      title: "Gemini AI Optimizer",
      desc: "Analyze keywords and optimize summaries. Let AI filter out irrelevant skills and select projects that match the target description."
    },
    {
      title: "Custom Section Reordering",
      desc: "Control layout hierarchy. Click Up/Down arrows to shift sections like Experience, Projects, or Skills instantly."
    }
  ];

  const faqs: FaqItem[] = [
    {
      question: "Is First Step really 100% free?",
      answer: "Yes, absolutely! We believe that crafting a professional resume is the first and most critical step in anyone's career search. There are no paywalls, no watermark additions, and no locked features. Everything is open."
    },
    {
      question: "How safe is my personal information?",
      answer: "Your information is 100% private. First Step uses client-side localStorage to cache your resume data. We do not maintain user accounts or host any external servers. Your text, profile, and credentials never leave your browser."
    },
    {
      question: "Do I need a Gemini API Key to use this platform?",
      answer: "No, you do not. You can build, customize, and export templates using our local keyword matchers. An API key is only required if you want advanced Gemini-powered semantic analysis, suggestions, and auto-filtering."
    },
    {
      question: "Where can I get a Gemini API Key?",
      answer: "You can obtain a developer API key for free from Google AI Studio. Once pasted into the ATS Audit panel, it securely communicates directly with Google's endpoints client-side."
    },
    {
      question: "What is the difference between Resume and CV modes?",
      answer: "Resume mode formats your details into a concise, high-impact single page optimized for standard job applications. CV mode expands to display comprehensive detail (detailed courses, full history, and achievements) across multiple pages with clean page breaks."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="landing-page">
      {/* Home Hero Section */}
      <section id="home" className="hero-section" style={{ position: "relative", overflow: "hidden" }}>
        {/* Scrolling 3D Resumes Background */}
        <div 
          style={{ 
            position: "absolute", 
            inset: 0, 
            opacity: 0.08, 
            pointerEvents: "none", 
            zIndex: 0
          }}
        >
          <ThreeDMarquee templates={sampleTemplates} cols={4} />
        </div>

        <div className="container hero-container-layout" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-content">
            <div className="badge hero-pill">
              <span className="badge-dot"></span>
              100% Free Resume Builder
            </div>
            
            <h1 className="hero-title">
              The <span className="gradient-text">First Step</span> to landing your dream job.
            </h1>
            
            <p className="hero-subtitle-text">
              Create professional, ATS-optimized resumes and CVs tailored directly to job roles. Reorder sections, auto-select matching projects using Gemini AI, and export directly to PDF or structured PowerPoint presentations.
            </p>

            <div className="hero-cta-group">
              <button className="btn btn-primary btn-large" onClick={onStart}>
                Build Free
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="mock-resume-card" style={{ padding: 0 }}>
              <video 
                src="/landing_Page_VIdeo.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  borderRadius: "16px"
                }}
              />

              {/* Floating badges representing features */}
              <div className="floating-badge badge-top-left">
                <Cpu size={14} className="badge-icon-red" />
                AI Keyword Matcher
              </div>
              <div className="floating-badge badge-top-right">
                <Download size={14} className="badge-icon-red" />
                100+ Preset Templates
              </div>
              <div className="floating-badge badge-bottom-left">
                <CheckCircle size={14} className="badge-icon-red" />
                95% ATS Target Score
              </div>
              <div className="floating-badge badge-bottom-right">
                <Layers size={14} className="badge-icon-red" />
                Custom Section Order
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="steps-section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Follow these 4 simple steps to build your optimized resume</p>
          </div>

          <div className="steps-grid">
            {steps.map((step, idx) => (
              <div className="step-card" key={idx}>
                <div className="step-icon-wrapper">
                  {step.icon}
                </div>
                <h3 className="step-card-title">{step.title}</h3>
                <p className="step-card-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">Platform Features</h2>
            <p className="section-subtitle">Everything you need to write standard resumes and CVs</p>
          </div>

          <div className="features-grid">
            {features.map((feat, idx) => (
              <div className="feature-card" key={idx}>
                <div className="feature-card-header">
                  <CheckCircle size={18} className="feature-check-icon" />
                  <h4>{feat.title}</h4>
                </div>
                <p className="feature-card-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="faqs-section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Have questions? We have answers</p>
          </div>

          <div className="faqs-accordion-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  className={`faq-accordion-item ${isOpen ? "open" : ""}`} 
                  key={idx}
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="faq-question-row">
                    <div className="faq-question-title">
                      <HelpCircle size={18} className="faq-question-icon" />
                      <h4>{faq.question}</h4>
                    </div>
                    <button className="faq-toggle-btn" type="button" aria-label="Toggle Answer">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="faq-answer-row">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="start-banner" style={{ marginTop: "60px" }}>
            <h3>Ready to take your first step?</h3>
            <p>No credit card required. Free templates, direct exports, and AI enhancements.</p>
            <button className="btn btn-primary" onClick={onStart}>
              Build Free Now
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          position: relative;
          min-height: 100vh;
          padding-top: 80px;
        }

        .hero-section {
          padding: 80px 0 100px;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero-container-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-pill {
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: var(--foreground);
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.04em;
        }

        .hero-subtitle-text {
          font-size: 1.15rem;
          color: var(--secondary-foreground);
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 1.05rem;
          height: auto;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        /* Mock Resume Card styling */
        .mock-resume-card {
          width: 100%;
          max-width: 520px;
          aspect-ratio: 16 / 9;
          background: #ffffff;
          border: 4px solid var(--foreground);
          border-radius: 20px;
          padding: 0;
          position: relative;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.15),
            0 5px 15px rgba(255, 49, 49, 0.05);
        }

        .mock-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mock-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--secondary);
          border: 2px solid var(--border);
        }

        .mock-header-text {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .mock-line {
          height: 8px;
          background: var(--secondary);
          border-radius: 4px;
        }

        .line-long { width: 80%; }
        .line-medium { width: 50%; }
        .line-full { width: 100%; }
        .line-short { width: 30%; }

        .mock-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .mock-section-indicator {
          height: 12px;
          width: 40px;
          background: var(--accent-light);
          border-left: 3px solid var(--accent);
          border-radius: 2px;
          margin-top: 10px;
        }

        .badge-icon-red {
          color: var(--accent);
        }

        .badge-top-left {
          top: -20px;
          left: -40px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .badge-top-right {
          top: -20px;
          right: -40px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .badge-bottom-left {
          bottom: -20px;
          left: -40px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .badge-bottom-right {
          bottom: -20px;
          right: -40px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Steps Section Styling */
        .steps-section {
          background-color: var(--secondary);
          border-top: 1px solid var(--border);
          padding: 80px 0;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .step-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 30px 24px;
          transition: var(--transition-fast);
        }

        .step-card:hover {
          border-color: var(--accent);
          transform: translateY(-4px);
          box-shadow: var(--card-shadow);
        }

        .step-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .step-card-title {
          font-size: 1.1rem;
          margin-bottom: 12px;
          color: var(--foreground);
        }

        .step-card-desc {
          font-size: 0.9rem;
          color: var(--secondary-foreground);
          line-height: 1.5;
        }

        /* Features Section Styling */
        .features-section {
          padding: 80px 0;
          border-top: 1px solid var(--border);
          background: var(--background);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .feature-card {
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          transition: var(--transition-fast);
        }

        .feature-card:hover {
          border-color: var(--accent);
          background: var(--accent-light);
          transform: translateY(-2px);
        }

        .feature-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .feature-check-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .feature-card h4 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .feature-card-desc {
          font-size: 0.88rem;
          color: var(--secondary-foreground);
          line-height: 1.5;
        }

        /* FAQs Section Styling */
        .faqs-section {
          background-color: var(--secondary);
          border-top: 1px solid var(--border);
          padding: 80px 0;
        }

        .faqs-accordion-list {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-accordion-item {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          transition: var(--transition-fast);
          overflow: hidden;
        }

        .faq-accordion-item:hover {
          border-color: var(--accent);
        }

        .faq-question-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
        }

        .faq-question-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .faq-question-icon {
          color: var(--accent);
        }

        .faq-question-row h4 {
          font-size: 1.05rem;
          color: var(--foreground);
        }

        .faq-toggle-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faq-answer-row {
          padding: 0 24px 20px 54px;
          border-top: 1px solid var(--border);
          padding-top: 16px;
          animation: slide-down-faq 0.2s ease-out;
        }

        .faq-answer-row p {
          font-size: 0.92rem;
          line-height: 1.6;
          color: var(--secondary-foreground);
        }

        @keyframes slide-down-faq {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .start-banner {
          background: var(--foreground);
          color: var(--background);
          border-radius: 16px;
          padding: 48px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .start-banner h3 {
          font-size: 1.8rem;
          font-weight: 800;
        }

        .start-banner p {
          color: rgba(255, 255, 255, 0.7);
          max-width: 500px;
          margin-bottom: 12px;
        }

        @media (max-width: 1024px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-container-layout {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .hero-pill {
            margin: 0 auto 24px;
          }
          .hero-visual {
            order: -1;
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
          }
          .steps-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }
          .start-banner {
            padding: 30px 20px;
          }
        }

        @media (max-width: 580px) {
          .floating-badge {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
