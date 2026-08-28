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

// social icons
import Apple from '@icons/apple.svg';
import Facebook from '@icons/facebook.svg';
import Google from '@icons/google.svg';

// yup schema (separate file)
import {signupSchema} from '@schemas/authSchema';

interface SignUpFormData {
  fullName: string;
  email: string;
}

const Signup: React.FC = () => {
  const methods = useForm<SignUpFormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
    },
  });

  const {handleSubmit} = methods;

  const onSubmit = (data: SignUpFormData) => {
    console.log('Sign Up Data:', data);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Signup with ${provider}`);
  };

  return (
    <CustomSafeArea screenName={SCREENS.SIGN_UP}>
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
          Sign Up
        </Text>

        <Spacer height={hp('5%')} />

        {/* Form */}
        <FormProvider {...methods}>
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <TextInputComponent
              name="fullName"
              label="Full Name"
              placeholder="Enter full name"
              // type="text"
            />

            <Spacer height={hp('2.5%')} />

            {/* Email Input */}
            <TextInputComponent
              name="email"
              label="Email Address"
              placeholder="Enter email address"
              type="email"
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

            <Spacer height={hp('3%')} />

            <Text
              style={[
                baseStyle.txtRegular(sizes.size2, colors.gray_7F),
                {textAlign: 'center'},
              ]}>
              Or
            </Text>

            <Spacer height={hp('3%')} />

            {/* Social Signup Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Google')}>
                <Google />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Apple')}>
                <Apple />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Facebook')}>
                <Facebook />
              </TouchableOpacity>
            </View>
          </View>
        </FormProvider>
      </ScrollView>
    </CustomSafeArea>
  );
};

export default Signup;