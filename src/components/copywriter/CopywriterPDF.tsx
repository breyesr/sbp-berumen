import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles, colors, IntelAgentLogo } from "@/lib/pdf/styles";
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

export function CopywriterPDF({
  personaName,
  goal,
  context,
  message,
  outputs,
  date,
  labels,
}: CopywriterPDFProps) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header (Logo + Brand Title) */}
        <View style={pdfStyles.headerContainer} fixed>
          <View style={pdfStyles.logoSection}>
            <IntelAgentLogo width={18} height={18} />
            <Text style={pdfStyles.logoText}>IntelAgent</Text>
          </View>
          <Text style={pdfStyles.dateText}>{date}</Text>
        </View>

        {/* Title */}
        <Text style={pdfStyles.title}>{labels.title}</Text>
        <Text style={pdfStyles.subtitle}>{personaName}</Text>

        {/* Strategic Context Metadata Block */}
        <View style={pdfStyles.metadataContainer}>
          <View style={pdfStyles.metadataRow}>
            <Text style={pdfStyles.metadataLabel}>{labels.persona}:</Text>
            <Text style={pdfStyles.metadataValue}>{personaName}</Text>
          </View>
          {goal ? (
            <View style={pdfStyles.metadataRow}>
              <Text style={pdfStyles.metadataLabel}>{labels.goal}:</Text>
              <Text style={pdfStyles.metadataValue}>{goal}</Text>
            </View>
          ) : null}
          {context ? (
            <View style={pdfStyles.metadataRow}>
              <Text style={pdfStyles.metadataLabel}>{labels.context}:</Text>
              <Text style={pdfStyles.metadataValue}>{context}</Text>
            </View>
          ) : null}
          {message ? (
            <View style={pdfStyles.metadataRow}>
              <Text style={pdfStyles.metadataLabel}>{labels.message}:</Text>
              <Text style={pdfStyles.metadataValue}>{message}</Text>
            </View>
          ) : null}
        </View>

        {/* Platform Outputs list */}
        <Text style={pdfStyles.sectionTitle}>
          {labels.platform} &amp; {labels.format}
        </Text>

        {outputs.map((output, idx) => {
          if (!output) return null;
          return (
            <View
              key={idx}
              style={[pdfStyles.card, { marginTop: 10 }]}
              wrap={false} // Avoid page breaks inside individual copy blocks
            >
              <Text style={pdfStyles.cardTitle}>
                {output.platformName || "Platform"} / {output.formatName || "Format"}
              </Text>

              {/* Dynamic generated fields */}
              {output.fields &&
                Object.entries(output.fields).map(([fieldLabel, fieldValue]) => {
                  if (!fieldValue) return null;
                  const displayLabel = fieldLabel
                    .replace(/_/g, " ")
                    .toUpperCase();

                  return (
                    <View key={fieldLabel} style={{ marginBottom: 6 }}>
                      <Text style={[pdfStyles.cardLabel, { width: "auto" }]}>{displayLabel}:</Text>
                      <Text style={[pdfStyles.cardValue, { fontSize: 8.5 }]}>
                        {fieldValue}
                      </Text>
                    </View>
                  );
                })}

              {/* Strategic Alignment, if exists */}
              {output.strategicAlignment && (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.borderSubtle,
                    paddingTop: 8,
                    marginTop: 4,
                  }}
                >
                  {output.strategicAlignment.anchorsUsed &&
                    output.strategicAlignment.anchorsUsed.length > 0 && (
                      <View style={{ marginBottom: 4 }}>
                        <Text style={pdfStyles.cardLabel}>
                          {labels.anchors}:
                        </Text>
                        <Text style={{ color: colors.foregroundMuted }}>
                          {output.strategicAlignment.anchorsUsed.join(", ")}
                        </Text>
                      </View>
                    )}

                  {output.strategicAlignment.triggersAddressed &&
                    output.strategicAlignment.triggersAddressed.length > 0 && (
                      <View style={{ marginBottom: 4 }}>
                        <Text style={pdfStyles.cardLabel}>
                          {labels.triggers}:
                        </Text>
                        <Text style={{ color: colors.foregroundMuted }}>
                          {output.strategicAlignment.triggersAddressed.join(", ")}
                        </Text>
                      </View>
                    )}

                  {output.strategicAlignment.reasoning && (
                    <View>
                      <Text style={pdfStyles.cardLabel}>
                        {labels.reasoning}:
                      </Text>
                      <Text
                        style={{
                          color: colors.foregroundMuted,
                          fontStyle: "italic",
                        }}
                      >
                        {output.strategicAlignment.reasoning}
                      </Text>
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
