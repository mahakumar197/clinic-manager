import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

const navigationRef = createNavigationContainerRef<any>();

function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef?.navigate(name, params);
  }
}

export const replace = (name?: any, params?: any) => {
  navigationRef?.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name, params}],
    }),
  );
};

function navigateAndReset(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot({
      index: 0,
      routes: [{name, params}],
    });
  }
}

function reset(resetState?: any) {
  if (navigationRef.isReady()) {
    if (resetState) {
      navigationRef.dispatch(CommonActions.reset(resetState));
    } else {
      navigationRef.resetRoot({
        index: 0,
        routes: [{name: 'MainApp'}],
      });
    }
  }
}

function goBack() {
  navigationRef.dispatch(CommonActions.goBack());
}

export default {
  navigationRef,
  navigate,
  replace,
  navigateAndReset,
  reset,
  goBack,
};