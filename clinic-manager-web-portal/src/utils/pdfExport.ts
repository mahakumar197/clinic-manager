import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { commonPallMall } from "@/assets";

/**
 * Generic export data - can be any object
 * (Using same type as excelExport for consistency)
 */
type ExportData = Record<string, any>;

/**
 * Column configuration for PDF table
 */
export interface PDFColumnConfig {
  /** The key in the data object */
  key: string;
  /** The header label to display in PDF */
  label: string;
  /** Optional: Custom formatter function */
  formatter?: (value: any) => string;
}

/**
 * Configuration for a single table/section in PDF
 */
export interface PDFTableConfig {
  /** Section title */
  title: string;
  /** Column configuration for this table */
  columns: PDFColumnConfig[];
  /** Data for this table */
  data: ExportData[];
  /** Optional: Show header on every page for multi-page tables */
  showHeadEveryPage?: boolean;
}

/**
 * Configuration for PDF report generation
 */
export interface PDFReportConfig {
  /** Report title (appears in header) */
  reportTitle: string;
  /** Array of table configurations */
  tables: PDFTableConfig[];
  /** Filename without extension (will auto-add .pdf and date) */
  fileNamePrefix: string;
  /** Optional: Filters applied to the report */
  filters?: {
    filter?: string;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Maps data to table rows based on column configuration
 */
const mapDataToTableRows = (
  data: ExportData[],
  columns: PDFColumnConfig[]
): (string | number)[][] => {
  return data.map((item) => {
    return columns.map((col) => {
      const value = item[col.key];
      if (col.formatter) {
        return col.formatter(value);
      }
      return value ?? "";
    });
  });
};

/**
 * Generates a filename for the PDF export
 */
const generateFileName = (prefix: string): string => {
  const date = format(new Date(), "yyyy-MM-dd");
  return `${prefix}_${date}.pdf`;
};

/**
 * Generic PDF report generator
 * Creates a professional PDF report with multiple tables/sections
 * 
 * @param config - PDF report configuration
 * @returns jsPDF instance
 */
export const generatePDFReport = (config: PDFReportConfig): jsPDF => {
  // Initialize PDF in portrait mode, A4 size
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // ===========================
  // HEADER SECTION - Logo on right, Title/Date on left
  // ===========================
  
  // Add logo on the right side
  const logoWidth = 15;
  const logoHeight = 15;
  const logoX = pageWidth - margin - logoWidth;
  const logoY = yPosition;
  
  try {
    doc.addImage(commonPallMall, "PNG", logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.warn("Could not add logo to PDF:", error);
  }

  // Title on the left
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(config.reportTitle, margin, yPosition + 7);
  yPosition += 15;

  // Generated date and time on the left
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const generatedDate = format(new Date(), "PPpp");
  doc.text(`Generated: ${generatedDate}`, margin, yPosition);
  yPosition += 6;

  // Applied filters (if any)
  if (config.filters && (config.filters.filter || (config.filters.startDate && config.filters.endDate))) {
    const filterText: string[] = [];
    
    if (config.filters.filter) {
      filterText.push(`Filter: ${config.filters.filter}`);
    }
    
    if (config.filters.startDate && config.filters.endDate) {
      filterText.push(`Period: ${config.filters.startDate} to ${config.filters.endDate}`);
    }
    
    doc.setFont("helvetica", "italic");
    // doc.text(filterText.join(" | "), margin, yPosition);
    // yPosition += 8;
  }

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // ===========================
  // TABLES/SECTIONS
  // ===========================
  
  config.tables.forEach((tableConfig, index) => {
    // Check if we need a new page before this table
    if (yPosition > pageHeight - 60 && index > 0) {
      doc.addPage();
      yPosition = margin;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(tableConfig.title, margin, yPosition);
    yPosition += 5;

    // Prepare table data
    const headers = tableConfig.columns.map(col => col.label);
    const rows = mapDataToTableRows(tableConfig.data, tableConfig.columns);

    // Generate table
    autoTable(doc, {
      startY: yPosition,
      head: [headers],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [233, 167, 8], // Golden
        textColor: [255, 255, 255], // White
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: margin, right: margin },
      showHead: tableConfig.showHeadEveryPage ? "everyPage" : "firstPage",
    });

    // @ts-ignore - autoTable adds finalY to doc
    yPosition = doc.lastAutoTable.finalY + 10;
  });

  // ===========================
  // FOOTER: PAGE NUMBERS
  // ===========================
  
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    
    const footerText = `Page ${i} of ${totalPages}`;
    const textWidth = doc.getTextWidth(footerText);
    const xPosition = (pageWidth - textWidth) / 2;
    
    doc.text(footerText, xPosition, pageHeight - 10);
  }

  return doc;
};

/**
 * Generic PDF export handler function
 * Use this for ANY module that needs PDF export
 * 
 * @param exportApiCall - Async function that returns PDFReportConfig
 * @param onStart - Callback when export starts
 * @param onSuccess - Callback when export succeeds
 * @param onError - Callback when export fails
 */
export const handlePDFExport = async (
  exportApiCall: () => Promise<PDFReportConfig>,
  onStart: () => void,
  onSuccess: () => void,
  onError: (message: string) => void
): Promise<void> => {
  try {
    // Notify UI that export is starting
    onStart();

    // Call the export API and get the config
    const config = await exportApiCall();

    // Validate that we have tables
    if (!config.tables || config.tables.length === 0) {
      throw new Error("No data available for export");
    }

    // Generate PDF
    const pdf = generatePDFReport(config);

    // Generate filename and save
    const fileName = generateFileName(config.fileNamePrefix);
    pdf.save(fileName);

    // Notify UI that export succeeded
    onSuccess();
  } catch (error) {
    // Handle errors
    const errorMessage =
      error instanceof Error ? error.message : "Failed to export PDF";
    onError(errorMessage);
  }
};
