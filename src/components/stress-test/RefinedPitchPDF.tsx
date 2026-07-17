import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles, colors, IntelAgentLogo } from "@/lib/pdf/styles";

interface RefinedPitchPDFProps {
  personaName: string;
  goal: string;
  refinedPitch: string;
  date: string;
  labels: {
    title: string;
    persona: string;
    goal: string;
    refinedPitch: string;
    footerText: string;
    pageOf: string;
  };
}

export function RefinedPitchPDF({
  personaName,
  goal,
  refinedPitch,
  date,
  labels,
}: RefinedPitchPDFProps) {
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

        {/* Metadata Block */}
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
        </View>

        {/* Refined Pitch Text Container */}
        <Text style={pdfStyles.sectionTitle}>{labels.refinedPitch}</Text>
        <View
          style={[
            pdfStyles.card,
            {
              backgroundColor: colors.white,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              borderRadius: 12,
              marginTop: 10,
              lineHeight: 1.6,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: "Helvetica",
              fontSize: 10,
              color: colors.foreground,
              whiteSpace: "pre-wrap",
            }}
          >
            {refinedPitch}
          </Text>
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
    </Document>
  );
}
