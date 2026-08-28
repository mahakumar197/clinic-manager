import { useEffect, useState } from "react";
import {
  dropdownsService,
  DropdownApiItem,
} from "@/services/modules/dropdowns.service";
import { SelectOption } from "@/types/select";
import { DropdownType } from "@/services";
import { formatDropdownLabel } from "@/utils/helpers";

interface UseDropdownResult {
  options: SelectOption[];
  loading: boolean;
  error: string | null;
}

export const useDropdown = (
  type: DropdownType,
  includeAllOption = true
): UseDropdownResult => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDropdown = async () => {
      setLoading(true);
      setError(null);

      try {
        const data: DropdownApiItem[] = await dropdownsService.getDropdown(
          type
        );

        if (!isMounted) return;

        // const useEnValue =
        //   type === DropdownType.ZOHO_FORM || type === DropdownType.TASK_CONTENT;

        const mappedOptions: SelectOption[] = data.map((item) => ({
          label: formatDropdownLabel(item.beValue),
          value: item.id, // IMPORTANT: value stays string
        }));

        setOptions(
          includeAllOption
            ? [{ label: "All", value: "" }, ...mappedOptions]
            : mappedOptions
        );
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load dropdown");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDropdown();

    return () => {
      isMounted = false;
    };
  }, [type, includeAllOption]);

  return {
    options,
    loading,
    error,
  };
};
