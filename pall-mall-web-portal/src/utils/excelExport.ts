import * as XLSX from "xlsx";
import { format } from "date-fns";

/**
 * Maximum number of records allowed for export
 */
const MAX_EXPORT_RECORDS = 10000;

/**
 * Generic export data - can be any object
 */
export type ExportData = Record<string, any>;

/**
 * Column configuration for Excel export
 */
export interface ExcelColumnConfig {
  /** The key in the data object */
  key: string;
  /** The header label to display in Excel */
  label: string;
  /** Column width (characters) */
  width?: number;
}

/**
 * Configuration for Excel export
 */
export interface ExcelExportConfig {
  /** Array of column configurations defining order and mapping */
  columns: ExcelColumnConfig[];
  /** Filename without extension (will auto-add .xlsx and date) */
  fileNamePrefix: string;
  /** Optional: Sheet name (defaults to "Data") */
  sheetName?: string;
  /** Optional: Header background color (hex without #, defaults to E9A708) */
  headerBgColor?: string;
  /** Optional: Header text color (hex without #, defaults to FFFFFF) */
  headerTextColor?: string;
}

/**
 * Validates export data and checks for size limits
 * @param data - Array of data to export
 * @returns Error message if validation fails, null if valid
 */
export const validateExportData = (data: ExportData[]): string | null => {
  if (!data || data.length === 0) {
    return "No data available for export";
  }

  if (data.length > MAX_EXPORT_RECORDS) {
    return "Export is limited to 10,000 records. Please refine filters.";
  }

  return null;
};

/**
 * Maps API response data to Excel row format based on column configuration
 * @param data - API response data
 * @param columns - Column configuration
 * @returns Array of formatted Excel rows
 */
const mapDataToExcelFormat = (
  data: ExportData[],
  columns: ExcelColumnConfig[]
): Record<string, string | number>[] => {
  return data.map((item) => {
    const row: Record<string, string | number> = {};
    columns.forEach((col) => {
      row[col.label] = item[col.key] ?? "";
    });
    return row;
  });
};

/**
 * Generates a filename for the Excel export
 * @param prefix - Filename prefix (e.g., "tasks_export", "users_export")
 * @returns Formatted filename with current date
 */
const generateFileName = (prefix: string): string => {
  const date = format(new Date(), "yyyy-MM-dd");
  return `${prefix}_${date}.xlsx`;
};

/**
 * Generates and downloads an Excel file from data
 * @param data - Array of data to export
 * @param config - Export configuration
 * @throws Error if data validation fails
 */
export const generateExcelFile = (
  data: ExportData[],
  config: ExcelExportConfig
): void => {
  // Validate data
  const validationError = validateExportData(data);
  if (validationError) {
    throw new Error(validationError);
  }

  // Map data to Excel format
  const excelData = mapDataToExcelFormat(data, config.columns);

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths based on configuration
  const columnWidths = config.columns.map((col) => ({
    wch: col.width || 20, // Default width 20 if not specified
  }));
  worksheet["!cols"] = columnWidths;

  // Style the header row
  const headerCells = config.columns.map((_, index) => {
    const columnLetter = String.fromCharCode(65 + index); // A, B, C, etc.
    return `${columnLetter}1`;
  });

  const headerStyle = {
    fill: {
      fgColor: { rgb: config.headerBgColor || "E9A708" }, // Default golden
    },
    font: {
      color: { rgb: config.headerTextColor || "FFFFFF" }, // Default white
      bold: true,
      sz: 12,
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  };

  headerCells.forEach((cell) => {
    if (worksheet[cell]) {
      worksheet[cell].s = headerStyle;
    }
  });

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    config.sheetName || "Data"
  );

  // Generate and download file
  const fileName = generateFileName(config.fileNamePrefix);
  XLSX.writeFile(workbook, fileName, { cellStyles: true });
};

/**
 * Generic export handler function for React components
 * This function can be used for ANY module (tasks, users, approvals, etc.)
 * 
 * @param exportApiCall - Async function that calls the export API
 * @param config - Export configuration (columns, filename, etc.)
 * @param onStart - Callback when export starts (use to disable button, show loader)
 * @param onSuccess - Callback when export succeeds
 * @param onError - Callback when export fails
 * @param dataPath - Optional path to extract data from response (e.g., "data.tasks" for nested arrays)
 *                   If not provided, assumes response structure is { data: ExportData[] }
 */
export const handleExcelExport = async (
  exportApiCall: () => Promise<any>,
  config: ExcelExportConfig,
  onStart: () => void,
  onSuccess: () => void,
  onError: (message: string) => void,
  dataPath?: string
): Promise<void> => {
  try {
    // Notify UI that export is starting
    onStart();

    // Call the export API
    const response = await exportApiCall();

    // Extract data using the dataPath if provided
    let extractedData: ExportData[];
    
    if (dataPath) {
      // Navigate through nested object using the dataPath
      // e.g., "data.tasks" -> response.data.tasks
      const pathParts = dataPath.split('.');
      let current: any = response;
      
      for (const part of pathParts) {
        current = current?.[part];
      }
      
      extractedData = current;
    } else {
      // Default: assume data is at response.data
      extractedData = response.data;
    }

    // Validate that we got an array
    if (!Array.isArray(extractedData)) {
      throw new Error("Invalid data format: expected an array");
    }

    // Generate and download Excel file
    generateExcelFile(extractedData, config);

    // Notify UI that export succeeded
    onSuccess();
  } catch (error) {
    // Handle errors
    const errorMessage =
      error instanceof Error ? error.message : "Failed to export data";
    onError(errorMessage);
  }
};

