import {widthPercentageToDP} from '@utils/helpers';
import {StyleSheet} from 'react-native';
import {colors} from '../../constant/theme';

const styles = StyleSheet.create({
  button: {
    paddingVertical: widthPercentageToDP('4%'),
    borderRadius: widthPercentageToDP('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: widthPercentageToDP('2%'),
  },
  secondary: {
    paddingVertical: widthPercentageToDP('4%'),
    borderRadius: widthPercentageToDP('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: widthPercentageToDP('2%'),
    borderWidth: widthPercentageToDP('0.5%'),
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});
export default styles;
