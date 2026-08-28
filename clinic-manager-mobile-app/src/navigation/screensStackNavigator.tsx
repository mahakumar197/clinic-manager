// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { SCREENS } from '../constant';
// import DrawerNavigator from './drawerNavigator';
// // screens
// const otherScreens = [
//   {name: SCREENS.HOME, component: DrawerNavigator},
// ] as const;

// export type ScreensStackParamList = {
//   [K in (typeof otherScreens)[number]['name']]: undefined;
// };

// const Stack = createNativeStackNavigator<ScreensStackParamList>();

// const ScreensStackNavigator = () => {

//   return (
//     <Stack.Navigator
//       initialRouteName={SCREENS.HOME}
//       screenOptions={{headerShown: false}}>
//       {otherScreens.map(({name, component}) => (
//         <Stack.Screen
//           key={name}
//           name={name}
//           component={component}
//           options={{
//             animation: 'default',
//           }}
//         />
//       ))}
//     </Stack.Navigator>
//   );
// };

// export default ScreensStackNavigator;
