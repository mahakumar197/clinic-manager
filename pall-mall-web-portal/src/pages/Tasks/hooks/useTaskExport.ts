import { useState } from "react";
import { handleExcelExport, ExcelExportConfig } from "@/utils";
import { tasksService } from "@/services/modules/tasks.service";
import { toast } from "@/utils/toast";

/**
 * Task filters for export
 */
interface TaskExportFilters {
  search?: string;
  procedureType?: string;
  phases?: string;
  status?: string;
  dueDate?: string;
}

/**
 * Custom hook for exporting tasks to Excel
 * Encapsulates all task export logic and configuration
 *
 * @returns Object with export function and loading state
 */
export const useTaskExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Task export configuration
   * Defines columns, widths, colors, and filename
   */
  const exportConfig: ExcelExportConfig = {
    columns: [
      { key: "patientName", label: "Patient Name", width: 20 },
      { key: "procedureType", label: "Procedure Type", width: 20 },
      { key: "phase", label: "Phase", width: 15 },
      { key: "task_name", label: "Task Name", width: 25 },
      { key: "status", label: "Status", width: 15 },
      { key: "due_date", label: "Due Date", width: 15 },
      { key: "assigneeName", label: "Assigned To", width: 20 },
    ],
    fileNamePrefix: "tasks_export",
    sheetName: "Tasks",
    headerBgColor: "#E9A708", // Golden
    headerTextColor: "#FFFFFF", // White
  };

  /**
   * Export tasks with current filters
   * @param filters - Current filter values from the UI
   */
  const exportTasks = async (filters: TaskExportFilters = {}) => {
    await handleExcelExport(
      // API call function
      async () => {
        try {
          // Build the export payload with filters and sort
          const payload = {
            search: filters.search || "",
            status: filters.status || "",
            phases: filters.phases || "",
            procedureType: filters.procedureType || "",
            dueDate: filters.dueDate || "",
          };

          return await tasksService.exportTasks(payload);
        } catch (error) {
          toast.error("Failed to export tasks");
          throw error;
        }
      },
      // Export configuration
      exportConfig,
      // On start callback
      () => {
        setIsExporting(true);
      },
      // On success callback
      () => {
        setIsExporting(false);
        toast.success("Tasks exported successfully");
      },
      // On error callback
      (errorMessage) => {
        setIsExporting(false);
        toast.error(errorMessage);
      },
      // Data path for nested array (tasks are in response.data.tasks)
      "data.tasks",
    );
  };

  return {
    exportTasks,
    isExporting,
  };
};
