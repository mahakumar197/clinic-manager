// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Text, TouchableOpacity } from 'react-native';
// import { SCREENS } from '../constant/index';

// // Screens
// import AdBookingScreen from '@screens/adBookingScreens/adBooking';
// import InvoicesScreen from '@screens/billsAndInvoicesScreens/invoiceList';
// import HomeScreen from '@screens/otherScreens/homeScreen';
// import GeneralSettings from '@screens/profileSettingsScreens/generalSettings';
// import ReportsAnalytics from '@screens/reportsAnalyticsScreens/reportsAnalytics';

// // others
// import { heightPercentageToDP, widthPercentageToDP } from '@utils/helpers';
// import { baseStyle, colors, sizes } from '../constant/theme';

// // Icons
// import AdBookingInactive from '@icons/booking.svg';
// import AdBookingActive from '@icons/bookingActive.svg';
// import HomeInActive from '@icons/home.svg';
// import HomeActive from '@icons/homeActive.svg';
// import InvoicesInactive from '@icons/invoice.svg';
// import InvoicesActive from '@icons/invoiceActive.svg';
// import ProfileInactive from '@icons/profile.svg';
// import ProfileActive from '@icons/profileActive.svg';
// import ReportsInactive from '@icons/reports.svg';
// import ReportsActive from '@icons/reportsActive.svg';

// export type BottomTabParamList = {
//   [SCREENS.HOME]: undefined;
//   [SCREENS.AD_BOOKING]: undefined;
//   [SCREENS.INVOICES]: undefined;
//   [SCREENS.REPORTS]: undefined;
//   [SCREENS.PROFILE]: undefined;
// };

// const Tab = createBottomTabNavigator<BottomTabParamList>();

// const createTabOptions = (
//   label: string,
//   ActiveIcon: React.FC<any>,
//   InactiveIcon: React.FC<any>,
// ) => ({
//   tabBarIcon: ({ focused }: { focused: boolean }) =>
//     focused ? (
//       <ActiveIcon
//         width={widthPercentageToDP('6%')}
//         height={widthPercentageToDP('6%')}
//       />
//     ) : (
//       <InactiveIcon
//         width={widthPercentageToDP('6%')}
//         height={widthPercentageToDP('6%')}
//       />
//     ),
//   tabBarLabel: ({ color }: { color: string }) => (
//     <Text
//       style={{
//         color,
//         fontSize: sizes.size01,
//         fontWeight: '500',
//       }}
//     >
//       {label}
//     </Text>
//   ),
//   // ⚡ make tab press feel instant (TouchableOpacity instead of ripple)
//   tabBarButton: (props: any) => (
//     <TouchableOpacity activeOpacity={0.7} {...props} />
//   ),
// });

// // tab configuration array
// const TAB_CONFIG = [
//   {
//     name: SCREENS.HOME,
//     component: HomeScreen,
//     label: 'Dashboard',
//     ActiveIcon: HomeActive,
//     InactiveIcon: HomeInActive,
//   },
//   {
//     name: SCREENS.AD_BOOKING,
//     component: AdBookingScreen,
//     label: 'Ad Booking',
//     ActiveIcon: AdBookingActive,
//     InactiveIcon: AdBookingInactive,
//   },
//   {
//     name: SCREENS.INVOICES,
//     component: InvoicesScreen,
//     label: 'Invoices',
//     ActiveIcon: InvoicesActive,
//     InactiveIcon: InvoicesInactive,
//   },
//   {
//     name: SCREENS.REPORTS,
//     component: ReportsAnalytics,
//     label: 'Reports',
//     ActiveIcon: ReportsActive,
//     InactiveIcon: ReportsInactive,
//   },
//   {
//     name: SCREENS.PROFILE,
//     component: GeneralSettings,
//     label: 'Profile',
//     ActiveIcon: ProfileActive,
//     InactiveIcon: ProfileInactive,
//   },
// ];

// const BottomTabNavigator = () => {
//   return (
//     <Tab.Navigator
//       initialRouteName={SCREENS.HOME}
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: true,
//         tabBarActiveTintColor: colors.primary,
//         tabBarInactiveTintColor: colors.gray_79,
//         lazy: true, 
//         tabBarStyle: {
//           height: heightPercentageToDP('11%'), 
//           paddingTop: heightPercentageToDP('1.5%'),
//           paddingBottom: heightPercentageToDP('2.5%'),
//           ...baseStyle.cardElevationStyle(),
//         },
//       }}
//     >
//       {TAB_CONFIG.map(({ name, component, label, ActiveIcon, InactiveIcon }) => (
//         <Tab.Screen
//           key={name}
//           name={name}
//           component={component}
//           options={createTabOptions(label, ActiveIcon, InactiveIcon)}
//         />
//       ))}
//     </Tab.Navigator>
//   );
// };

// export default BottomTabNavigator;
