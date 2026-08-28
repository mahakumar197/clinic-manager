import * as React from 'react';

// navigation
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import navigationService from './navigationService';
import NavigationStacks from './navigationStacks';

import { SCREENS } from '../constant';

interface ScreenConfig {
  ScreenName: string;
  Component: React.ComponentType<any>;
}

export type RootStackParamList = {
  [SCREENS.AUTH_STACK]: undefined;
  [SCREENS.SCREENS_STACK]: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppStack = (): React.JSX.Element => {
  const ScreensComponentArr: ScreenConfig[] = [
    {
      ScreenName: SCREENS.AUTH_STACK,
      Component: NavigationStacks.Auth_Stack,
    },
    // {
    //   ScreenName: SCREENS.SCREENS_STACK,
    //   Component: NavigationStacks.Screens_Stack,
    // },
  ];

  return (
      <NavigationContainer
        ref={
          navigationService.navigationRef as React.RefObject<
            NavigationContainerRef<RootStackParamList>
          >
        }>
        <Stack.Navigator initialRouteName={SCREENS.AUTH_STACK}>
          {ScreensComponentArr.map(({ScreenName, Component}) => {
            const typedScreenName = ScreenName as keyof RootStackParamList;

            return (
              <Stack.Screen
                key={`${typedScreenName}_stackScreen`}
                name={typedScreenName}
                component={Component}
                options={{headerShown: false}}
              />
            );
          })}
        </Stack.Navigator>
      </NavigationContainer>
  );
};
