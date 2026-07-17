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
  HelpCircleIcon,
  LinkIcon,
  HashIcon,
  FileTextIcon
} from "@/lib/pdf/styles";
import { CopyOutput } from "./types";

interface CopywriterPDFProps {
  personaName: string;
  goal: string;
  context: string;
  message: string;
  outputs: CopyOutput[];
  date: string;
  labels: {
    title: string;
    generated: string;
    persona: string;
    goal: string;
    context: string;
    message: string;
    platform: string;
    format: string;
    anchors: string;
    triggers: string;
    reasoning: string;
    footerText: string;
    pageOf: string;
  };
}

// Solid brand accents mapping derived from screen ResultSection colors
const getPlatformColor = (platformName: string = ""): string => {
  const name = platformName.toLowerCase().trim();
  if (name.includes("linkedin")) return "#0A66C2";
  if (name.includes("instagram")) return "#E1306C";
  if (name.includes("twitter") || name.includes(" x ")) return "#111111";
  if (name.includes("youtube")) return "#FF0000";
  if (name.includes("tiktok")) return "#FE2C55";
  if (name.includes("facebook")) return "#1877F2";
  if (name.includes("pinterest")) return "#BD081C";
  if (name.includes("email") || name.includes("newsletter") || name.includes("correo")) return "#4F46E5";
  if (name.includes("blog") || name.includes("article") || name.includes("articulo")) return "#12B76A";
  if (name.includes("threads")) return "#000000";
  return colors.primary; // Bison Gold fallback
};

// Local stylesheet additions for copywriter grid layouts
const localStyles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 6,
    marginBottom: 10,
  },
  platformIndicatorBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Primary generated fields (Title, Hook, Body script)
  primaryFieldContainer: {
    backgroundColor: "#FAF9F6",
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
  },
  primaryFieldHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  primaryFieldLabel: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 7.5,
    color: colors.foregroundMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  primaryFieldValue: {
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.45,
    color: colors.foreground,
  },
  // Secondary utility fields (CTA, Hashtags, Notes)
  secondaryFieldContainer: {
    backgroundColor: "#F5F5F3",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    display: "flex",
    flexDirection: "column",
  },
  secondaryFieldHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  secondaryFieldLabel: {
    fontFamily: "Outfit",
    fontWeight: "bold",
    fontSize: 7,
    color: colors.foregroundSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  secondaryFieldValue: {
    fontFamily: "Helvetica",
    fontSize: 8,
    lineHeight: 1.35,
    color: colors.foregroundMuted,
  },
  // Hashtags horizontal flex badging
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  hashtagBadge: {
    backgroundColor: colors.borderSubtle,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  hashtagText: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: colors.foregroundMuted,
  },
});

