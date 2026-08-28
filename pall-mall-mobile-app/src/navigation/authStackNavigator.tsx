import { createNativeStackNavigator } from '@react-navigation/native-stack';
// screens
import Login from '@screens/authScreens/login';
import Onboarding from '@screens/authScreens/onboarding';
import Signup from '@screens/authScreens/signup';
import Splash from '@screens/authScreens/splash';
import { SCREENS } from '../constant';

const screens = [
  {name: SCREENS.SPLASH, component: Splash},
  {name: SCREENS.ONBOARDING, component: Onboarding},
  {name: SCREENS.LOGIN, component: Login},
  {name: SCREENS.SIGN_UP, component: Signup},
  

] as const;

export type AuthStackParamList = {
  [K in (typeof screens)[number]['name']]: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={SCREENS.SPLASH}
      screenOptions={{headerShown: false}}>
      {screens.map(({name, component}) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={{
            animation: 'default',
          }}
        />
      ))}
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
