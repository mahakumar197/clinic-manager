import {useRoute} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';

// component
import Button from '@components/button';
import CustomSafeArea from '@components/customSafeArea';
import Spacer from '@components/spacer';

// validation
import {yupResolver} from '@hookform/resolvers/yup';
import {otpSchema} from '@schemas/authSchema';
import {Controller, FormProvider, useForm} from 'react-hook-form';

// others

import {styles} from '@screens/styles/auth';
import {heightPercentageToDP} from '@utils/helpers';
import {SCREENS} from '../../constant';
import {authStrings} from '../../constant/strings';
import {baseStyle, colors, sizes} from '../../constant/theme';

type OTPFormValues = {
  otp: string;
};

const OTPScreen = () => {
  const route = useRoute<any>();
  const {emailMasked, phoneMasked, from} = route.params;

  const methods = useForm<OTPFormValues>({
    resolver: yupResolver(otpSchema),
    defaultValues: {otp: ''},
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting},
  } = methods;

  const otpRefs = useRef<Array<TextInput | null>>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [sheetMessage, setSheetMessage] = useState<string>('');
  const [sheetType, setSheetType] = useState<'success' | 'error'>('success');
  const rbSheetRef = useRef<any>(null);

  const isForgotPassword = from === 'forgotPassword';
  // ---------------- Timer ----------------

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ---------------- Focus first OTP box on mount ----------------
  useEffect(() => {
    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 200);
  }, []);

  const onSubmit = async (data: OTPFormValues) => {};

  const handleResend = async (data: any) => {};

  return (
    <CustomSafeArea screenName={SCREENS.OTP}>
      <View style={styles.otpScreen}>
        <Text style={[baseStyle.txtBold(sizes.size4, colors.black)]}>
          {isForgotPassword ? authStrings.verifyOTP : authStrings.verifyAcc}
        </Text>
        <Spacer height={heightPercentageToDP('1.5%')} />
        <Text
          style={[
            baseStyle.txtRegular(sizes.size02, colors.gray_79),
            {textAlign: 'center', marginVertical: 10},
          ]}>
          {isForgotPassword
            ? emailMasked
              ? `${authStrings.sendVerificationCode} ${emailMasked}`
              : `${authStrings.sendVerificationCode} ${authStrings.mobileNo} ${phoneMasked}`
            : `${authStrings.sendVerificationCode} ${emailMasked} & ${authStrings.mobileNo} ${phoneMasked}`}
        </Text>
        <Text
          style={[
            baseStyle.txtRegular(sizes.size02, colors.gray_79),
            {textAlign: 'center', marginVertical: 10},
          ]}>
          It's valid for 5 minutes - please enter it below before it expires.
        </Text>

        <FormProvider {...methods}>
          <View style={styles.otpContainer}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Controller
                  key={index}
                  control={control}
                  name="otp"
                  render={({field: {onChange, value}}) => (
                    <TextInput
                      ref={el => {
                        otpRefs.current[index] = el;
                      }}
                      keyboardType="number-pad"
                      onFocus={() => setFocusIndex(index)}
                      onBlur={() => setFocusIndex(null)}
                      maxLength={1}
                      value={value[index] || ''}
                      onChangeText={txt => {
                        const newOtp = value.split('');
                        newOtp[index] = txt;
                        const joined = newOtp.join('');
                        onChange(joined);

                        if (txt && index < 5) {
                          otpRefs.current[index + 1]?.focus();
                        }
                      }}
                      onKeyPress={({nativeEvent}) => {
                        if (
                          nativeEvent.key === 'Backspace' &&
                          !value[index] &&
                          index > 0
                        ) {
                          otpRefs.current[index - 1]?.focus();
                        }
                      }}
                      style={[
                        styles.otpTextInputView,
                        {
                          borderColor: errors.otp
                            ? colors.red
                            : focusIndex === index
                            ? colors.primary
                            : colors.gray_79,
                        },
                      ]}
                    />
                  )}
                />
              ))}
          </View>
        </FormProvider>

        {errors.otp && (
          <Text
            style={[
              baseStyle.txtRegular(12, colors.red),
              {textAlign: 'center', marginTop: 6},
            ]}>
            {errors.otp.message}
          </Text>
        )}

        <View style={{alignItems: 'center', marginTop: 10}}>
          {timeLeft > 0 ? (
            <Text style={[baseStyle.txtRegular(sizes.size2, colors.black)]}>
              Didn't receive code?{' '}
              <Text style={[baseStyle.txtRegular(sizes.size2, colors.primary)]}>
                Resend {formatTime(timeLeft)}
              </Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text
                style={[
                  baseStyle.txtRegular(sizes.size2, colors.primary),
                  styles.resend,
                ]}>
                {authStrings.resend}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          onPress={handleSubmit(onSubmit)}
          label={authStrings.verify}
          containerStyle={styles.verifyBtn}
          loading={isSubmitting}
        />
      </View>
    </CustomSafeArea>
  );
};

export default OTPScreen;
