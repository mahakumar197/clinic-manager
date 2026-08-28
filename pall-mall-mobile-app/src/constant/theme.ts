import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from '@utils/helpers';
import {Platform, ViewStyle, TextStyle, ImageStyle} from 'react-native';

// ---------- Sizes ----------
export const sizes = {
  bigFont: hp('3%'),
  mediumFont: hp('2%'),
  smallFont: hp('1%'),
  iconBigSize: hp('3%'),
  iconMediumSize: hp('2%'),
  iconSmallSize: hp('1%'),
  mediumFontText: hp('1.5%'),
  mediumFontTwoText: hp('2.5%'),

  size0: Platform.OS === 'ios' ? hp('1%') : hp('1.2%'),
  size01: Platform.OS === 'ios' ? hp('1.3%') : hp('1.5%'),
  size11: Platform.OS === 'ios' ? hp('1.35%') : hp('1.55%'),
  size1: Platform.OS === 'ios' ? hp('1.5%') : hp('1.7%'),
  size2: Platform.OS === 'ios' ? hp('1.8%') : hp('1.9%'),
  size3: Platform.OS === 'ios' ? hp('2%') : hp('2.2%'),
  size4: Platform.OS === 'ios' ? hp('2.3%') : hp('2.5%'),
  size5: Platform.OS === 'ios' ? hp('2.5%') : hp('2.7%'),
  size6: Platform.OS === 'ios' ? hp('2.8%') : hp('3%'),
  size7: Platform.OS === 'ios' ? hp('3%') : hp('3.2%'),
  size8: Platform.OS === 'ios' ? hp('4%') : hp('4%'),
  size011: Platform.OS === 'ios' ? hp('1.4%') : hp('1.6%'),
  size02: Platform.OS === 'ios' ? hp('1.6%') : hp('1.8%'),
};

// ---------- Font Families ----------
export const fontfamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  bold: 'Inter-Bold',
};

// ---------- Colors ----------
export const colors = {
  primary: '#E9A708',
  white: '#FFFFFF',

  themeColor: '#FFFFFF',
  darkThemeColor: '#202231',
  black: '#000000',
  green: '#61903D',
  green_61:"#06A561",
  red: '#EB5757',
  transparent: 'transparent',
  lightGray: '#F5F5F5',
  gray_7F: '#5A607F',
  gray_EC: '#D9E1EC',
  gray_79: '#696F79',
  placeHolder: '#A1A7C4',
};

// ---------- Base Styles ----------
type TextStyleFunc = (fontSize: number, fontColor: string) => TextStyle;
type ViewStyleFunc = () => ViewStyle;
type CircleViewFunc = (size: number) => ViewStyle;
type IconStyleFunc = (size: number) => ImageStyle;

export const baseStyle = {
  txtRegular: ((fontSize, fontColor) => ({
    fontFamily: fontfamily.regular,
    fontSize,
    color: fontColor,
  })) as TextStyleFunc,

  txtMedium: ((fontSize, fontColor) => ({
    fontFamily: fontfamily.medium,
    fontSize,
    color: fontColor,
  })) as TextStyleFunc,

  txtBold: ((fontSize, fontColor) => ({
    fontFamily: fontfamily.bold,
    fontSize,
    color: fontColor,
  })) as TextStyleFunc,

  cardElevationStyle: (() => ({
    elevation: 3,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.black,
      shadowOpacity: 0.26,
      shadowOffset: {width: 1, height: 2},
      shadowRadius: 3,
    }),
  })) as ViewStyleFunc,

  circleView: (size => ({
    width: wp(size),
    height: wp(size),
    borderRadius: wp(size) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  })) as CircleViewFunc,

  iconStyle: (size => ({
    width: wp(size),
    height: wp(size),
    resizeMode: 'contain',
  })) as IconStyleFunc,
};
