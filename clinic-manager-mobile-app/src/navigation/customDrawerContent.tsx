// import {Text, TouchableOpacity, View} from 'react-native';

// import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
// import Icon from 'react-native-vector-icons/Feather';

// // components
// import Spacer from '@components/spacer';

// // redux
// import {logout} from '@redux/slice/authSlice';
// import {AppDispatch, persistor} from '@redux/store';
// import {useDispatch} from 'react-redux';

// // logo
// import Logo from '@images/logo-black.svg';
// import Chat from '@images/chatBot.svg';

// // others
// import {heightPercentageToDP} from '@utils/helpers';
// import {SCREENS} from '../constant';
// import navigationService from './navigationService';
// import {styles} from './styles';

// const menuItems = [
//   {label: 'Client Management', icon: 'users', route: SCREENS.CLIENT_MGMT},
//   {label: 'Booking History', icon: 'file-text', route: SCREENS.BOOKING_HISTORY},
//   {label: 'My Profile', icon: 'user', route: SCREENS.PROFILE_SCREEN},
//   {
//     label: 'Business & Billing Details',
//     icon: 'briefcase',
//     route: SCREENS.INVOICES,
//   },
//   {label: 'Change Password', icon: 'lock', route: SCREENS.CHANGE_PASSWORD},
//   {label: 'Support & Feedback', icon: 'headphones', route: SCREENS.SUPPORT_FB},
//   {label: 'FAQ’s', icon: 'help-circle', route: SCREENS.FAQ},
// ];

// const CustomDrawerContent = (props: any) => {
//   // dispatch
//   const dispatch = useDispatch<AppDispatch>();

//   // ------------------------------- functionalities ------------------------------- //
//   const handleLogout = async () => {
//     try {
//       await persistor.purge();
//       dispatch(logout());
//       await new Promise(resolve => setTimeout(resolve, 100));
//       navigationService.reset({
//         index: 0,
//         routes: [
//           {
//             name: SCREENS.AUTH_STACK,
//             state: {
//               routes: [{name: SCREENS.LOGIN}],
//               index: 0,
//             },
//           },
//         ],
//       });
//     } catch (err) {
//       console.warn('Logout failed', err);
//     }
//   };

//   const handleChat = async () => {
//     try {
//       navigationService.navigate(SCREENS.CHAT_BOT_HOME);
//     } catch (err) {
//       console.warn('Chatbot failed', err);
//     }
//   };

//   const handleLogoClick = () => {
//     navigationService.reset({
//       index: 0,
//       routes: [
//         {
//           name: SCREENS.SCREENS_STACK,
//           state: {
//             routes: [
//               {
//                 name: SCREENS.HOME,
//                 state: {
//                   routes: [
//                     {
//                       name: 'Tabs',
//                       state: {
//                         routes: [{name: SCREENS.HOME}],
//                         index: 0,
//                       },
//                     },
//                   ],
//                   index: 0,
//                 },
//               },
//             ],
//             index: 0,
//           },
//         },
//       ],
//     });
//   };
//   // ------------------------------- render ui ------------------------------- //
//   return (
//     <DrawerContentScrollView
//       {...props}
//       contentContainerStyle={styles.container}>
//       <TouchableOpacity onPress={() => handleLogoClick()}>
//         <Logo />
//       </TouchableOpacity>
//       <Spacer height={heightPercentageToDP('2%')} />
//       <View style={styles.menuContainer}>
//         {menuItems.map(item => (
//           <DrawerItem
//             key={item.route}
//             label={item.label}
//             labelStyle={styles.label}
//             icon={({color, size}) => (
//               <Icon name={item.icon} size={size} color={'black'} />
//             )}
//             onPress={() => props.navigation.navigate(item.route)}
//           />
//         ))}
//       </View>
//       <TouchableOpacity onPress={handleChat}>
//         <Chat />
//       </TouchableOpacity>
//       <Spacer height={heightPercentageToDP('2%')} />
//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>
//     </DrawerContentScrollView>
//   );
// };

// export default CustomDrawerContent;
