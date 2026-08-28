import Spacer from '@components/spacer';
import {heightPercentageToDP} from '@utils/helpers';
import React, {useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {
  Text,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {baseStyle, colors, sizes} from '../constant/theme';
import styles from './styles/inputStyles';

export type InputTypes =
  | 'textarea'
  | 'name'
  | 'email'
  | 'number'
  | 'mobile'
  | 'password'
  | 'address'
  | 'aadhar'
  | 'pan'
  | 'textOnly';
interface TextInputComponentProps extends TextInputProps {
  name: string;
  label?: string;
  isReq?: boolean;
  placeholder?: string;
  type?: InputTypes;
  rules?: object;
  maxLength?: number;
}

const getKeyboardType = (type: InputTypes | string) => {
  switch (type) {
    case 'email':
      return 'email-address';
    case 'mobile':
    case 'number':
    case 'aadhar':
      return 'numeric';
    default:
      return 'default';
  }
};

const TextInputComponent: React.FC<TextInputComponentProps> = ({
  name,
  label,
  placeholder,
  type = 'default',
  rules,
  maxLength,
  isReq = true,
  ...rest
}) => {
  const {control} = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const isMultiline = type === 'textarea';

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
        <View style={styles.container}>
          {label && (
            <>
              <Text style={[baseStyle.txtMedium(sizes.size2, colors.black)]}>
                {label}
                {isReq && (
                  <Text style={[baseStyle.txtMedium(sizes.size2, colors.red)]}>
                    {' '}
                    *
                  </Text>
                )}
              </Text>
              <Spacer height={heightPercentageToDP('1%')} />
            </>
          )}
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                isMultiline && styles.textArea,
                error && styles.errorInput,
                isPassword && {paddingRight: 40},
                {color: colors.black},
                rest.editable === false && {
                  backgroundColor: colors.gray_EC,
                  color: colors.gray_7F,
                },
                {textAlignVertical: isMultiline ? 'top' : 'center'},
                {includeFontPadding: false},
              ]}
              placeholder={placeholder}
              placeholderTextColor={colors.placeHolder}
              keyboardType={getKeyboardType(type)}
              secureTextEntry={isPassword && !showPassword}
              value={value ?? ''}
              onChangeText={text => {
                if (type === 'mobile' || type === 'aadhar') {
                  onChange(text.replace(/[^0-9]/g, ''));
                } else if (type === 'textOnly') {
                  onChange(text.replace(/[^a-zA-Z\s]/g, ''));
                } else if (type === 'number') {
                  const cleanedText = text.replace(/[^0-9.]/g, '');
                  const dotCount = (cleanedText.match(/\./g) || []).length;

                  if (dotCount > 1) return;
                  onChange(cleanedText);
                } else {
                  onChange(text);
                }
              }}
              autoCapitalize={type === 'email' ? 'none' : 'sentences'}
              onBlur={onBlur}
              multiline={isMultiline}
              numberOfLines={isMultiline ? 4 : 1}
              selectionColor={'#1f5291bd'}
              {...rest}
              maxLength={type === 'mobile' ? 10 : maxLength}
            />

            {isPassword && (
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(prev => !prev)}>
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={colors.gray_7F}
                />
              </TouchableOpacity>
            )}
          </View>
          {error && (
            <>
              <Spacer height={heightPercentageToDP('0.5%')} />
              <Text style={[baseStyle.txtRegular(sizes.size02, colors.red)]}>
                {error.message}
              </Text>
            </>
          )}
        </View>
      )}
    />
  );
};

export default TextInputComponent;
