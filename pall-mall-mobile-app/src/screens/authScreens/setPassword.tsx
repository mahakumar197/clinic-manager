import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {FormProvider, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';

// components
import CustomSafeArea from '@components/customSafeArea';
import AppHeader from '@components/appHeader';
import Button from '@components/button';
import Spacer from '@components/spacer';
import TextInputComponent from '@components/textInput';

// navigation
import navigationService from '@navigation/navigationService';
import {SCREENS} from '../../constant';

// utils / theme
import {heightPercentageToDP as hp} from '@utils/helpers';
import {baseStyle, colors, sizes} from '../../constant/theme';
import {styles} from '@screens/styles/auth';

// yup schema (separate file)
import {setPasswordSchema} from '@schemas/authSchema';

interface SetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const SetPassword: React.FC = () => {
  const methods = useForm<SetPasswordFormData>({
    resolver: yupResolver(setPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {handleSubmit} = methods;

  const onSubmit = (data: SetPasswordFormData) => {
    console.log('Set Password Data:', data);
    // Navigate to next screen or complete signup
  };

  return (
    <CustomSafeArea screenName={SCREENS.SET_PASSWORD}>
      <AppHeader
        type="secondary"
        isRightIcons={false}
        leftIcon="chevron-left"
      />

      <ScrollView
        style={styles.loginContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text
          style={[
            baseStyle.txtBold(sizes.size8, colors.black),
            {textAlign: 'center'},
          ]}>
          Set Password
        </Text>

        <Spacer height={hp('5%')} />

        {/* Form */}
        <FormProvider {...methods}>
          <View style={styles.formContainer}>
            {/* New Password Input */}
            <TextInputComponent
              name="newPassword"
              label="New Password"
              placeholder="New password"
              type="password"
            />

            <Spacer height={hp('2.5%')} />

            {/* Confirm Password Input */}
            <TextInputComponent
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm password"
              type="password"
            />

            <Spacer height={hp('4%')} />

            {/* Continue Button */}
            <Button
              label="Continue"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
            />

            <Spacer height={hp('3%')} />

            {/* Sign In Link */}
            <View style={styles.createAccountContainer}>
              <Text style={baseStyle.txtRegular(sizes.size2, colors.gray_7F)}>
                Already have an account?{' '}
              </Text>

              <TouchableOpacity
                onPress={() => navigationService.navigate(SCREENS.LOGIN)}>
                <Text style={baseStyle.txtMedium(sizes.size2, colors.black)}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </FormProvider>
      </ScrollView>
    </CustomSafeArea>
  );
};

export default SetPassword;