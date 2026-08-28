import {StyleSheet} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP,
  widthPercentageToDP as wp,
} from '@utils/helpers';
import {baseStyle, colors, sizes} from '../../constant/theme';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: wp('2%'),
  },

  titleContainer: {
    width: '100%',
    backgroundColor: colors.white,
    paddingLeft: wp('3%'),
    paddingRight: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: colors.gray_EC,
    borderWidth: 1,
    borderRadius: widthPercentageToDP('1%'),
    paddingVertical: widthPercentageToDP('1%'),
  },
    errorInput: {
    borderColor: colors.red,
    borderRadius: widthPercentageToDP('1%'),
  },
  dropdownContainer: {
    width: '100%',
    backgroundColor: colors.white,
    paddingHorizontal: wp('2%'),
    paddingVertical: wp('2.5%'),
    borderColor: colors.gray_EC,
    borderWidth: 1,
    borderRadius: widthPercentageToDP('1%'),
  },
  dropdownTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal:"3%",
    marginBottom:"2%"
  },

  // text styles
  placeholder: {
    ...baseStyle.txtRegular(sizes.size02, colors.gray_7F),
    flex: 1,
  },
  options: {
    ...baseStyle.txtRegular(sizes.size02, colors.black),
    flex: 1,
  },
  nodataText: {
    flex: 1,
    ...baseStyle.txtRegular(sizes.size02, colors.gray_7F),
    textAlign: 'center',
  },

  // img styles
  dropdownIcon: {
    width: wp('3%'),
    height: wp('3%'),
    resizeMode: 'contain',
  },
  selectedIcon: {
    width: wp('4%'),
    height: wp('4%'),
    resizeMode: 'contain',
  },
  rotate90Deg: {
    transform: [{rotate: '-180deg'}],
  },

  oBottonBorderRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  // view type
  label: {
    marginHorizontal: wp('2%'),
  },
  blackColor: {
    color: colors.black,
  },
  fields: {
    backgroundColor: colors.white,
    borderRadius: wp('2%'),
    padding: '2%',
  },
  errorField: {
    borderColor: colors.red,
    borderRadius: wp('2.5%'),
    borderWidth: wp('0.2%'),
    padding: '2%',
  },
  marginHorizontal: {marginHorizontal: wp('0.5%')},
  errTextInput: {
    borderColor: colors.red,
    borderWidth: 1,
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingVertical: 5,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
  },
  selectedItemText: {
    color: '#000',
    marginRight: 5,
  },
  cancelIcon: {
    width: 12,
    height: 12,
    tintColor: 'black',
  },
  trash: {
    width: wp('4.5%'),
    height: wp('4.5%'),
    resizeMode: 'contain',
    tintColor: colors.red,
  },
});

export default styles;
