import {heightPercentageToDP, widthPercentageToDP} from '@utils/helpers';
import {StyleSheet} from 'react-native';
import {colors} from '../../constant/theme';

const styles = StyleSheet.create({
  container: {marginVertical: widthPercentageToDP('2%')},
  input: {
    borderWidth: widthPercentageToDP('0.20%'),
    borderColor: "#B2BCC9",
    paddingHorizontal: widthPercentageToDP('3%'),
    paddingVertical: widthPercentageToDP('4.5%'),
    borderRadius: widthPercentageToDP('2.5%'),
    color: colors.black,
    backgroundColor: '#F4F4F6',
  },
  errorInput: {
    borderColor: colors.red,
    borderRadius: widthPercentageToDP('1%'),
  },
  textArea: {
    minHeight: heightPercentageToDP('12%'),
    paddingTop: heightPercentageToDP('2%'),
    borderRadius: widthPercentageToDP('1%'),
    textAlignVertical: 'top',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },

  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '55%',
    transform: [{translateY: -12}],
  },
});
export default styles;
