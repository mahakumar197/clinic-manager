import {widthPercentageToDP} from '@utils/helpers';
import {StyleSheet, Platform} from 'react-native';
import {colors} from '../../constant/theme';

const styles = StyleSheet.create({
  inputContainer: {marginVertical: widthPercentageToDP('2%')},
  input: {
    borderWidth: widthPercentageToDP('0.25%'),
    borderColor: colors.gray_EC,
    borderRadius: widthPercentageToDP('1%'),
    paddingHorizontal:
      Platform.OS === 'android'
        ? widthPercentageToDP('2%')
        : widthPercentageToDP('3%'),
    paddingVertical:
      Platform.OS === 'android'
        ? widthPercentageToDP('0.5%')
        : widthPercentageToDP('3%'),
  },
  filterTypeInput: {
    borderWidth: widthPercentageToDP('0.25%'),
    borderColor: colors.gray_EC,
    padding: widthPercentageToDP('2%'),
    borderRadius: widthPercentageToDP('2%'),
  },
  internalInput: {
    color: colors.black,
  },
  errorInput: {
    borderColor: colors.red,
    borderRadius: widthPercentageToDP('1%'),
  },
  disabledInput: {
    backgroundColor: colors.gray_79,
    opacity: 0.7,
  },
  disabledText: {
    color: colors.gray_79,
  },
  cancel: {
    position: 'absolute',
    top: widthPercentageToDP('7%'),
    right: widthPercentageToDP('7%'),
  },
  container: {backgroundColor: 'white', paddingBottom: '2%'},
  content: {},
  rangeContent: {
    paddingVertical: widthPercentageToDP('5%'),
    paddingLeft: widthPercentageToDP('3%'),
    flexDirection: 'row',
  },
  quickOptions: {},
  quickOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  quickOptionText: {fontSize: 14, color: '#333'},
  resetOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resetOptionText: {fontSize: 14, color: '#1976D2'},
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: widthPercentageToDP('5%'),
  },
  navButton: {fontSize: 24, color: '#1976D2', paddingHorizontal: 15},
  calendar: {flexDirection: 'row', flexWrap: 'wrap'},
  dayHeader: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCell: {
    height: widthPercentageToDP('10%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: widthPercentageToDP('50%'),
  },
  selectedDay: {backgroundColor: '#1976D2'},
  highlighted: {
    backgroundColor: '#ccc',
  },
  selectedDayText: {color: colors.white, fontWeight: '600'},
  rangeDay: {backgroundColor: '#E3F2FD', borderRadius: 0},
  rangeDayText: {color: '#1976D2'},
  rangeStartDay: {
    backgroundColor: '#1976D2',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rangeEndDay: {
    backgroundColor: '#1976D2',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  disabledDay: {opacity: 0.3},
  disabledDayText: {color: colors.gray_7F},
});
export default styles;
