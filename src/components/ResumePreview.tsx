import type { ResumeData } from "../types/resume";
import ModernMinimalist from "../templates/ModernMinimalist";
import CorporatePro from "../templates/CorporatePro";
import CreativeTech from "../templates/CreativeTech";
import type { TemplatePreset } from "../data/templatesList";
import { fontFamilies } from "../data/templatesList";


interface ResumePreviewProps {
  data: ResumeData;
  templatePreset: TemplatePreset;
  docType: "resume" | "cv";
  fontSize?: number;
  sectionSpacing?: number;
  marginSpacing?: number;
}

export default function ResumePreview({ 
  data, 
  templatePreset, 
  docType,
  fontSize,
  sectionSpacing,
  marginSpacing
}: ResumePreviewProps) {
  
  const getActiveTemplate = () => {
    switch (templatePreset.layout) {
      case "minimalist":
        return <ModernMinimalist data={data} docType={docType} preset={templatePreset} />;
      case "corporate":
        return <CorporatePro data={data} docType={docType} preset={templatePreset} />;
      case "creative":
        return <CreativeTech data={data} docType={docType} preset={templatePreset} />;
      default:
        return <ModernMinimalist data={data} docType={docType} preset={templatePreset} />;
    }
  };

  // Resolve CSS spacing variable based on density preset
  const getPadding = () => {
    switch (templatePreset.spacing) {
      case "compact": return "24px 30px";
      case "spacious": return "50px 60px";
      default: return "36px 45px"; // regular
    }
  };

  const selectedFont = fontFamilies[templatePreset.font] || fontFamilies.inter;

  // Inline custom properties for paper container
  const paperStyles = {
    "--accent": templatePreset.color,
    "--font-family-resume": selectedFont,
    "--spacing-resume": getPadding(),
    "--font-size-override": fontSize ? `${fontSize}pt` : "10pt",
    "--section-spacing-override": sectionSpacing ? `${sectionSpacing}px` : "20px",
    "--margin-spacing-override": marginSpacing ? `${marginSpacing}px` : "30px",
    fontFamily: selectedFont,
    color: "#222222"
  } as React.CSSProperties;

  return (
    <div className="resume-preview-container">
      <div 
        className={`paper-shadow-wrapper type-${docType}`}
        style={paperStyles}
      >
        {getActiveTemplate()}
      </div>

      <style>{`
        .resume-preview-container {
          flex: 1;
          overflow-y: auto;
          background: var(--secondary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 40px;
          display: flex;
          justify-content: center;
          min-height: 0;
        }

        .paper-shadow-wrapper {
          width: 210mm; /* A4 width */
          background: #ffffff;
          box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          transition: var(--transition-fast);
        }

        /* Resume vs CV page outlines visually in dashboard */
        .paper-shadow-wrapper.type-resume {
          min-height: 297mm; /* Enforces exactly one A4 page outline visually */
          max-height: 297mm;
          overflow: hidden;
        }

        .paper-shadow-wrapper.type-cv {
          min-height: 297mm; /* Expands dynamically to hold full history */
        }

        @media (max-width: 1024px) {
          .resume-preview-container {
            padding: 20px;
          }
          .paper-shadow-wrapper {
            width: 100%;
            min-height: auto !important;
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}
