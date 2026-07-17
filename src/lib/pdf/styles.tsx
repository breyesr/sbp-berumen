import React from "react";
import { Font, StyleSheet, Svg, Path, Circle } from "@react-pdf/renderer";

// Register Google Fonts dynamically with @react-pdf/renderer
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTc2dthjQ.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Outfit",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyC4E.ttf",
      fontWeight: "bold",
    },
  ],
});

// Brand palette constants - solid Hex equivalents blended on #FAFAF8 to avoid RGBA bugs in PDF renderer
export const colors = {
  primary: "#B8975A",          // Bison Gold
  background: "#FAFAF8",       // Warm Alabaster
  foreground: "#030213",       // Agent Black
  foregroundMuted: "#475569",  // Methodology Slate
  foregroundSubtle: "#717182",
  border: "#E5E5E2",           // Blended 8% Agent Black on Alabaster
  borderSubtle: "#F0F0EC",     // Blended 4% Agent Black on Alabaster
  white: "#FFFFFF",
  verdictBg: "#FAF6EE",        // Very soft tint of gold
  
  // Premium Muted Status Palette (Client-ready, desaturated)
  success: {
    text: "#3E5647",           // Deep forest sage
    border: "#A2B7A9",         // Muted sage border
    bg: "#F1F5F2",             // Soft sage background tint
  },
  warning: {
    text: "#846B41",           // Muted gold/bronze
    border: "#CBBCA0",         // Soft gold border
    bg: "#FAF8F3",             // Soft gold background tint
  },
  alert: {
    text: "#8E3E3E",           // Deep terracotta/burgundy
    border: "#DCA3A3",         // Soft terracotta border
    bg: "#FAF3F3",             // Soft rose background tint
  },
};

// Reusable SVG logo matching public/icon.svg
export const IntelAgentLogo = ({ width = 24, height = 24 }) => (
  <Svg width={width} height={height} viewBox="0 0 40 40">
    <Path
      d="M20 3L35 11.66V28.34L20 37L5 28.34V11.66L20 3Z"
      stroke={colors.foreground}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M20 10L28 14.5V25.5L20 30L12 25.5V14.5L20 10Z"
      stroke={colors.foreground}
      strokeWidth={1.5}
      strokeDasharray="2 4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle cx={20} cy={20} r={3.5} fill={colors.primary} />
    <Path
      d="M20 3V10M35 11.66L28 14.5M35 28.34L28 25.5M20 37V30M5 28.34L12 25.5M5 11.66L12 14.5"
      stroke={colors.foreground}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// 1. User Icon (for Persona Metadata)
export const UserIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

// 2. Sparkles Icon (for Nivel de Reto / Verdicts)
export const SparklesIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// 3. TrendingUp Icon (for Fortalezas)
export const TrendingUpIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M23 6l-9.5 9.5-5-5L1 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M17 6h6v6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// 4. AlertTriangle Icon (for Brechas y Riesgos)
export const AlertTriangleIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M12 9v4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    />
    <Circle cx={12} cy={17} r={1} fill={color} />
  </Svg>
);

// 5. Target Icon (for Idea de Negocio / Plan de Acción)
export const TargetIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} fill="none" />
    <Circle cx={12} cy={12} r={6} stroke={color} strokeWidth={2} fill="none" />
    <Circle cx={12} cy={12} r={2} stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

// 6. MessageSquare Icon (for Reacción de la Persona)
export const MessageSquareIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// 7. HelpCircle Icon (for Preguntas de Seguimiento)
export const HelpCircleIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} fill="none" />
    <Path
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle cx={12} cy={17} r={1} fill={color} />
  </Svg>
);

// 8. LinkIcon (for CTAs)
export const LinkIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// 9. HashIcon (for Hashtags)
export const HashIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// 10. FileTextIcon (for General text fields)
export const FileTextIcon = ({ size = 12, color = colors.foregroundMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
  </Svg>
);

// Standardized PDF Document Styles
export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 35,            // Tightened spacing
    paddingBottom: 45,
    paddingHorizontal: 40,     // Expanded slightly to allow more content width
    backgroundColor: colors.background,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.45,
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 12,
  },
  logoSection: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 13,
    color: colors.foreground,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  dateText: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: colors.foregroundSubtle,
  },
  title: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 18,
    lineHeight: 1.15,
    color: colors.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.3,
    color: colors.foregroundMuted,
    marginBottom: 12,
  },
  
  // Premium Full-width Grid Metadata block
  metadataGrid: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    backgroundColor: "#FAF9F6",
    padding: 10,
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
  },
  metadataRow: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 8,
  },
  metadataCell: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 12,
  },
  metadataFullCell: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 8,
    marginTop: 4,
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 6,
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  metadataLabelText: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 7.5,
    color: colors.foregroundSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metadataValueText: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: colors.foreground,
    lineHeight: 1.35,
  },

  // Metadata compatibility fallback
  metadataContainer: {
    backgroundColor: "#F6F6F3",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  metadataLabel: {
    width: 130,
    fontFamily: "Outfit",
    fontWeight: "bold",
    color: colors.foregroundMuted,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metadataValue: {
    flex: 1,
    fontFamily: "Helvetica",
    color: colors.foreground,
    fontSize: 8.5,
  },

  sectionTitle: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 11,
    color: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 4,
    marginTop: 10,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 8.5,
    color: colors.foreground,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardRow: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 4,
  },
  cardLabel: {
    width: 120,
    fontFamily: "Outfit",
    fontWeight: "bold",
    color: colors.foregroundSubtle,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cardValue: {
    fontFamily: "Helvetica",
    color: colors.foreground,
  },
  bulletList: {
    marginLeft: 4,
  },
  bulletRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  bulletDot: {
    width: 8,
    fontSize: 8,
    color: colors.primary,
    marginRight: 4,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Helvetica",
    color: colors.foreground,
    fontSize: 8.5,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: colors.foregroundSubtle,
  },
});
