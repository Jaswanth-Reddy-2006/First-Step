import React from "react";

export interface MarqueeTemplate {
  name: string;
  layout: "minimalist" | "corporate" | "creative";
  color: string;
}

interface ThreeDMarqueeProps {
  templates: MarqueeTemplate[];
  className?: string;
  cols?: number; // default is 4
}

export const ThreeDMarquee: React.FC<ThreeDMarqueeProps> = ({
  templates,
  className = "",
  cols = 4,
}) => {
  // Duplicate templates enough times so the seamless loop works (need 2x for the looping trick)
  const baseTemplates = [...templates, ...templates, ...templates, ...templates];

  const groupSize = Math.ceil(baseTemplates.length / cols);
  // Double each group so we can animate from 0 → -50% for a seamless infinite scroll
  const groups = Array.from({ length: cols }, (_, index) => {
    const group = baseTemplates.slice(index * groupSize, (index + 1) * groupSize);
    return [...group, ...group]; // duplicate for seamless loop
  });

  // Speeds: vary per column for a natural feel
  const durations = [18, 24, 15, 21];

  return (
    <div className={`marquee-container ${className}`} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <style>{`
        @keyframes marquee-3d-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marquee-3d-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .marquee-col-up {
          animation: marquee-3d-up var(--duration) linear infinite;
        }
        .marquee-col-down {
          animation: marquee-3d-down var(--duration) linear infinite;
        }
        .marquee-card-hover {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
        }
        .marquee-card-hover:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
      <div
        className="marquee-3d-wrapper"
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotateX(60deg) rotateY(0deg) rotateZ(-30deg) translateY(-40px)",
        }}
      >
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: `repeat(${cols}, 1fr)`, 
            gap: "24px", 
            width: "120%", 
            maxWidth: "1400px",
            padding: "20px"
          }}
        >
          {groups.map((groupItems, colIdx) => {
            const isEven = colIdx % 2 === 0;
            const duration = durations[colIdx % durations.length];
            return (
              <div
                key={`col-${colIdx}`}
                className={isEven ? "marquee-col-up" : "marquee-col-down"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  // Pass duration as CSS custom property
                  "--duration": `${duration}s`
                } as React.CSSProperties}
              >
                {groupItems.map((item, idx) => (
                  <div
                    key={`tpl-${idx}`}
                    className="marquee-card-hover"
                    style={{
                      width: "160px",
                      height: "210px",
                      background: "#ffffff",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      borderRadius: "10px",
                      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.04)",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                      userSelect: "none"
                    }}
                  >
                    {item.layout === "minimalist" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
                        <div style={{ borderBottom: `1.5px solid ${item.color}`, paddingBottom: "5px" }}>
                          <div style={{ height: "10px", width: "70%", backgroundColor: "#333", borderRadius: "2px" }}></div>
                          <div style={{ height: "6px", width: "40%", backgroundColor: item.color, borderRadius: "1.5px", marginTop: "4px" }}></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <div style={{ height: "5px", width: "30%", backgroundColor: item.color, borderRadius: "1px" }}></div>
                          <div style={{ height: "3px", width: "90%", backgroundColor: "#e4e4e7", borderRadius: "1px" }}></div>
                          <div style={{ height: "3px", width: "80%", backgroundColor: "#e4e4e7", borderRadius: "1px" }}></div>
                          <div style={{ height: "5px", width: "45%", backgroundColor: item.color, borderRadius: "1px", marginTop: "6px" }}></div>
                          <div style={{ height: "3px", width: "95%", backgroundColor: "#e4e4e7", borderRadius: "1px" }}></div>
                        </div>
                      </div>
                    )}

                    {item.layout === "corporate" && (
                      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        <div 
                          style={{ 
                            backgroundColor: item.color, 
                            padding: "6px 8px", 
                            margin: "-14px -14px 10px -14px", 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "3px" 
                          }}
                        >
                          <div style={{ height: "8px", width: "60%", backgroundColor: "white", borderRadius: "1.5px" }}></div>
                          <div style={{ height: "4px", width: "40%", backgroundColor: "rgba(255,255,255,0.7)", borderRadius: "1px" }}></div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "8px", flex: 1 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <div style={{ height: "5px", width: "50%", backgroundColor: item.color, borderRadius: "1px" }}></div>
                            <div style={{ height: "3px", width: "90%", backgroundColor: "#e4e4e7", borderRadius: "1px" }}></div>
                            <div style={{ height: "3px", width: "80%", backgroundColor: "#e4e4e7", borderRadius: "1px" }}></div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "5px", borderLeft: "1px solid #f4f4f5", paddingLeft: "5px" }}>
                            <div style={{ height: "5px", width: "70%", backgroundColor: item.color, borderRadius: "1px" }}></div>
                            <div style={{ height: "3px", width: "85%", backgroundColor: "#e4e4e7", borderRadius: "1px" }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.layout === "creative" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px", height: "100%", margin: "-14px", padding: "14px" }}>
                        <div 
                          style={{ 
                            backgroundColor: "#1f2937", 
                            margin: "-14px 0 -14px -14px", 
                            padding: "14px 6px", 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            gap: "6px" 
                          }}
                        >
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: item.color }}></div>
                          <div style={{ height: "4px", width: "80%", backgroundColor: "white", borderRadius: "1px" }}></div>
                          <div style={{ height: "3px", width: "60%", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "1px" }}></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ height: "7px", width: "80%", backgroundColor: "#111", borderRadius: "1.5px" }}></div>
                          <div style={{ height: "5px", width: "40%", backgroundColor: item.color, borderRadius: "1px" }}></div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "3px" }}>
                            <div style={{ height: "3px", width: "100%", backgroundColor: "#e4e4e7", borderRadius: "1px" }}></div>
                            <div style={{ height: "3px", width: "85%", backgroundColor: "#e4e4e7", borderRadius: "1px" }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Watermark Layout Tag */}
                    <div 
                      style={{ 
                        position: "absolute", 
                        bottom: "6px", 
                        right: "8px", 
                        fontSize: "0.5rem", 
                        fontWeight: 700, 
                        color: "var(--muted-foreground)", 
                        opacity: 0.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em"
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

