import React, { FC } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
// components
import CustomSafeArea from '@components/customSafeArea';
import { HalfWaveButton } from '@components/halfWaveButton';
import Spacer from '@components/spacer';

// navigation
import navigationService from '@navigation/navigationService';
import { styles } from '@screens/styles/auth';
import { heightPercentageToDP, widthPercentageToDP } from '@utils/helpers';

// constant
import { SCREENS } from '../../constant';
import { onboardingData, OnboardingItem } from '../../constant/staticData';
import { baseStyle, colors, sizes } from '../../constant/theme';

const Onboarding: FC = () => {
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log('Navigate to next screen');
    }
  };

  const handleSkip = () => {
    navigationService.navigate(SCREENS.LOGIN);
  };
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentSlide: OnboardingItem = onboardingData[currentIndex];
  const IllustrationComponent = currentSlide.illustration;

  return (
    <CustomSafeArea
      screenName={SCREENS.ONBOARDING}
      backgroundImg={currentSlide.backgroundImage}
      style={styles.onboardingContainer}>
      <View style={styles.slide}>
        <Spacer height={heightPercentageToDP('8%')} />
        <View style={styles.illustrationContainer}>
          <IllustrationComponent />
        </View>

        <View style={styles.contentContainer}>
          <Spacer height={heightPercentageToDP('5%')} />
          <Text
            style={[
              baseStyle.txtBold(sizes.size6, colors.white),
              styles.textAlign,
            ]}>
            {currentSlide.title}
          </Text>
          <Spacer height={heightPercentageToDP('3%')} />
          <Text
            style={[
              baseStyle.txtRegular(sizes.size3, colors.white),
              styles.textAlign,
            ]}>
            {currentSlide.description}
          </Text>

          <Spacer height={heightPercentageToDP('4%')} />
          <View style={styles.paginationContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
          <Spacer height={heightPercentageToDP('4%')} />
          <View style={styles.navigationContainer}>
            {currentIndex > 0 ? (
              <TouchableOpacity onPress={handlePrevious}>
                <Icon
                  name="chevron-left"
                  size={widthPercentageToDP('7%')}
                  color={colors.white}
                />
              </TouchableOpacity>
            ) : (
              <View style={{width: widthPercentageToDP('8%')}} />
            )}

            <HalfWaveButton onPress={handleNext} />
            <TouchableOpacity onPress={handleSkip}>
              <Text style={[baseStyle.txtMedium(sizes.size2, colors.black)]}>
                SKIP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </CustomSafeArea>
  );
};

export default Onboarding;
