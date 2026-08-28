import {Dimensions, StyleSheet} from 'react-native';
import {baseStyle, colors} from '../../constant/theme';
import {
    heightPercentageToDP,
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
    widthPercentageToDP
} from '@utils/helpers';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: colors.white,
  },
  circle: {
    backgroundColor: colors.primary,
    position: 'absolute',
  },
  animatedTxt: {position: 'absolute', zIndex: 10},
  absolute: {position: 'absolute'},

  // onboarding
  onboardingContainer: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    height: hp('45%'),
    alignSelf: 'center',
  },
  // contentContainer: {
  //   flex: 1,
  //   backgroundColor: '#F5A623',
  //   paddingHorizontal: wp('7%'),
  //   justifyContent: 'space-between',
  //   borderRadius: hp('10%'),
  //   width: '100%',
  // },
  textAlign: {
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('50%'),
    marginHorizontal: wp('1%'),
  },
  activeDot: {
    backgroundColor: colors.white,
    width: wp('8%'),
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // login
  loginContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    paddingHorizontal: wp('6%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('4%'),
  },
  backButton: {
    width: wp('10%'),
    height: wp('10%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: hp('2%'),
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp('5%'),
  },
  socialButton: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    ...baseStyle.cardElevationStyle(),
  },

  // otp
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: widthPercentageToDP('5%'),
    paddingHorizontal: widthPercentageToDP('5%'),
    gap: '2%',
  },
  otpTextInputView: {
    width: widthPercentageToDP('13%'),
    height: widthPercentageToDP('13%'),
    borderRadius: widthPercentageToDP('3%'),
    borderWidth: widthPercentageToDP('0.3%'),
    textAlign: 'center',
  },
  resend: {
    marginVertical: heightPercentageToDP('3%'),
  },
  verifyBtn: {
    width: '90%',
  },
  otpScreen: {
    flex: 1,
    paddingHorizontal: widthPercentageToDP('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
