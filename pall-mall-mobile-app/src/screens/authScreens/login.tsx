import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';

// components
import AppHeader from '@components/appHeader';
import Button from '@components/button';
import CheckboxComponent from '@components/checkBox';
import CustomSafeArea from '@components/customSafeArea';
import Spacer from '@components/spacer';
import TextInputComponent from '@components/textInput';

// navigation
import navigationService from '@navigation/navigationService';
import { SCREENS } from '../../constant';

// utils / theme
import { styles } from '@screens/styles/auth';
import { heightPercentageToDP as hp } from '@utils/helpers';
import { baseStyle, colors, sizes } from '../../constant/theme';

// social icons
import Apple from '@icons/apple.svg';
import Facebook from '@icons/facebook.svg';
import Google from '@icons/google.svg';
// yup schema (separate file)
import { AppDispatch } from '@redux/store';
import { loginSchema } from '@schemas/authSchema';
import { useDispatch } from 'react-redux';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const Login: React.FC = () => {
  const methods = useForm<SignInFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const {handleSubmit, watch, setValue} = methods;
  const rememberMe = watch('rememberMe');

  const onSubmit = (data: SignInFormData) => {
    console.log('Sign In Data:', data);
  };

    const dispatch = useDispatch<AppDispatch>();

  // const onSubmit = async (data: any) => {
  //   const payload = {
  //     emailOrMobile: data.email,
  //     password: data.password,
  //   };
  //   try {
  //     const res = await dispatch(loginValidateApi(payload)).unwrap();
  //     if (res?.statusCode === 200) {
        
  //     }
  //   } catch (err: any) {
  //     console.warn('Login Failed:', err);
      
  //   }
  // };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <CustomSafeArea screenName={SCREENS.LOGIN}>
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
          Sign In
        </Text>

        <Spacer height={hp('5%')} />

        {/* Form */}
        <FormProvider {...methods}>
          <View style={styles.formContainer}>
            {/* Email Input */}
            <TextInputComponent
              name="email"
              label="Email Address"
              placeholder="Enter email or phone"
              type="email"
            />

            <Spacer height={hp('2.5%')} />

            {/* Password Input */}
            <TextInputComponent
              name="password"
              label="Password"
              placeholder="Enter password"
              type="password"
            />

            <Spacer height={hp('1.5%')} />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => {
                // navigationService.navigate(SCREENS.FORGOT_PASSWORD);
              }}>
              <Text
                style={[
                  baseStyle.txtMedium(sizes.size2, colors.primary),
                  {textDecorationLine: 'underline'},
                ]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Spacer height={hp('2%')} />

            {/* Remember Me */}
            <CheckboxComponent
              isChecked={rememberMe}
              onToggle={checked => setValue('rememberMe', checked)}
              label="Remember me"
              labelSize={sizes.size3}
              labelColor={colors.black}
            />

            <Spacer height={hp('4%')} />

            {/* Continue Button */}
            <Button
              label="Continue"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
            />

            <Spacer height={hp('3%')} />

            {/* Create Account */}
            <View style={styles.createAccountContainer}>
              <Text style={baseStyle.txtRegular(sizes.size2, colors.gray_7F)}>
                Don't have an account?{' '}
              </Text>

              <TouchableOpacity
                onPress={() => navigationService.navigate(SCREENS.SIGN_UP)}>
                <Text style={baseStyle.txtMedium(sizes.size2, colors.black)}>
                  Create Account
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

            {/* Social Login Buttons */}
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

export default Login;
