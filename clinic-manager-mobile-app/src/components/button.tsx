import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {baseStyle, colors, sizes} from '../constant/theme';
import styles from './styles/buttonStyles';

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  containerStyle?: ViewStyle;
  color?: string;
  size?: number;
  textStyle?: (fontSize: number, color: string) => TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'prefix' | 'suffix';
  iconSpacing?: number;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  containerStyle,
  size = sizes.size3,
  textStyle = baseStyle.txtBold,
  color = colors.white,
  icon,
  iconPosition = 'prefix',
  iconSpacing = 6,
}) => {
  const backgroundColor = variant === 'primary' ? colors.primary : colors.white;
  const textColor = color
    ? color
    : variant === 'primary'
    ? colors.white
    : colors.primary;

  return (
    <TouchableOpacity
      style={[
        variant === 'primary' ? styles.button : styles.secondary,
        {backgroundColor},
        disabled && styles.disabled,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {icon && iconPosition === 'prefix' && (
            <View style={{marginRight: iconSpacing}}>{icon}</View>
          )}
          <Text style={[textStyle(size, textColor), {textAlign: 'center'}]}>
            {label}
          </Text>

          {icon && iconPosition === 'suffix' && (
            <View style={{marginLeft: iconSpacing}}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
