import { CommonPageHeader } from "@/components/common";
import { CommonTabs } from "@/components/common/CommonTabs";
import PageContainer from "@/components/layouts/PageContainer";
import ApprovalsList from "./formsQueue/ApprovalsList";
import UserUploads from "./uploadsQueue";

const UserApprovalQueueTabs = () => {
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
            content: <ApprovalsList />,
          },
          {
            label: "Uploads",
            icon: "Upload",
            content: <UserUploads />,
          },
        ]}
        variant="standard"
      />
    </PageContainer>
  );
};

export default UserApprovalQueueTabs;
