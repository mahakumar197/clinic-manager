import { useEffect, useState } from "react";
import {
  taskTemplatesService,
  TaskTemplate,
} from "@/services/modules/taskTemplates.service";

export const useTaskTemplates = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await taskTemplatesService.getTemplates();
        setTemplates(data);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, loading };
};
