import {StyleSheet} from 'react-native';
//constant
import {heightPercentageToDP, widthPercentageToDP} from '@utils/helpers';
import {baseStyle, colors} from '../../constant/theme';
//package

const styles = StyleSheet.create({
  uploadView1: {
    shadowColor: colors.gray_EC,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderColor: '#047AB6',
    borderWidth: 1,
    backgroundColor: '#F8FBFF',
    paddingVertical: widthPercentageToDP('3.5%'),
    borderStyle: 'dashed',
    borderRadius: widthPercentageToDP('1.5%'),
  },
  alignCenter: {
    textAlign: 'center',
  },
  cloudImage: {
    width: widthPercentageToDP('14%'),
    height: widthPercentageToDP('14%'),
    resizeMode: 'contain',
  },
  overView: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    paddingVertical: widthPercentageToDP('1.5%'),
  },
  uploadedView: {
    backgroundColor: colors.white,
  },
  underLineText: {
    textDecorationLine: 'underline',
  },

  // file upload action
  container: {
    margin: '5%',
  },
  buttonContainer: {
    backgroundColor: colors.white,
    width: '95%',
    alignSelf: 'center',
    borderColor: colors.black,
    borderWidth: widthPercentageToDP('0.2%'),
    ...baseStyle.cardElevationStyle(),
    alignItems: 'center',
    justifyContent: 'center',
    height: heightPercentageToDP('5.3%'),
    borderRadius: widthPercentageToDP('6%'),
  },

  // uploaded card
  cardContainer: {
    ...baseStyle.cardElevationStyle(),
    padding: '4%',
    borderRadius: widthPercentageToDP('2%'),
    backgroundColor: colors.white,
    margin: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pfdIcon: {
    width: widthPercentageToDP('10%'),
    height: widthPercentageToDP('10%'),
    resizeMode: 'contain',
  },

  flex1: {
    flex: 1,
  },

  downloadIcon: {
    width: widthPercentageToDP('5%'),
    height: widthPercentageToDP('5%'),
    resizeMode: 'contain',
  },

  eyeIcon: {
    width: widthPercentageToDP('6%'),
    height: widthPercentageToDP('6%'),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  optionContainer: {
    padding: widthPercentageToDP('5%'),
    alignItems: 'center',
    gap: widthPercentageToDP('3%'),
    marginVertical: '5%',
    flexDirection: 'row',
    width: widthPercentageToDP('100%'),
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  optionButton: {
    borderColor: colors.gray_79,
    width: widthPercentageToDP('15%'),
    height: widthPercentageToDP('15%'),
    ...baseStyle.cardElevationStyle(),
    borderRadius: widthPercentageToDP('50%'),
    backgroundColor: '#F8FBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