/**
 * Configuration for a single sheet in multi-sheet export
 */
export interface ExcelSheetConfig {
  /** Sheet name (will appear as tab name) */
  sheetName: string;
  /** Column configuration for this sheet */
  columns: ExcelColumnConfig[];
  /** Data for this sheet */
  data: ExportData[];
  /** Optional: Header background color (defaults to main config) */
  headerBgColor?: string;
  /** Optional: Header text color (defaults to main config) */
  headerTextColor?: string;
}

/**
 * Configuration for multi-sheet Excel export
 */
export interface MultiSheetExcelConfig {
  /** Array of sheet configurations */
  sheets: ExcelSheetConfig[];
  /** Filename without extension (will auto-add .xlsx and date) */
  fileNamePrefix: string;
  /** Optional: Default header background color (hex without #, defaults to E9A708) */
  defaultHeaderBgColor?: string;
  /** Optional: Default header text color (hex without #, defaults to FFFFFF) */
  defaultHeaderTextColor?: string;
}

/**
 * Generates and downloads a multi-sheet Excel file
 * @param config - Multi-sheet export configuration
 * @throws Error if validation fails
 */
export const generateMultiSheetExcelFile = (
  config: MultiSheetExcelConfig
): void => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Process each sheet
  config.sheets.forEach((sheetConfig) => {
    // Skip if no data
    if (!sheetConfig.data || sheetConfig.data.length === 0) {
      console.warn(`Sheet "${sheetConfig.sheetName}" has no data, skipping...`);
      return;
    }

    // Map data to Excel format
    const excelData = mapDataToExcelFormat(sheetConfig.data, sheetConfig.columns);

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths based on configuration
    const columnWidths = sheetConfig.columns.map((col) => ({
      wch: col.width || 20, // Default width 20 if not specified
    }));
    worksheet["!cols"] = columnWidths;

    // Style the header row
    const headerCells = sheetConfig.columns.map((_, index) => {
      const columnLetter = String.fromCharCode(65 + index); // A, B, C, etc.
      return `${columnLetter}1`;
    });

    const headerBgColor = sheetConfig.headerBgColor || config.defaultHeaderBgColor || "E9A708";
    const headerTextColor = sheetConfig.headerTextColor || config.defaultHeaderTextColor || "FFFFFF";

    const headerStyle = {
      fill: {
        fgColor: { rgb: headerBgColor },
      },
      font: {
        color: { rgb: headerTextColor },
        bold: true,
        sz: 12,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };

    headerCells.forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = headerStyle;
      }
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetConfig.sheetName);
  });

  // Generate and download file
  const fileName = generateFileName(config.fileNamePrefix);
  XLSX.writeFile(workbook, fileName, { cellStyles: true });
};

/**
 * Generic multi-sheet export handler function
 * Use this when you need to export multiple datasets into separate Excel tabs
 * 
 * @param exportApiCall - Async function that calls the export API and returns MultiSheetExcelConfig
 * @param onStart - Callback when export starts
 * @param onSuccess - Callback when export succeeds
 * @param onError - Callback when export fails
 */
export const handleMultiSheetExcelExport = async (
  exportApiCall: () => Promise<MultiSheetExcelConfig>,
  onStart: () => void,
  onSuccess: () => void,
  onError: (message: string) => void
): Promise<void> => {
  try {
    // Notify UI that export is starting
    onStart();

    // Call the export API and get the config
    const config = await exportApiCall();

    // Generate and download multi-sheet Excel file
    generateMultiSheetExcelFile(config);

    // Notify UI that export succeeded
    onSuccess();
  } catch (error) {
    // Handle errors
    const errorMessage =
      error instanceof Error ? error.message : "Failed to export data";
    onError(errorMessage);
  }
};

// ==========================================
// BACKWARD COMPATIBILITY (Task-specific)
// Remove these after refactoring all usages
// ==========================================

/**
 * @deprecated Use handleExcelExport with custom config instead
 * Task-specific export handler (kept for backward compatibility)
 */
// export interface TaskExportData {
//   task_id: string;
//   patient_name: string;
//   procedure_type: string;
//   phase: string;
//   task_name: string;
//   status: string;
//   due_date: string;
//   assigned_to: string;
// }

// /**
//  * @deprecated Use handleExcelExport instead
//  */
// export const handleTaskExport = async (
//   exportApiCall: () => Promise<{ data: TaskExportData[] }>,
//   onStart: () => void,
//   onSuccess: () => void,
//   onError: (message: string) => void
// ): Promise<void> => {
//   const config: ExcelExportConfig = {
//     columns: [
//       { key: "patient_name", label: "Patient Name", width: 20 },
//       { key: "procedure_type", label: "Procedure Type", width: 20 },
//       { key: "phase", label: "Phase", width: 15 },
//       { key: "task_name", label: "Task Name", width: 25 },
//       { key: "status", label: "Status", width: 15 },
//       { key: "due_date", label: "Due Date", width: 15 },
//       { key: "assigned_to", label: "Assigned To", width: 20 },
//     ],
//     fileNamePrefix: "tasks_export",
//     sheetName: "Tasks",
//   };

//   await handleExcelExport(exportApiCall, config, onStart, onSuccess, onError);
// };
