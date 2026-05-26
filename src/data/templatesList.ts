export interface TemplatePreset {
  id: string;
  name: string;
  layout: "minimalist" | "corporate" | "creative";
  font: "space" | "inter" | "roboto" | "lora" | "georgia" | "outfit" | "opensans" | "georgian";
  color: string; // Professional hex color
  spacing: "compact" | "regular" | "spacious";
  headerStyle: "default" | "underline" | "border" | "block";
}

// Helper fonts definitions
export const fontFamilies = {
  space: '"Space Grotesk", sans-serif',
  inter: '"Inter", sans-serif',
  roboto: '"Roboto", sans-serif',
  lora: '"Lora", serif',
  georgia: '"Georgia", serif',
  outfit: '"Outfit", sans-serif',
  opensans: '"Open Sans", sans-serif',
  georgian: '"Georgia", serif'
};

// Generates 100 professional presets programmatically
const generatePresets = (): TemplatePreset[] => {
  const layouts: ("minimalist" | "corporate" | "creative")[] = ["minimalist", "corporate", "creative"];
  const fonts: ("space" | "inter" | "roboto" | "lora" | "georgia" | "outfit" | "opensans" | "georgian")[] = [
    "inter", "space", "roboto", "lora", "georgia", "outfit", "opensans", "georgian"
  ];
  
  // High-fidelity professional colors (Navy, Charcoal, Slate, Emerald, Burgundy, Teal, Olive, Indigo, Bronze)
  const colors = [
    "#1e3a8a", // Navy Blue
    "#27272a", // Charcoal
    "#475569", // Slate
    "#065f46", // Emerald
    "#800020", // Burgundy
    "#0d9488", // Teal
    "#3f6212", // Olive
    "#3730a3", // Indigo
    "#5c4033", // Bronze
    "#2f4f4f"  // Dark Slate
  ];
  
  const spacings: ("compact" | "regular" | "spacious")[] = ["compact", "regular", "spacious"];
  const headers: ("default" | "underline" | "border" | "block")[] = ["default", "underline", "border", "block"];

  const presets: TemplatePreset[] = [];

  const adjectives = [
    "Executive", "Tech", "Academic", "Minimalist", "Elegant", "Slate", "Emerald", "Navy", "Royal", "Modern",
    "Creative", "Scholar", "Ivory", "Classic", "Clean", "Corporate", "Elite", "Pro", "Vector", "Core",
    "Signature", "Summit", "Prime", "Apex", "Zenith", "Novus", "Vanguard", "Global", "Metro", "Urban"
  ];
  
  const nouns = [
    "Path", "Lead", "Expert", "Guide", "Edge", "Slate", "Compass", "Matrix", "Deck", "Concept",
    "Profile", "Draft", "Focus", "Vision", "Nexus", "Portal", "Beacon", "Anchor", "Summit", "Line",
    "Page", "Brief", "Record", "Standard", "Format", "Impact", "Clarity", "Design", "Grid", "Outline"
  ];

  // Cross-multiply options to create 100 unique named templates
  let count = 0;
  for (let a = 0; a < adjectives.length; a++) {
    for (let n = 0; n < nouns.length; n++) {
      if (count >= 100) break;
      
      const layout = layouts[count % layouts.length];
      const font = fonts[count % fonts.length];
      const color = colors[count % colors.length];
      const spacing = spacings[count % spacings.length];
      const headerStyle = headers[count % headers.length];

      presets.push({
        id: `tpl-${count + 1}`,
        name: `${adjectives[a]} ${nouns[n]}`,
        layout,
        font,
        color,
        spacing,
        headerStyle
      });
      
      count++;
    }
    if (count >= 100) break;
  }

  return presets;
};

export const templatesList = generatePresets();
