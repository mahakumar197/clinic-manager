import React from "react";
import {SCREENS} from "../../constant";
import AppHeader from "@components/appHeader.tsx";
import {styles} from "@screens/styles/auth";
import CustomSafeArea from "@components/customSafeArea";
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import TextInputComponent from "@components/textInput.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import {signupSchema} from "@schemas/authSchema.ts";
import {FormProvider, useForm} from 'react-hook-form';
import Button from "@components/button.tsx";
import Spacer from "@components/spacer.tsx";
import {heightPercentageToDP as hp} from "@utils/helpers.ts";
import {baseStyle, colors, sizes} from "../../constant/theme.ts";
import navigationService from "@navigation/navigationService.ts";

interface SignUpFormData {
	fullName: string;
	email: string;
}

const ForgetPassword: React.FC = () => {
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
				<Text
					style={[
						baseStyle.txtBold(24, colors.black),
						{textAlign: 'center'},
					]}>
					Forgot Your Password?
				</Text>
				<Spacer height={hp('2%')}/>
				<Text
					style={[
						baseStyle.txtRegular(16, '#7D8A95'),
						{textAlign: 'center', marginHorizontal: 28},
					]}>
					Please input your mobile number to
				</Text>
				<Spacer height={hp('1%')}/>
				<Text
					style={[
						baseStyle.txtRegular(16, colors.black),
						{textAlign: 'center', marginHorizontal: 28},
					]}>
					reset your password.
				</Text>
				<Spacer height={hp('5%')}/>
				<FormProvider {...methods}>
					<View style={styles.formContainer}>
						<TextInputComponent
							name="email"
							label="Email Address / mobile number"
							placeholder="Enter email address"
							type="email"
						/>
						<Spacer height={hp('4%')}/>
						<Button
							label="Submit"
							onPress={handleSubmit(onSubmit)}
							variant="primary"
						/>
					</View>
					<Spacer height={hp('2%')}/>
					<View style={styles.createAccountContainer}>
						<Text style={baseStyle.txtRegular(sizes.size2, colors.gray_7F)}>
							Remembered password?{' '}
						</Text>
						<TouchableOpacity
							onPress={() => navigationService.navigate(SCREENS.LOGIN)}>
							<Text style={baseStyle.txtMedium(sizes.size2, colors.black)}>
								Sign In
							</Text>
						</TouchableOpacity>
					</View>

				</FormProvider>
			</ScrollView>
		</CustomSafeArea>)
}
export default ForgetPassword;