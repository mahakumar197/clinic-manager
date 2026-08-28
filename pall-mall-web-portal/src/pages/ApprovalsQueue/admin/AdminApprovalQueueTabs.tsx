import { CommonPageHeader } from "@/components/common";
import { CommonTabs } from "@/components/common/CommonTabs";
import PageContainer from "@/components/layouts/PageContainer";
import AdminApprovals from "./formsQueue/AdminApproval";
import AdminUploads from "./uploadsQueue";

const AdminApprovalQueueTabs = () => {
  return (
    <PageContainer>
      <CommonTabs
        header={
          <CommonPageHeader title="Approvals" subtitle="Approvals Queue" />
        }
        hideBorder={true}
        tabs={[
          {
            label: "Forms",
            icon: "FileText",
            content: <AdminApprovals />,
          },
          {
            label: "Uploads",
            icon: "Upload",
            content: <AdminUploads />,
          },
        ]}
        variant="standard"
      />
    </PageContainer>
  );
};

export default AdminApprovalQueueTabs;
