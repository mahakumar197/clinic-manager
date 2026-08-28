import {StyleSheet} from 'react-native';

import {heightPercentageToDP, widthPercentageToDP} from '@utils/helpers';
import {colors, sizes} from '../../constant/theme';

const messageEditorStyles = StyleSheet.create({
  container: {
    borderWidth: widthPercentageToDP('0.25%'),
    borderColor: colors.gray_EC,
    borderRadius: widthPercentageToDP('1%'),
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: widthPercentageToDP('1.5%'),
    borderBottomWidth: widthPercentageToDP('0.25%'),
    paddingVertical: widthPercentageToDP('1.5%'),
    borderBottomColor: '#eee',
    flexWrap: 'wrap',
  },
  toolBtn: {
    paddingHorizontal: widthPercentageToDP('1%'),
    paddingVertical: widthPercentageToDP('1%'),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: widthPercentageToDP('1%'),
    borderWidth: widthPercentageToDP('0.2%'),
    borderColor: colors.primary,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 100,
  },
  dropdownItem: {
    padding: 8,
    fontSize: sizes.size02,
    color: colors.black,
  },
  editor: {
    minHeight: heightPercentageToDP('15%'),
    padding: 10,
    backgroundColor: '#F8FBFF',
  },
});

export default messageEditorStyles;
