import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// others
import {widthPercentageToDP} from '@utils/helpers';
import {baseStyle, colors, sizes} from '../constant/theme';

interface CheckboxProps {
  isChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  checkboxStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  labelSize?: number;
  labelColor?: string;
}

const CheckboxComponent: React.FC<CheckboxProps> = ({
  isChecked = false,
  onToggle,
  label,
  labelStyle,
  containerStyle,
  checkboxStyle,
  disabled = false,
  labelColor = colors.gray_79,
  labelSize = sizes.size02,
}) => {
  const handlePress = () => {
    if (!disabled && onToggle) {
      onToggle(!isChecked);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.checkboxContainer, containerStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: isChecked ? colors.primary : colors.transparent,
            borderColor: colors.primary,
            borderWidth: isChecked ? 0 : widthPercentageToDP('0.5%'),
            opacity: disabled ? 0.5 : 1,
          },
          checkboxStyle,
        ]}>
        {isChecked && (
          <Icon
            name="check"
            size={widthPercentageToDP('4%')}
            color={colors.white}
          />
        )}
      </View>
      {label && (
        <Text
          style={[
            baseStyle.txtRegular(labelSize, labelColor),
            styles.checkboxLabel,
            labelStyle,
            {opacity: disabled ? 0.5 : 1},
          ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: widthPercentageToDP('1.5%'),
    width: widthPercentageToDP('5%'),
    height: widthPercentageToDP('5%'),
  },
  checkboxLabel: {
    marginLeft: widthPercentageToDP('2%'),
  },
});

export default CheckboxComponent;
