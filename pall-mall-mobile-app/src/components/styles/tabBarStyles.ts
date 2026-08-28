import {StyleSheet} from 'react-native';

import {colors} from '../../constant/theme';
import {widthPercentageToDP as wp} from '@utils/helpers';

const styles = StyleSheet.create({
    conatiner: {
      backgroundColor: colors.white,
      borderRadius: wp('1%'),
      width: '100%',
      padding: wp('2%'),
      height: wp('13%'),
      flex: 1,
    },
    barItemView: {
      paddingHorizontal: wp('2%'),
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      flex: 1,
    },
    columnWrapperStyle: {
      justifyContent: 'space-between',
      flexGrow: 1,
    },
  });

export default styles;
