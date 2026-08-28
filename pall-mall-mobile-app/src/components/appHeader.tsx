import Logo from '@images/logo.svg';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {widthPercentageToDP} from '@utils/helpers';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../constant/theme';
// import {useNotifications} from '../context/NotificationProvider';

export type HeaderType = 'primary' | 'secondary' | 'tertiary';

interface AppHeaderProps {
  type: HeaderType;
  title?: string;
  leftIcon?: string;
  rightIcons?: string[];
  onLeftPress?: () => void;
  onRightPress?: (iconName: string) => void;
  isRightIcons?: boolean;
}

const headerConfigs = {
  primary: {
    showHamburger: true,
    showLogo: true,
    showTitle: false,
  },
  secondary: {
    showHamburger: false,
    showLogo: false,
    showTitle: true,
  },
  tertiary: {
    showHamburger: false,
    showLogo: false,
    showTitle: true,
  },
};

const AppHeader: React.FC<AppHeaderProps> = ({
  type = 'primary',
  title = '',
  leftIcon,
  rightIcons = ['search', 'notifications-none'],
  onLeftPress,
  onRightPress,
  isRightIcons = true,
}) => {
  const navigation = useNavigation();
  // const {notifications} = useNotifications();
  // const unreadNotifications = notifications.length > 0;
  const config = headerConfigs[type];
  const isPrimary = type === 'primary';
  // const headerBg = !isPrimary ? colors.white : colors.primary;
  const headerBg = colors.white;

  const headerTextColor = isPrimary ? colors.white : colors.primary;
  // const headerIconColor = isPrimary ? colors.white : colors.primary;
  const headerIconColor =  colors.black;


  const renderLeftSection = () => {
    if (config.showHamburger) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          accessibilityLabel="Menu">
          <Icon
            name="menu"
            size={widthPercentageToDP('7%')}
            color={headerIconColor}
          />
        </TouchableOpacity>
      );
    }

    if (leftIcon) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onLeftPress}
          accessibilityLabel="Back">
          <Feather
            name={leftIcon}
            size={widthPercentageToDP('7%')}
            color={headerIconColor}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.iconButton} />;
  };

  const renderCenterSection = () => {
    // if (config.showLogo) {
    //   return (
    //     <View style={styles.logoContainer}>
    //       <Logo width={widthPercentageToDP('30%')} />
    //     </View>
    //   );
    // }

    if (config.showTitle && title) {
      return (
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, {color: headerTextColor}]}>
            {title}
          </Text>
        </View>
      );
    }

    return <View style={styles.centerFlex} />;
  };

  const renderRightSection = () => {
    return (
      <View style={styles.rightSection}>
        {rightIcons.map((iconName, index) => {
          // const showDot =
          // iconName === 'notifications-none' && unreadNotifications; // show dot only on notification icon

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.rightIconButton,
                type === 'secondary' && {
                  backgroundColor: '#ECF5FF',
                  padding: widthPercentageToDP('1.8%'),
                  borderRadius: 50,
                },
              ]}
              onPress={() => {
                if (iconName === 'notifications-none') {
                  // navigationService.navigate(SCREENS.NOTIFICATION);
                } else {
                  onRightPress?.(iconName);
                }
              }}
              accessibilityLabel={iconName}>
              <Icon
                name={iconName}
                size={
                  isPrimary
                    ? widthPercentageToDP('6%')
                    : widthPercentageToDP('5%')
                }
                color={headerIconColor}
              />

              {/* {showDot && (
                <View
                  style={[
                    styles.notificationDot,
                    {
                      backgroundColor: isPrimary ? colors.white : colors.red,
                    },
                  ]}
                />
              )} */}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <View style={[styles.header, {backgroundColor: headerBg}]}>
        {renderLeftSection()}
        {renderCenterSection()}
        {isRightIcons && renderRightSection()}
      </View>
      {/* <View style={styles.bottomShadow} /> */}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPercentageToDP('5%'),
    paddingVertical: widthPercentageToDP('2.5%'),
  },
  bottomShadow: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: widthPercentageToDP('5%'),
  },
  titleContainer: {
    flex: 1,
    marginLeft: widthPercentageToDP('5%'),
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  centerFlex: {
    flex: 1,
  },
  rightIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    gap: widthPercentageToDP('5%'),
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
});

export default AppHeader;
