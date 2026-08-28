import { SelectOption } from "@/types/select";

export const mapTaskTemplateToForm = (
  template: any,
  masters: {
    phases: SelectOption[];
    categories: SelectOption[];
    zohoForms: SelectOption[];
    contentTypes: SelectOption[];
  }
) => {
  return {
    taskName: template.taskName?.name ?? "",
    // description: template.taskDescription?.name ?? "",

     description: template.description ?? "",
     phase:
      masters.phases.find(
        (p) => String(p.value) === String(template.phase?.id)
      ) ?? null,

    category:
      masters.categories.find(
        (c) => String(c.value) === String(template.categories?.id)
      ) ?? null,

    zohoForm:
      masters.zohoForms.find(
        (z) => String(z.value) === String(template.zohoForm?.id)
      ) ?? null,

    contentType:
      masters.contentTypes.find(
        (c) => String(c.value) === String(template.contentType?.id)
      ) ?? null,
  };
};
