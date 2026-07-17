import { CopyOutput } from "@/components/copywriter/types";

interface CSVLabels {
  persona: string;
  date: string;
  platform: string;
  format: string;
  cta: string;
  hashtags: string;
}

/**
 * Escapes a cell value according to RFC 4180 standards.
 */
function escapeCSVCell(value: string | undefined | null): string {
  if (value === undefined || value === null) return "";
  let str = String(value);
  // Wrap in double quotes if it contains a comma, newline, carriage return, or double quote
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

/**
 * Capitalizes and formats field keys for headers (e.g. "spoken_script" -> "Spoken Script")
 */
function formatFieldHeader(key: string): string {
  return key
    .split(/[_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Generates an RFC 4180-compliant CSV from Copywriter outputs on the client
 * and triggers a programmatic download with a UTF-8 BOM header.
 */
export function downloadCSV(
  outputs: CopyOutput[],
  personaName: string,
  dateStr: string,
  fileName: string,
  labels: CSVLabels
): void {
  try {
    // 1. Identify all dynamic field keys across all outputs
    const allFieldKeys = new Set<string>();
    outputs.forEach(output => {
      if (output.fields) {
        Object.keys(output.fields).forEach(key => {
          const lowerKey = key.toLowerCase();
          // Filter out fields that will go into the dedicated CTA/Hashtags columns
          const isCTA = lowerKey.includes("cta") || lowerKey.includes("call_to_action") || lowerKey.includes("calltoaction");
          const isHashtag = lowerKey.includes("hashtag") || lowerKey.includes("tag");
          if (!isCTA && !isHashtag) {
            allFieldKeys.add(key);
          }
        });
      }
    });

    const dynamicFieldKeys = Array.from(allFieldKeys).sort();

    // 2. Build CSV Headers
    const headers = [
      labels.persona,
      labels.date,
      labels.platform,
      labels.format,
      ...dynamicFieldKeys.map(formatFieldHeader),
      labels.cta,
      labels.hashtags
    ];

    const csvRows = [headers.map(escapeCSVCell).join(",")];

    // 3. Populate Rows
    outputs.forEach(output => {
      if (!output) return;

      // Extract CTA and Hashtags from dynamic fields
      let ctaVal = "";
      let hashtagVal = "";
      const dynamicFieldVals: Record<string, string> = {};

      if (output.fields) {
        Object.entries(output.fields).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase();
          const isCTA = lowerKey.includes("cta") || lowerKey.includes("call_to_action") || lowerKey.includes("calltoaction");
          const isHashtag = lowerKey.includes("hashtag") || lowerKey.includes("tag");

          if (isCTA) {
            ctaVal = value;
          } else if (isHashtag) {
            hashtagVal = value;
          } else {
            dynamicFieldVals[key] = value;
          }
        });
      }

      // Format row
      const row = [
        personaName,
        dateStr,
        output.platformName || "",
        output.formatName || "",
        ...dynamicFieldKeys.map(key => dynamicFieldVals[key] || ""),
        ctaVal,
        hashtagVal
      ];

      csvRows.push(row.map(escapeCSVCell).join(","));
    });

    // 4. Create CSV Content with UTF-8 BOM
    const csvContent = csvRows.join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

    // 5. Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating or downloading CSV client-side:", error);
    throw error;
  }
}
