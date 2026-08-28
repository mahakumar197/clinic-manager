import React, {useCallback, useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {FlatList, Text, TextStyle, TouchableOpacity, View} from 'react-native';

// styles
import {useFocusEffect} from '@react-navigation/native';
import Spacer from '@components/spacer';

// constants
import {CONDITION_STRINGS} from '../constant/strings';
import {baseStyle, colors, sizes} from '../constant/theme';
// helpers
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from '@utils/helpers';

export interface RadioButtonItem {
  label: string;
  value: string | number;
}

export interface CustomRadioButtonProps {
  name: string;
  type?: string;
  data: RadioButtonItem[];
  activeTextColor?: string;
  inActiveTextColor?: string;
  customLabelStyles?: TextStyle;
  rules?: object;
  label?: string;
  onChangeRes?: (value: string | number) => void;
  isReq?: boolean;
  titleColor?: string;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  label,
  name,
  type,
  data,
  activeTextColor = colors.black,
  inActiveTextColor = colors.black,
  customLabelStyles,
  rules,
  onChangeRes,
  isReq = false,
  titleColor = colors.gray_7F,
}) => {
  const {control} = useFormContext();
  const isVertical = type === CONDITION_STRINGS.vertical;

  const RadioCircle = ({selected}: {selected: boolean}) => (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: selected ? 0 : 2,
        borderColor: colors.gray_7F,
        backgroundColor: selected ? colors.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {selected && (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.white,
          }}
        />
      )}
    </View>
  );

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {onChange, value}, fieldState: {error}}) => {
        const [itemSelected, setItemSelected] =
          useState<RadioButtonItem | null>(
            data.find(item => item.value === value) ?? null,
          );

        useFocusEffect(
          useCallback(() => {
            setItemSelected(data.find(item => item.value === value) ?? null);
            return () => {};
          }, [value]),
        );

        const onItemPress = (item: RadioButtonItem) => {
          setItemSelected(item);
          onChange(item.value);
          onChangeRes?.(item?.value);
        };

        const renderItem = ({item}: {item: RadioButtonItem}) => {
          const isItemSelected = item.value === itemSelected?.value;

          return (
            <TouchableOpacity
              onPress={() => onItemPress(item)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <RadioCircle selected={isItemSelected} />
              <Spacer width={wp('2%')} />

              <Text
                style={[
                  baseStyle.txtRegular(
                    sizes.size2,
                    isItemSelected ? activeTextColor : inActiveTextColor,
                  ),
                  customLabelStyles,
                ]}>
                {item.label || '--'}
              </Text>
            </TouchableOpacity>
          );
        };

        const itemSeparatorComponent = () =>
          isVertical ? (
            <Spacer height={hp('1.5%')} />
          ) : (
            <Spacer width={wp('8%')} />
          );

        return (
          <View>
            {label && (
              <>
                <Text
                  style={[
                    baseStyle.txtRegular(sizes.size2, titleColor),
                    {fontWeight: 600},
                  ]}>
                  {label}
                  {isReq && (
                    <Text
                      style={[baseStyle.txtRegular(sizes.size2, colors.red)]}>
                      {' '}
                      *
                    </Text>
                  )}
                </Text>
                <Spacer height={hp('1.5%')} />
              </>
            )}
            <FlatList
              data={data}
              renderItem={renderItem}
              horizontal={!isVertical}
              ItemSeparatorComponent={itemSeparatorComponent}
              keyExtractor={(item, index) =>
                `${item.label || index}RadioButtonItem`
              }
              ListEmptyComponent={() => <></>}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={{flexGrow: 0}}
            />
            {error && (
              <>
                <Spacer height={hp('1%')} />
                <Text style={[baseStyle.txtRegular(sizes.size02, colors.red)]}>
                  {error.message}
                </Text>
              </>
            )}
          </View>
        );
      }}
    />
  );
};

export default CustomRadioButton;
