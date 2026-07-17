import { pdf } from "@react-pdf/renderer";
import React from "react";

/**
 * Renders a react-pdf document component to a Blob entirely in the browser
 * and triggers a programmatic download.
 *
 * @param documentComponent React element representing the react-pdf Document
 * @param fileName Target download file name (including extension)
 */
export async function downloadPDF(
  documentComponent: React.ReactElement,
  fileName: string
): Promise<void> {
  try {
    // Generate the PDF blob on-demand in the client
    const blob = await pdf(documentComponent).toBlob();
    
    // Create local object URL for download
    const url = URL.createObjectURL(blob);
    
    // Programmatically trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating or downloading PDF client-side:", error);
    throw error;
  }
}
