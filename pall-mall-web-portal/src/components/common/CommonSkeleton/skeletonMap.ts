/*--------------------base----------------*/  

import AvatarSkeleton from "./base/AvatarSkeleton";
import TextSkeleton from "./base/TextSkeleton";
import ImageSkeleton from "./base/ImageSkeleton";
import ListSkeleton from "./base/ListSkeleton";
import TableSkeleton from "./base/TableSkeleton";
import AvatarTextSkeleton from "./base/AvatarTextSkeleton";
import ContentImageSkeleton from "./base/ContentImageSkeleton";

/*--------------------cards----------------*/ 

import CardSkeleton from "./cards/CardSkeleton";
import StatusCardSkeleton from "./cards/StatusCardSkeleton";
import NotificationCardSkeleton from "./cards/NotificationCardSkeleton";
import MessageCardSkeleton from "./cards/MessageCardSkeleton";
import EscalationCardSkeleton from "./cards/EscalationCardSkeleton";
import DoctorNotificationSkeleton from "./cards/DoctorNotificationSkeleton";

/*--------------------charts----------------*/ 

import BarChartSkeleton from "./charts/BarChartSkeleton";
import LineChartSkeleton from "./charts/LineChartSkeleton";
import PieChartSkeleton from "./charts/PieChartSkeleton";
import ProgressSkeleton from "./charts/ProgressSkeleton";

/*--------------------pages----------------*/ 
import EditUserSkeleton from "./pages/EditUserSkeleton";
import TaskDetailsSkeleton from "./pages/TaskDetailsSkeleton";
import PatientModalSkeleton from "./pages/PatientModalSkeleton";
import ApprovalDetailsSkeleton from "./pages/ApprovalsDetailsSkeleton";
import ContentViewSkeleton from "./pages/ContentViewSkeleton";
import MessageViewSkeleton from "./pages/MessageViewSkeleton";
import ContentImageLibrary from "./pages/ContentImageLibrarySkeleton";
import EditEscalationRuleSkeleton from "./pages/EditEscalationRuleSkeleton";
import EditNotificationRuleSkeleton from "./pages/EditNotificationRuleSkeleton";

/*--------------------lists----------------*/ 

import PatientListSkeleton from "./lists/PatientListSkeleton";
import ApprovalListSkeleton from "./lists/ApprovalsSkeleton";

import { SkeletonType } from "./types";

export const skeletonMap: Record<SkeletonType, React.FC<any>> = {

 /*------ --------------base----------------*/ 

  avatar: AvatarSkeleton,
  text: TextSkeleton,
  image: ImageSkeleton,
  list: ListSkeleton,
  table: TableSkeleton,
  avatarText: AvatarTextSkeleton,
  contentImage: ContentImageSkeleton,
  contentImageLibrary: ContentImageLibrary,

/*--------------------cards----------------*/ 

  card: CardSkeleton,
  statusCard: StatusCardSkeleton,
  notificationCard: NotificationCardSkeleton,
  messageCard: MessageCardSkeleton,
  escalationCard: EscalationCardSkeleton,
  doctorNotification: DoctorNotificationSkeleton,

/*--------------------charts----------------*/ 

  chart: BarChartSkeleton,
  lineChart: LineChartSkeleton,
  pieChart: PieChartSkeleton,
  progress: ProgressSkeleton,


/*--------------------pages----------------*/ 

  editUserPage: EditUserSkeleton,
  taskDetailsPage: TaskDetailsSkeleton,
  patientModal: PatientModalSkeleton,
  approvalDetails: ApprovalDetailsSkeleton,
  contentViewModal: ContentViewSkeleton,
  messageView: MessageViewSkeleton,
  editEscalation: EditEscalationRuleSkeleton,
  editNotification : EditNotificationRuleSkeleton,

/*--------------------lists----------------*/ 

  patientList: PatientListSkeleton,
  approvalList: ApprovalListSkeleton,
};
