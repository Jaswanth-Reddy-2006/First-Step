import React, { useState } from "react";
import { ChevronUp, ChevronDown, GripVertical, User, Briefcase, Code, GraduationCap, Wrench, Award } from "lucide-react";

interface SectionManagerProps {
  order: string[];
  onChangeOrder: (newOrder: string[]) => void;
}

const sectionMetadata: Record<string, { label: string; icon: React.ReactNode }> = {
  summary: { label: "Profile Summary", icon: <User size={16} /> },
  experience: { label: "Professional Experience", icon: <Briefcase size={16} /> },
  projects: { label: "Featured Projects", icon: <Code size={16} /> },
  skills: { label: "Skills & Tools", icon: <Wrench size={16} /> },
  education: { label: "Education History", icon: <GraduationCap size={16} /> },
  certificates: { label: "Achievements & Certificates", icon: <Award size={16} /> }
};

export default function SectionManager({ order, onChangeOrder }: SectionManagerProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...order];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onChangeOrder(newOrder);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const newOrder = [...order];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    onChangeOrder(newOrder);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="section-manager">
      <h3 className="section-form-title" style={{ marginBottom: "8px" }}>Arrange Sections</h3>
      <p className="form-tab-instruction">
        Drag the <strong>grip handle</strong> to reorder sections, or use the arrow buttons. Changes apply to your resume instantly.
      </p>

      <div className="reorder-list">
        {order.map((sectionKey, index) => {
          const metadata = sectionMetadata[sectionKey] || { label: sectionKey, icon: <GripVertical size={16} /> };
          const isFirst = index === 0;
          const isLast = index === order.length - 1;
          const isDragging = dragIndex === index;
          const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <div
              key={sectionKey}
              className="reorder-item"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: isDragging ? 0.35 : 1,
                border: isDropTarget ? "2px solid var(--accent)" : "1px solid var(--border)",
                background: isDropTarget ? "var(--accent-light)" : "white",
                transform: isDropTarget ? "scale(1.015)" : "scale(1)",
                boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.12)" : undefined,
                transition: "transform 0.15s ease, border-color 0.15s ease, background 0.15s ease",
                cursor: isDragging ? "grabbing" : "default",
              }}
            >
              <div className="reorder-item-left">
                <div className="reorder-drag-handle" title="Drag to reorder">
                  <GripVertical size={16} />
                </div>
                <div className="reorder-item-details">
                  <span className="reorder-icon">{metadata.icon}</span>
                  <span className="reorder-label">{metadata.label}</span>
                </div>
              </div>

              <div className="reorder-actions">
                <button
                  className="reorder-btn"
                  onClick={() => moveSection(index, "up")}
                  disabled={isFirst}
                  title="Move Up"
                  type="button"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  className="reorder-btn"
                  onClick={() => moveSection(index, "down")}
                  disabled={isLast}
                  title="Move Down"
                  type="button"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .section-manager {
          animation: fade-in-section 0.25s ease-out;
        }

        .reorder-item-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .reorder-drag-handle {
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          cursor: grab;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.15s ease, background 0.15s ease;
        }

        .reorder-drag-handle:hover {
          color: var(--accent);
          background: var(--accent-light);
        }

        .reorder-drag-handle:active {
          cursor: grabbing;
        }

        .reorder-item-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reorder-icon {
          color: var(--accent);
          display: flex;
          align-items: center;
        }

        .reorder-label {
          font-weight: 600;
          color: var(--foreground);
          font-size: 0.88rem;
        }
      `}</style>
    </div>
  );
}
