import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { 
  pdfStyles, 
  colors, 
  IntelAgentLogo,
  UserIcon,
  SparklesIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  TargetIcon,
  MessageSquareIcon,
  HelpCircleIcon
} from "@/lib/pdf/styles";
import { StressResult } from "./types";

interface StressTestPDFProps {
  result: StressResult;
  idea: string;
  personaSegment: string;
  personaProfile: string;
  date: string;
  labels: {
    title: string;
    persona: string;
    idea: string;
    personaSegment: string;
    personaProfile: string;
    verdict: string;
    confidence: string;
    reaction: string;
    strengths: string;
    gaps: string;
    actionPlan: string;
    footerText: string;
    pageOf: string;
  };
}

// Local style overrides for visual screen alignment and grid spacing
const localStyles = StyleSheet.create({
  // Side-by-side split columns
  columnsContainer: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 12,
  },
  leftColumn: {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    marginRight: 15,
  },
  rightColumn: {
    flex: 2,
    display: "flex",
    flexDirection: "column",
  },
  // Section Header Component Styles (Mirrors screen section titles)
  sectionHeaderContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 4,
  },
  sectionHeaderIconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  sectionHeaderTitle: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Reaction Block Layout (Soft Primary background tint)
  reactionBlock: {
    backgroundColor: colors.verdictBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: 6,
    padding: 12,
  },
  reactionText: {
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.foreground,
    fontStyle: "italic",
  },
  // Score display
  scoreCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  bigScore: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 32,
    color: colors.primary,
    lineHeight: 1,
  },
  scoreLabel: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 8,
    color: colors.foregroundSubtle,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  // Scoring Breakdown (DSE)
  breakdownCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    padding: 10,
  },
  breakdownTitle: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 8.5,
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 4,
  },
  metricRow: {
    marginBottom: 8,
  },
  metricHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  metricLabel: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 7.5,
    color: colors.foregroundMuted,
  },
  metricScore: {
    fontFamily: "Helvetica",
    fontWeight: "bold",
    fontSize: 7.5,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.borderSubtle,
    borderRadius: 2,
    width: "100%",
    position: "relative",
    marginVertical: 2,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
  },
  metricDesc: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: colors.foregroundSubtle,
    fontStyle: "italic",
    marginTop: 1,
  },
  // Side-by-side Grid Cards on Page 2
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 12,
  },
  successCard: {
    backgroundColor: colors.success.bg,
    borderColor: colors.success.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginRight: 15,
  },
  errorCard: {
    backgroundColor: colors.alert.bg,
    borderColor: colors.alert.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flex: 1,
  },
  // Numbered action badges
  actionPlanBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.verdictBg,
    borderWidth: 1,
    borderColor: colors.primary,
    color: colors.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginTop: 2,
  },
  actionPlanBadgeText: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 7.5,
  },
  // Follow Up Questions Section
  questionsContainer: {
    display: "flex",
    flexDirection: "column",
  },
  questionRow: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  questionText: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: colors.foregroundMuted,
    fontStyle: "italic",
    lineHeight: 1.3,
  },
});

// Section Header Helper Component
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  color?: string;
  bgColor?: string;
}

const SectionHeader = ({ icon, title, color = colors.primary, bgColor = colors.borderSubtle }: SectionHeaderProps) => (
  <View style={localStyles.sectionHeaderContainer}>
    <View style={[localStyles.sectionHeaderIconWrapper, { backgroundColor: bgColor }]}>
      {icon}
    </View>
    <Text style={[localStyles.sectionHeaderTitle, { color }]}>{title}</Text>
  </View>
);