export function CopywriterPDF({
  personaName,
  goal,
  context,
  message,
  outputs,
  date,
  labels,
}: CopywriterPDFProps) {
  const cleanPersonaName = personaName ? personaName.split(" — ")[0].trim() : "";

  return (
    <Document>
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
        <Text style={[pdfStyles.subtitle, { marginBottom: 12 }]}>Simulación de Generación de Copy</Text>

        {/* Refined Metadata Grid Layout */}
        <View style={pdfStyles.metadataGrid}>
          <View style={pdfStyles.metadataRow}>
            {/* Persona */}
            <View style={pdfStyles.metadataCell}>
              <View style={[pdfStyles.iconWrapper, { backgroundColor: colors.borderSubtle }]}>
                <UserIcon size={10} color={colors.foregroundSubtle} />
              </View>
              <View style={pdfStyles.contentWrapper}>
                <Text style={pdfStyles.metadataLabelText}>{labels.persona}</Text>
                <Text style={pdfStyles.metadataValueText}>{cleanPersonaName}</Text>
              </View>
            </View>

            {/* Goal */}
            {goal ? (
              <View style={pdfStyles.metadataCell}>
                <View style={[pdfStyles.iconWrapper, { backgroundColor: colors.warning.bg }]}>
                  <TargetIcon size={10} color={colors.warning.text} />
                </View>
                <View style={pdfStyles.contentWrapper}>
                  <Text style={pdfStyles.metadataLabelText}>{labels.goal}</Text>
                  <Text style={pdfStyles.metadataValueText}>{goal}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Context (Full width) */}
          {context ? (
            <View style={pdfStyles.metadataFullCell}>
              <View style={[pdfStyles.iconWrapper, { backgroundColor: colors.verdictBg }]}>
                <HelpCircleIcon size={10} color={colors.primary} />
              </View>
              <View style={pdfStyles.contentWrapper}>
                <Text style={pdfStyles.metadataLabelText}>{labels.context}</Text>
                <Text style={pdfStyles.metadataValueText}>{context}</Text>
              </View>
            </View>
          ) : null}

          {/* Message (Full width) */}
          {message ? (
            <View style={pdfStyles.metadataFullCell}>
              <View style={[pdfStyles.iconWrapper, { backgroundColor: colors.success.bg }]}>
                <MessageSquareIcon size={10} color={colors.success.text} />
              </View>
              <View style={pdfStyles.contentWrapper}>
                <Text style={pdfStyles.metadataLabelText}>{labels.message}</Text>
                <Text style={pdfStyles.metadataValueText}>{message}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Platform Outputs list */}
        <Text style={pdfStyles.sectionTitle}>
          {labels.platform} &amp; {labels.format}
        </Text>

        {outputs.map((output, idx) => {
          if (!output) return null;

          const platformColor = getPlatformColor(output.platformName);
          const PRIMARY_KEYS = ["title", "hook", "spoken_script", "script", "body", "caption", "text", "copy", "description"];

          return (
            <View
              key={idx}
              style={[
                pdfStyles.card,
                {
                  marginTop: 10,
                  borderTopWidth: 3,
                  borderTopColor: platformColor,
                },
              ]}
              wrap={false} // Avoid page breaks inside individual copy blocks
            >
              {/* Card Header */}
              <View style={localStyles.cardHeader}>
                <Text style={pdfStyles.cardTitle}>
                  {output.platformName || "Platform"} / {output.formatName || "Format"}
                </Text>
                <View style={[localStyles.platformIndicatorBadge, { backgroundColor: platformColor }]} />
              </View>

              {/* Dynamic generated fields */}
              {output.fields &&
                Object.entries(output.fields).map(([fieldLabel, fieldValue]) => {
                  if (!fieldValue) return null;

                  const key = fieldLabel.toLowerCase();
                  const displayLabel = fieldLabel.replace(/_/g, " ").toUpperCase();
                  const isPrimary = PRIMARY_KEYS.some(f => key.includes(f));

                  // Resolve appropriate icon based on the key
                  let fieldIcon = <FileTextIcon size={8} color={colors.foregroundSubtle} />;
                  if (key.includes("hook")) {
                    fieldIcon = <SparklesIcon size={8} color={colors.primary} />;
                  } else if (key.includes("title") || key.includes("headline")) {
                    fieldIcon = <TargetIcon size={8} color={colors.primary} />;
                  } else if (key.includes("script") || key.includes("body") || key.includes("caption") || key.includes("text")) {
                    fieldIcon = <MessageSquareIcon size={8} color={colors.foregroundMuted} />;
                  } else if (key.includes("cta") || key.includes("call_to_action")) {
                    fieldIcon = <LinkIcon size={8} color={colors.success.text} />;
                  } else if (key.includes("hashtag") || key.includes("tag")) {
                    fieldIcon = <HashIcon size={8} color={colors.foregroundSubtle} />;
                  }

                  if (isPrimary) {
                    return (
                      <View
                        key={fieldLabel}
                        style={[
                          localStyles.primaryFieldContainer,
                          { borderLeftColor: platformColor }
                        ]}
                      >
                        <View style={localStyles.primaryFieldHeader}>
                          {fieldIcon}
                          <Text style={localStyles.primaryFieldLabel}>{displayLabel}</Text>
                        </View>
                        <Text style={localStyles.primaryFieldValue}>{fieldValue}</Text>
                      </View>
                    );
                  } else if (key.includes("hashtag") || key.includes("tag")) {
                    // Horizontal Tag badging
                    const tags = fieldValue.split(/[\s,]+/).filter(t => t.startsWith("#") || t.length > 0);
                    return (
                      <View key={fieldLabel} style={localStyles.secondaryFieldContainer}>
                        <View style={localStyles.secondaryFieldHeader}>
                          {fieldIcon}
                          <Text style={localStyles.secondaryFieldLabel}>{displayLabel}</Text>
                        </View>
                        <View style={localStyles.hashtagContainer}>
                          {tags.map((tag, tIdx) => (
                            <View key={tIdx} style={localStyles.hashtagBadge}>
                              <Text style={localStyles.hashtagText}>
                                {tag.startsWith("#") ? tag : `#${tag}`}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  } else {
                    return (
                      <View key={fieldLabel} style={localStyles.secondaryFieldContainer}>
                        <View style={localStyles.secondaryFieldHeader}>
                          {fieldIcon}
                          <Text style={localStyles.secondaryFieldLabel}>{displayLabel}</Text>
                        </View>
                        <Text style={localStyles.secondaryFieldValue}>{fieldValue}</Text>
                      </View>
                    );
                  }
                })}

              {/* Strategic Alignment block */}
              {output.strategicAlignment && (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.borderSubtle,
                    paddingTop: 10,
                    marginTop: 6,
                    gap: 6,
                  }}
                >
                  {output.strategicAlignment.anchorsUsed &&
                    output.strategicAlignment.anchorsUsed.length > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                        <TargetIcon size={8} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={pdfStyles.cardLabel}>{labels.anchors}:</Text>
                          <Text style={[pdfStyles.cardValue, { fontSize: 8, color: colors.foregroundMuted }]}>
                            {output.strategicAlignment.anchorsUsed.join(", ")}
                          </Text>
                        </View>
                      </View>
                    )}

                  {output.strategicAlignment.triggersAddressed &&
                    output.strategicAlignment.triggersAddressed.length > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                        <SparklesIcon size={8} color={colors.warning.text} />
                        <View style={{ flex: 1 }}>
                          <Text style={pdfStyles.cardLabel}>{labels.triggers}:</Text>
                          <Text style={[pdfStyles.cardValue, { fontSize: 8, color: colors.foregroundMuted }]}>
                            {output.strategicAlignment.triggersAddressed.join(", ")}
                          </Text>
                        </View>
                      </View>
                    )}

                  {output.strategicAlignment.reasoning && (
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                      <HelpCircleIcon size={8} color={colors.foregroundSubtle} />
                      <View style={{ flex: 1 }}>
                        <Text style={pdfStyles.cardLabel}>{labels.reasoning}:</Text>
                        <Text
                          style={[
                            pdfStyles.cardValue,
                            {
                              fontSize: 8,
                              color: colors.foregroundMuted,
                              fontStyle: "italic",
                            },
                          ]}
                        >
                          {output.strategicAlignment.reasoning}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

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
