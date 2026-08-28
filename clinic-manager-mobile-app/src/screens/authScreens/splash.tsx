import navigationService from '@navigation/navigationService';
import { styles } from '@screens/styles/auth';
import { FC, useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { SCREENS } from '../../constant';
import { baseStyle, colors, sizes } from '../../constant/theme';

// assets

const {width, height} = Dimensions.get('window');

const Splash: FC = () => {
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const circleY = useRef(new Animated.Value(-height / 2)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const circleTextOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),

      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(circleY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(circleTextOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.sequence([
          Animated.timing(circleY, {
            toValue: -50,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(circleY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.timing(circleScale, {
            toValue: 2,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            Animated.delay(400).start(() => {
              Animated.timing(circleScale, {
                toValue: Math.max(width, height) / 40,
                duration: 600,
                useNativeDriver: true,
              }).start(() => {
                navigationService.navigate(SCREENS.ONBOARDING);
              });
            });
          });
        });
      });
    });
  }, []);

  const circleSize = 80;
  const maxDimension = Math.max(width, height) * 2;

  return (
    <View style={styles.splashContainer}>
      <Animated.Text
        style={[
          baseStyle.txtBold(sizes.size5, colors.primary),
          styles.absolute,
          {
            opacity: textOpacity,
          },
        ]}>
        Pall Mall
      </Animated.Text>

      <Animated.View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            opacity: circleOpacity,
            transform: [
              {
                translateY: circleY,
              },
              {
                scale: circleScale.interpolate({
                  inputRange: [0, Math.max(width, height) / 40],
                  outputRange: [0, maxDimension / circleSize],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.Text
        style={[
          baseStyle.txtBold(sizes.size8, colors.white),
          styles.animatedTxt,
          {
            opacity: circleTextOpacity,
            transform: [
              {
                translateY: circleY,
              },
            ],
          },
        ]}>
        Pall Mall
      </Animated.Text>
    </View>
  );
};

export default Splash;