export function StressTestPDF({
  result,
  idea,
  personaSegment,
  personaProfile,
  date,
  labels,
}: StressTestPDFProps) {
  const score = result.confidenceScore || 0;
  const status = score >= 70 ? colors.success : score >= 40 ? colors.warning : colors.alert;

  // Defensive fallback objects for breakdown metric ratings
  const breakdown = result.confidenceBreakdown || {
    problemValidity: 0,
    solutionLogic: 0,
    pitchClarity: 0,
  };
  const rationale = result.scoringRationale || {
    value: "Evaluación del dolor y urgencia para la persona.",
    feasibility: "Evaluación de factibilidad y recursos.",
    lens: "Evaluación bajo el lente específico solicitado.",
  };

  const getMetricColor = (val: number) => {
    if (val >= 70) return colors.success.text;
    if (val >= 40) return colors.warning.text;
    return colors.alert.text;
  };

  const getMetricBarColor = (val: number) => {
    if (val >= 70) return colors.success.border;
    if (val >= 40) return colors.warning.border;
    return colors.alert.border;
  };

  // Clean the persona name by splitting name parts (e.g. Camila — Role)
  const cleanPersonaName = result.persona ? result.persona.split(" — ")[0].trim() : "";

  return (
    <Document>
      {/* PAGE 1: Evaluation Reaction & DSE Breakdown Dashboard */}
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.headerContainer} fixed>
          <View style={pdfStyles.logoSection}>
            <IntelAgentLogo width={16} height={16} />
            <Text style={pdfStyles.logoText}>IntelAgent</Text>
          </View>
          <Text style={pdfStyles.dateText}>{date}</Text>
        </View>

        {/* Title */}
        <Text style={pdfStyles.title}>{labels.title}</Text>
        <Text style={[pdfStyles.subtitle, { marginBottom: 12 }]}>Simulación de Inteligencia de Mercado</Text>

        {/* Refined Metadata Grid Layout (Direct Row-based alignment) */}
        <View style={pdfStyles.metadataGrid}>
          <View style={pdfStyles.metadataRow}>
            {/* Persona Evaluadora */}
            <View style={pdfStyles.metadataCell}>
              <View style={[pdfStyles.iconWrapper, { backgroundColor: colors.borderSubtle }]}>
                <UserIcon size={10} color={colors.foregroundSubtle} />
              </View>
              <View style={pdfStyles.contentWrapper}>
                <Text style={pdfStyles.metadataLabelText}>{labels.persona}</Text>
                <Text style={pdfStyles.metadataValueText}>{cleanPersonaName}</Text>
              </View>
            </View>

            {/* Segmento */}
            {personaSegment ? (
              <View style={pdfStyles.metadataCell}>
                <View style={[pdfStyles.iconWrapper, { backgroundColor: colors.warning.bg }]}>
                  <SparklesIcon size={10} color={colors.warning.text} />
                </View>
                <View style={pdfStyles.contentWrapper}>
                  <Text style={pdfStyles.metadataLabelText}>{labels.personaSegment}</Text>
                  <Text style={pdfStyles.metadataValueText}>{personaSegment}</Text>
                </View>
              </View>
            ) : null}

            {/* Perfil */}
            {personaProfile ? (
              <View style={pdfStyles.metadataCell}>
                <View style={[pdfStyles.iconWrapper, { backgroundColor: colors.success.bg }]}>
                  <UserIcon size={10} color={colors.success.text} />
                </View>
                <View style={pdfStyles.contentWrapper}>
                  <Text style={pdfStyles.metadataLabelText}>{labels.personaProfile}</Text>
                  <Text style={pdfStyles.metadataValueText}>{personaProfile}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Idea de Negocio (Full width) */}
          {idea ? (
            <View style={pdfStyles.metadataFullCell}>
              <View style={[pdfStyles.iconWrapper, { backgroundColor: colors.verdictBg }]}>
                <TargetIcon size={10} color={colors.primary} />
              </View>
              <View style={pdfStyles.contentWrapper}>
                <Text style={pdfStyles.metadataLabelText}>{labels.idea}</Text>
                <Text style={pdfStyles.metadataValueText}>{idea}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Two-Column Side-by-Side Area */}
        <View style={localStyles.columnsContainer}>
          {/* LEFT: Verdict Callout Box & Persona's Reaction */}
          <View style={localStyles.leftColumn}>
            {/* Verdict Callout Box (Soft Border Accent) */}
            <View
              style={[
                pdfStyles.card,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: status.border,
                  backgroundColor: status.bg,
                  padding: 12,
                  marginBottom: 10,
                },
              ]}
              wrap={false}
            >
              <SectionHeader 
                icon={<SparklesIcon size={9} color={status.text} />}
                title={labels.verdict}
                color={status.text}
                bgColor={status.bg}
              />
              <Text style={[pdfStyles.cardValue, { fontSize: 8.5, lineHeight: 1.5 }]}>
                {result.verdict}
              </Text>
            </View>

            {result.personaReaction ? (
              <View style={localStyles.reactionBlock}>
                <SectionHeader 
                  icon={<MessageSquareIcon size={9} color={colors.primary} />}
                  title={labels.reaction}
                  color={colors.primary}
                  bgColor={colors.verdictBg}
                />
                <Text style={localStyles.reactionText}>
                  &quot;{result.personaReaction}&quot;
                </Text>
              </View>
            ) : null}
          </View>

          {/* RIGHT: Score Card & DSE Breakdown Metrics */}
          <View style={localStyles.rightColumn}>
            {/* Score Display */}
            <View style={localStyles.scoreCard}>
              <Text style={[localStyles.bigScore, { color: status.text }]}>{score}%</Text>
              <Text style={localStyles.scoreLabel}>{labels.confidence}</Text>
            </View>

            {/* Desglose de Confianza (DSE) */}
            <View style={localStyles.breakdownCard}>
              <Text style={localStyles.breakdownTitle}>Desglose DSE</Text>

              {/* Metric 1: Problem Validity */}
              <View style={localStyles.metricRow}>
                <View style={localStyles.metricHeader}>
                  <Text style={localStyles.metricLabel}>Validez del Problema (50%)</Text>
                  <Text style={[localStyles.metricScore, { color: getMetricColor(breakdown.problemValidity) }]}>
                    {breakdown.problemValidity}/100
                  </Text>
                </View>
                <View style={localStyles.progressBarBg}>
                  <View
                    style={[
                      localStyles.progressBarFill,
                      {
                        width: `${breakdown.problemValidity}%`,
                        backgroundColor: getMetricBarColor(breakdown.problemValidity),
                      },
                    ]}
                  />
                </View>
                <Text style={localStyles.metricDesc}>“{rationale.value}”</Text>
              </View>

              {/* Metric 2: Solution Logic */}
              <View style={localStyles.metricRow}>
                <View style={localStyles.metricHeader}>
                  <Text style={localStyles.metricLabel}>Lógica de Solución (30%)</Text>
                  <Text style={[localStyles.metricScore, { color: getMetricColor(breakdown.solutionLogic) }]}>
                    {breakdown.solutionLogic}/100
                  </Text>
                </View>
                <View style={localStyles.progressBarBg}>
                  <View
                    style={[
                      localStyles.progressBarFill,
                      {
                        width: `${breakdown.solutionLogic}%`,
                        backgroundColor: getMetricBarColor(breakdown.solutionLogic),
                      },
                    ]}
                  />
                </View>
                <Text style={localStyles.metricDesc}>“{rationale.feasibility}”</Text>
              </View>

              {/* Metric 3: Pitch Clarity */}
              <View style={localStyles.metricRow}>
                <View style={localStyles.metricHeader}>
                  <Text style={localStyles.metricLabel}>Claridad del Pitch (20%)</Text>
                  <Text style={[localStyles.metricScore, { color: getMetricColor(breakdown.pitchClarity) }]}>
                    {breakdown.pitchClarity}/100
                  </Text>
                </View>
                <View style={localStyles.progressBarBg}>
                  <View
                    style={[
                      localStyles.progressBarFill,
                      {
                        width: `${breakdown.pitchClarity}%`,
                        backgroundColor: getMetricBarColor(breakdown.pitchClarity),
                      },
                    ]}
                  />
                </View>
                <Text style={localStyles.metricDesc}>“{rationale.lens}”</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>{labels.footerText}</Text>
          <Text
            style={pdfStyles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${labels.pageOf.replace("{current}", String(pageNumber)).replace("{total}", String(totalPages))}`
            }
          />
        </View>
      </Page>

      {/* PAGE 2: Analytical Details (Strengths, Gaps, Plan, Questions) */}
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.headerContainer} fixed>
          <View style={pdfStyles.logoSection}>
            <IntelAgentLogo width={16} height={16} />
            <Text style={pdfStyles.logoText}>IntelAgent</Text>
          </View>
          <Text style={pdfStyles.dateText}>{date}</Text>
        </View>

        <Text style={[pdfStyles.title, { fontSize: 16 }]}>Análisis Detallado</Text>
        <Text style={[pdfStyles.subtitle, { marginBottom: 12 }]}>{result.persona}</Text>

        {/* Grid Strengths & Gaps */}
        <View style={localStyles.gridContainer}>
          {/* Strengths Card */}
          {result.strengths && result.strengths.length > 0 ? (
            <View style={localStyles.successCard} wrap={false}>
              <SectionHeader 
                icon={<TrendingUpIcon size={9} color={colors.success.text} />}
                title={labels.strengths}
                color={colors.success.text}
                bgColor={colors.success.bg}
              />
              <View style={pdfStyles.bulletList}>
                {result.strengths.map((str, idx) => (
                  <View key={idx} style={pdfStyles.bulletRow}>
                    <Text style={[pdfStyles.bulletDot, { color: colors.success.border }]}>✓</Text>
                    <Text style={pdfStyles.bulletText}>{str}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Gaps Card */}
          {result.gaps && result.gaps.length > 0 ? (
            <View style={localStyles.errorCard} wrap={false}>
              <SectionHeader 
                icon={<AlertTriangleIcon size={9} color={colors.alert.text} />}
                title={labels.gaps}
                color={colors.alert.text}
                bgColor={colors.alert.bg}
              />
              <View style={pdfStyles.bulletList}>
                {result.gaps.map((gap, idx) => (
                  <View key={idx} style={pdfStyles.bulletRow}>
                    <Text style={[pdfStyles.bulletDot, { color: colors.alert.border }]}>✕</Text>
                    <Text style={pdfStyles.bulletText}>{gap}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Action Plan */}
        {result.actionPlan && result.actionPlan.length > 0 ? (
          <View style={[pdfStyles.card, { marginTop: 10 }]} wrap={false}>
            <SectionHeader 
              icon={<TargetIcon size={9} color={colors.primary} />}
              title={labels.actionPlan}
              color={colors.foreground}
              bgColor={colors.verdictBg}
            />
            <View style={pdfStyles.bulletList}>
              {result.actionPlan.map((plan, idx) => (
                <View key={idx} style={pdfStyles.bulletRow}>
                  <View style={localStyles.actionPlanBadge}>
                    <Text style={localStyles.actionPlanBadgeText}>{idx + 1}</Text>
                  </View>
                  <Text style={[pdfStyles.bulletText, { fontSize: 8.5, paddingTop: 1.5 }]}>{plan}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Follow-up Questions (Preguntas de Seguimiento) */}
        {result.followUpQuestions && result.followUpQuestions.length > 0 ? (
          <View style={[pdfStyles.card, { marginTop: 10, backgroundColor: colors.warning.bg, borderColor: colors.warning.border }]} wrap={false}>
            <SectionHeader 
              icon={<HelpCircleIcon size={9} color={colors.warning.text} />}
              title="Preguntas de Seguimiento"
              color={colors.warning.text}
              bgColor={colors.warning.bg}
            />
            <View style={localStyles.questionsContainer}>
              {result.followUpQuestions.map((question, idx) => (
                <View key={idx} style={localStyles.questionRow}>
                  <Text style={localStyles.questionText}>&quot;{question}&quot;</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>{labels.footerText}</Text>
          <Text
            style={pdfStyles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${labels.pageOf.replace("{current}", String(pageNumber)).replace("{total}", String(totalPages))}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
