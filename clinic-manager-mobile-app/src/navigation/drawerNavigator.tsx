// import { createDrawerNavigator } from '@react-navigation/drawer';

// import ClientDetails from '@screens/clientScreens/clientDetails';
// import ClientManagement from '@screens/clientScreens/clientManagement';
// import SubmitQuery from '@screens/helpAndSupportScreens/submitQuery';
// import SupportAndFB from '@screens/helpAndSupportScreens/supportAndFB';

// import InvoiceDetails from '@screens/billsAndInvoicesScreens/invoiceDetails';
// import InvoicesScreen from '@screens/billsAndInvoicesScreens/invoiceList';
// import BookingDetails from '@screens/bookingHistoryScreens/bookingDetails';
// import BookingScreen from '@screens/bookingHistoryScreens/bookingList';
// import CancelBooking from '@screens/bookingHistoryScreens/cancelBooking';
// import AddNewClient from '@screens/clientScreens/addNewClient';
// import ClientManagementScreen from '@screens/clientScreens/clientManagement';
// import FAQScreen from '@screens/otherScreens/faqScreen';
// import NotificationScreen from '@screens/otherScreens/notificationScreen';
// import AddressAndBilling from '@screens/profileSettingsScreens/addressAndBilling';
// import ChangePassword from '@screens/profileSettingsScreens/changePassword';
// import ProfileScreen from '@screens/profileSettingsScreens/profile';

// import { widthPercentageToDP } from '@utils/helpers';

// import TrackBooking from '@screens/bookingHistoryScreens/trackBooking';
// import ChatBot from '@screens/chatbotScreens/chatBot';
// import ChatBotHome from '@screens/chatbotScreens/ChatBotHome';
// import ScheduleReport from '@screens/reportsAnalyticsScreens/scheduleReport';
// import ViewReports from '@screens/reportsAnalyticsScreens/viewReports';
// import BottomTabNavigator from './bottomTabNavigator';
// import CustomDrawerContent from './customDrawerContent';

// export const SCREENS = {
//   SUPPORT_FB: 'SupportAndFB',
//   SUBMIT_QUERY: 'SubmitQuery',
//   CLIENT_DETAILS: 'ClientDetails',
//   INVOICE_DETAILS: 'InvoiceDetails',
//   BOOKING_DETAILS: 'BookingDetails',
//   NEW_CLIENT: 'AddNewClient',
//   CANCEL_BOOKING: 'CancelBooking',
//   TRACK_BOOKING: 'TrackBooking',
//   CLIENT_MGMT: 'ClientManagementScreen',
//   NOTIFICATION: 'NotificationScreen',
//   FAQ: 'FAQScreen',
//   BOOKING_HISTORY: 'BookingScreen',
//   CHANGE_PASSWORD: 'ChangePassword',
//   PROFILE_SCREEN: 'ProfileScreen',
//   INVOICES: 'Invoices',
//   ADDRESS_BILLING: 'AddressAndBilling',
//   VIEW_REPORTS: 'ViewReports',
//   SCHEDULE_REPORT: 'ScheduleReport',
//   CHAT_BOT: 'ChatBot',
//   CHAT_BOT_HOME: 'ChatBotHome',
// } as const;

// export type DrawerParamList = {
//   Tabs: undefined;
//   ClientManagement: undefined;
//   TrackBooking: undefined;
//   BookingHistory: undefined;
//   Profile: undefined;
//   Billing: undefined;
//   ChangePassword: undefined;
//   SupportAndFB: undefined;
//   SubmitQuery: undefined;
//   Faq: undefined;
//   ClientDetails: undefined;
//   AddNewClient: undefined;
//   ClientManagementScreen: undefined;
//   NotificationScreen: undefined;
//   InvoiceDetails: undefined;
//   BookingDetails: undefined;
//   FAQScreen: undefined;
//   BookingScreen: undefined;
//   CancelBooking: undefined;
//   ProfileScreen: undefined;
//   Invoices: undefined;
//   AddressAndBilling: undefined;
//   ViewReports: undefined;
//   ScheduleReport: undefined;
//   ChatBot: undefined;
//   ChatBotHome: undefined;
// };

// const Drawer = createDrawerNavigator<DrawerParamList>();

// const DrawerNavigator = () => {
//   return (
//     <Drawer.Navigator
//       initialRouteName="Tabs"
//       screenOptions={{
//         headerShown: false,
//         headerLeft: () => null,
//         drawerStyle: {
//           width: widthPercentageToDP('75%'),
//         },
//       }}
//       drawerContent={props => <CustomDrawerContent {...props} />}>
//       <Drawer.Screen name="Tabs" component={BottomTabNavigator} />
//       <Drawer.Screen name="ClientManagement" component={ClientManagement} />
//       <Drawer.Screen name="BookingHistory" component={SupportAndFB} />
//       <Drawer.Screen name="Billing" component={SupportAndFB} />
//       <Drawer.Screen name={SCREENS.SUPPORT_FB} component={SupportAndFB} />
//       <Drawer.Screen name={SCREENS.BOOKING_HISTORY} component={BookingScreen} />
//       <Drawer.Screen name={SCREENS.SUBMIT_QUERY} component={SubmitQuery} />
//       <Drawer.Screen name="Faq" component={SupportAndFB} />
//       <Drawer.Screen name={SCREENS.CLIENT_DETAILS} component={ClientDetails} />
//       <Drawer.Screen name={SCREENS.NEW_CLIENT} component={AddNewClient} />
//       <Drawer.Screen name={SCREENS.PROFILE_SCREEN} component={ProfileScreen} />
//       <Drawer.Screen
//         name={SCREENS.INVOICE_DETAILS}
//         component={InvoiceDetails}
//       />
//       <Drawer.Screen
//         name={SCREENS.BOOKING_DETAILS}
//         component={BookingDetails}
//       />
//       <Drawer.Screen name={SCREENS.CANCEL_BOOKING} component={CancelBooking} />
//       <Drawer.Screen name={SCREENS.TRACK_BOOKING} component={TrackBooking} />

//       <Drawer.Screen name={SCREENS.FAQ} component={FAQScreen} />
//       <Drawer.Screen
//         name={SCREENS.NOTIFICATION}
//         component={NotificationScreen}
//       />
//       <Drawer.Screen
//         name={SCREENS.CLIENT_MGMT}
//         component={ClientManagementScreen}
//       />
//       <Drawer.Screen
//         name={SCREENS.CHANGE_PASSWORD}
//         component={ChangePassword}
//       />
//       <Drawer.Screen name={SCREENS.INVOICES} component={InvoicesScreen} />
//       <Drawer.Screen
//         name={SCREENS.ADDRESS_BILLING}
//         component={AddressAndBilling}
//       />
//       <Drawer.Screen name={SCREENS.VIEW_REPORTS} component={ViewReports} />
//       <Drawer.Screen
//         name={SCREENS.SCHEDULE_REPORT}
//         component={ScheduleReport}
//       />
//       <Drawer.Screen name={SCREENS.CHAT_BOT} component={ChatBot} />
//       <Drawer.Screen name={SCREENS.CHAT_BOT_HOME} component={ChatBotHome} />
//     </Drawer.Navigator>
//   );
// };

// export default DrawerNavigator;
