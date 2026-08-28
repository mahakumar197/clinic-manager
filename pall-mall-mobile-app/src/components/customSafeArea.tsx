import {FC, ReactNode} from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StatusBarStyle,
  View,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHeaderHeight} from '@react-navigation/elements';
import {SCREENS} from '../constant';
import {colors} from '../constant/theme';

const SCREENS_WITH_PRIMARY_BAR: string[] = [
  SCREENS.REGISTER,
  SCREENS.SCREENS_STACK,
];

interface CustomSafeAreaProps {
  screenName: string;
  style?: ViewStyle;
  backgroundImg?: any;
  children?: ReactNode;
}

const CustomSafeArea: FC<CustomSafeAreaProps> = ({
  screenName,
  style = {flex: 1},
  backgroundImg,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const isPrimaryBar = SCREENS_WITH_PRIMARY_BAR.includes(screenName);
  const barBg = isPrimaryBar ? colors.primary : colors.white;
  const barStyle: StatusBarStyle = isPrimaryBar
    ? 'light-content'
    : 'dark-content';

  return (
    <View style={{flex: 1}}>
      {!backgroundImg && (
        <View style={{height: insets.top, backgroundColor: barBg}}>
          <StatusBar
            animated
            backgroundColor={barBg}
            barStyle={barStyle}
            translucent={false}
          />
        </View>
      )}

      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: colors.white}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + headerHeight}>
        {backgroundImg ? (
          <ImageBackground source={backgroundImg} style={{flex: 1}}>
            <View style={style}>{children}</View>
          </ImageBackground>
        ) : (
          <View style={style}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default CustomSafeArea;
