import pptxgen from "pptxgenjs";
import type { ResumeData } from "../types/resume";

export function generateResumePptx(data: ResumeData) {
  const pptx = new pptxgen();
  
  // Set layout to Widescreen (16:9)
  pptx.layout = "LAYOUT_16X9";
  
  const ACCENT_RED = "FF3131";
  const TEXT_DARK = "111111";
  const TEXT_MUTED = "71717A";
  const BG_LIGHT = "F4F4F5";

  // Helper to add the global brand identity to non-cover slides
  const addSlideFrame = (slide: pptxgen.Slide, titleText: string) => {
    // Left Accent Border
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.25,
      h: 5.625,
      fill: { color: ACCENT_RED }
    });

    // Top Header line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 0.9,
      w: 12.3,
      h: 0.02,
      fill: { color: BG_LIGHT }
    });

    // Section Title
    slide.addText(titleText.toUpperCase(), {
      x: 0.5,
      y: 0.3,
      w: 8.0,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: TEXT_DARK,
      fontFace: "Arial"
    });

    // Brand Watermark (Bottom Right)
    slide.addText("First Step Resume AI", {
      x: 10.0,
      y: 5.2,
      w: 3.0,
      h: 0.3,
      fontSize: 9,
      italic: true,
      color: TEXT_MUTED,
      align: "right",
      fontFace: "Arial"
    });
  };

  // ==========================================
  // SLIDE 1: COVER PAGE (PERSONAL INFO & SUMMARY)
  // ==========================================
  const slide1 = pptx.addSlide();
  
  // Decorative Background Shapes
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 4.5,
    h: 5.625,
    fill: { color: "111111" }
  });
  
  slide1.addShape(pptx.ShapeType.rect, {
    x: 4.3,
    y: 0,
    w: 0.2,
    h: 5.625,
    fill: { color: ACCENT_RED }
  });

  // Name (In Dark Left Panel)
  slide1.addText(data.personal.name, {
    x: 0.5,
    y: 1.5,
    w: 3.5,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial"
  });

  // Title (In Dark Left Panel)
  slide1.addText(data.personal.title, {
    x: 0.5,
    y: 2.3,
    w: 3.5,
    h: 0.6,
    fontSize: 13,
    bold: true,
    color: ACCENT_RED,
    fontFace: "Arial"
  });

  // Contact list in Left Panel
  const contactText = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.website ? data.personal.website.replace(/^https?:\/\//, "") : ""
  ].filter(Boolean).join("\n");

  slide1.addText(contactText, {
    x: 0.5,
    y: 3.4,
    w: 3.5,
    h: 1.5,
    fontSize: 10,
    color: "CCCCCC",
    lineSpacing: 18,
    fontFace: "Arial"
  });

  // Profile Summary (Right Panel)
  slide1.addText("PROFILE SUMMARY", {
    x: 5.2,
    y: 1.5,
    w: 7.0,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: TEXT_DARK,
    fontFace: "Arial"
  });

  slide1.addShape(pptx.ShapeType.rect, {
    x: 5.2,
    y: 1.9,
    w: 0.8,
    h: 0.03,
    fill: { color: ACCENT_RED }
  });

  slide1.addText(data.personal.summary || "No profile summary provided.", {
    x: 5.2,
    y: 2.2,
    w: 7.0,
    h: 2.2,
    fontSize: 12,
    color: "444444",
    lineSpacing: 22,
    fontFace: "Arial"
  });


  // ==========================================
  // SLIDE 2: PROFESSIONAL EXPERIENCE
  // ==========================================
  if (data.experience.length > 0) {
    const slide2 = pptx.addSlide();
    addSlideFrame(slide2, "Work Experience");

    let currentY = 1.2;
    // Limit to top 2 experience items to avoid overflow on slide
    data.experience.slice(0, 2).forEach((exp) => {
      // Role & Company
      slide2.addText(`${exp.role}   |   ${exp.company}`, {
        x: 0.6,
        y: currentY,
        w: 9.0,
        h: 0.35,
        fontSize: 14,
        bold: true,
        color: TEXT_DARK,
        fontFace: "Arial"
      });

      // Dates & Location
      slide2.addText(`${exp.startDate} - ${exp.current ? "Present" : exp.endDate}    (${exp.location})`, {
        x: 9.8,
        y: currentY,
        w: 3.0,
        h: 0.3,
        fontSize: 10,
        color: TEXT_MUTED,
        align: "right",
        fontFace: "Arial"
      });

      // Points list
      const bullets = exp.points.slice(0, 3).map(p => ({ text: p, options: { bullet: true, indent: 20 } }));
      
      slide2.addText(bullets as any, {
        x: 0.6,
        y: currentY + 0.4,
        w: 11.8,
        h: 1.1,
        fontSize: 11,
        color: "444444",
        lineSpacing: 18,
        fontFace: "Arial"
      });

      currentY += 1.8;
    });
  }


  // ==========================================
  // SLIDE 3: TECHNICAL PROJECTS
  // ==========================================
  const activeProjects = data.projects.filter(p => p.selected);
  if (activeProjects.length > 0) {
    const slide3 = pptx.addSlide();
    addSlideFrame(slide3, "Featured Projects");

    let currentX = 0.6;
    const boxWidth = 3.6;

    // Display up to 3 projects side-by-side
    activeProjects.slice(0, 3).forEach((proj) => {
      // Project card background shape
      slide3.addShape(pptx.ShapeType.rect, {
        x: currentX,
        y: 1.2,
        w: boxWidth,
        h: 3.7,
        fill: { color: "FFFFFF" },
        line: { color: BG_LIGHT, width: 2 }
      });

      // Top red border strip
      slide3.addShape(pptx.ShapeType.rect, {
        x: currentX,
        y: 1.2,
        w: boxWidth,
        h: 0.08,
        fill: { color: ACCENT_RED }
      });

      // Title
      slide3.addText(proj.title, {
        x: currentX + 0.2,
        y: 1.4,
        w: boxWidth - 0.4,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: TEXT_DARK,
        fontFace: "Arial"
      });

      // Tech Stack
      slide3.addText(proj.technologies.slice(0, 4).join(" • "), {
        x: currentX + 0.2,
        y: 1.8,
        w: boxWidth - 0.4,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: ACCENT_RED,
        fontFace: "Arial"
      });

      // Description
      slide3.addText(proj.description, {
        x: currentX + 0.2,
        y: 2.2,
        w: boxWidth - 0.4,
        h: 2.0,
        fontSize: 10.5,
        color: "555555",
        lineSpacing: 16,
        fontFace: "Arial"
      });

      // Links text at bottom
      const links = [
        proj.githubLink ? "GitHub" : "",
        proj.liveLink ? "Live Demo" : ""
      ].filter(Boolean).join("   ");

      if (links) {
        slide3.addText(links, {
          x: currentX + 0.2,
          y: 4.4,
          w: boxWidth - 0.4,
          h: 0.3,
          fontSize: 9,
          bold: true,
          color: TEXT_DARK,
          fontFace: "Arial"
        });
      }

      currentX += 4.0;
    });
  }


  // ==========================================
  // SLIDE 4: EDUCATION & CERTIFICATIONS
  // ==========================================
  const slide4 = pptx.addSlide();
  addSlideFrame(slide4, "Education & Credentials");

  // Left Column: Education
  slide4.addText("ACADEMIC HISTORY", {
    x: 0.6,
    y: 1.2,
    w: 5.5,
    h: 0.3,
    fontSize: 14,
    bold: true,
    color: TEXT_DARK,
    fontFace: "Arial"
  });

  slide4.addShape(pptx.ShapeType.rect, {
    x: 0.6,
    y: 1.5,
    w: 1.0,
    h: 0.03,
    fill: { color: ACCENT_RED }
  });

  let eduY = 1.7;
  data.education.slice(0, 2).forEach((edu) => {
    slide4.addText(edu.degree, {
      x: 0.6,
      y: eduY,
      w: 5.5,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: TEXT_DARK,
      fontFace: "Arial"
    });

    slide4.addText(`${edu.fieldOfStudy}  |  ${edu.school}`, {
      x: 0.6,
      y: eduY + 0.25,
      w: 5.5,
      h: 0.25,
      fontSize: 10.5,
      color: ACCENT_RED,
      bold: true,
      fontFace: "Arial"
    });

    slide4.addText(`Term: ${edu.startDate} - ${edu.endDate}   •   GPA/Percentage: ${edu.gpa || "N/A"}`, {
      x: 0.6,
      y: eduY + 0.5,
      w: 5.5,
      h: 0.25,
      fontSize: 9.5,
      color: TEXT_MUTED,
      fontFace: "Arial"
    });

    eduY += 1.0;
  });

  // Right Column: Achievements & Certifications
  slide4.addText("ACHIEVEMENTS & CERTIFICATES", {
    x: 6.8,
    y: 1.2,
    w: 5.5,
    h: 0.3,
    fontSize: 14,
    bold: true,
    color: TEXT_DARK,
    fontFace: "Arial"
  });

  slide4.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 1.5,
    w: 1.5,
    h: 0.03,
    fill: { color: ACCENT_RED }
  });

  let certY = 1.7;
  data.certificates.slice(0, 4).forEach((cert) => {
    slide4.addText(`•  ${cert.title}`, {
      x: 6.8,
      y: certY,
      w: 5.5,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: TEXT_DARK,
      fontFace: "Arial"
    });

    slide4.addText(`    ${cert.issuer} (${cert.date})`, {
      x: 6.8,
      y: certY + 0.25,
      w: 5.5,
      h: 0.25,
      fontSize: 9.5,
      color: TEXT_MUTED,
      fontFace: "Arial"
    });

    certY += 0.75;
  });


  // ==========================================
  // SLIDE 5: SKILLS INVENTORY BOARD
  // ==========================================
  const activeSkills = data.skills.filter(s => s.selected);
  if (activeSkills.length > 0) {
    const slide5 = pptx.addSlide();
    addSlideFrame(slide5, "Technical Skills & Tools");

    const categories = ["Languages", "Frontend", "Backend", "Tools"];
    let currentX = 0.6;
    const columnWidth = 2.7;

    categories.forEach((cat) => {
      const catSkills = activeSkills.filter(s => s.category === cat).map(s => s.name);
      
      // Category Box
      slide5.addShape(pptx.ShapeType.rect, {
        x: currentX,
        y: 1.2,
        w: columnWidth,
        h: 3.7,
        fill: { color: "FFFFFF" },
        line: { color: BG_LIGHT, width: 1.5 }
      });

      // Category Header Block
      slide5.addShape(pptx.ShapeType.rect, {
        x: currentX,
        y: 1.2,
        w: columnWidth,
        h: 0.45,
        fill: { color: "111111" }
      });

      slide5.addText(cat.toUpperCase(), {
        x: currentX,
        y: 1.25,
        w: columnWidth,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: "FFFFFF",
        align: "center",
        fontFace: "Arial"
      });

      // Skills Listing
      if (catSkills.length === 0) {
        slide5.addText("None listed", {
          x: currentX + 0.15,
          y: 1.9,
          w: columnWidth - 0.3,
          h: 0.4,
          fontSize: 10,
          color: TEXT_MUTED,
          align: "center",
          fontFace: "Arial"
        });
      } else {
        const skillsBullets = catSkills.map(s => ({ text: s, options: { bullet: true, indent: 12 } }));
        slide5.addText(skillsBullets as any, {
          x: currentX + 0.15,
          y: 1.8,
          w: columnWidth - 0.3,
          h: 2.8,
          fontSize: 10.5,
          color: "444444",
          lineSpacing: 18,
          fontFace: "Arial"
        });
      }

      currentX += 3.0;
    });
  }

  // Trigger File Download in browser
  const safeFilename = data.personal.name.toLowerCase().replace(/\s+/g, "_");
  pptx.writeFile({ fileName: `${safeFilename}_resume.pptx` });
}
