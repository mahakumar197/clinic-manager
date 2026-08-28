import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import Svg, {Path} from 'react-native-svg';

interface HalfWaveButtonProps {
  onPress?: () => void;
  width?: number;
  height?: number;
}

const CustomSvg = () => (
  <Svg width={193} height={108} viewBox="0 0 193 108" fill="none">
    <Path
      d="M60.1035 20.3613C81.0302 10.3602 104.005 7.27643 124.636 14.335C145.753 21.5598 162.747 37.9589 172.76 58.7705C182.795 79.6278 184.854 103.207 177.577 124.667C169.984 147.059 154.506 165.934 133.824 174.948C114.297 183.459 91.3395 180.286 68.7041 171.649C47.2356 163.458 29.2406 150.09 19.6562 131.102C9.47609 110.933 7.53706 87.5073 15.0889 66.6748C22.4944 46.2461 39.2535 30.3259 60.1035 20.3613Z"
      fill="#018EA5"
      stroke="#89CDD3"
      strokeWidth={21}
    />
    <Path
      d="M86.5131 68.9091V82H84.1225L78.4272 73.7607H78.3313V82H75.5636V68.9091H77.9925L83.6431 77.142H83.7582V68.9091H86.5131ZM88.7999 82V68.9091H97.6209V71.1911H91.5676V74.3104H97.1671V76.5923H91.5676V79.718H97.6465V82H88.7999ZM102.417 68.9091L105.056 73.3707H105.159L107.811 68.9091H110.937L106.942 75.4545L111.027 82H107.843L105.159 77.532H105.056L102.372 82H99.2013L103.299 75.4545L99.2781 68.9091H102.417ZM112.19 71.1911V68.9091H122.941V71.1911H118.934V82H116.198V71.1911H112.19Z"
      fill="white"
    />
  </Svg>
);

export const HalfWaveButton: React.FC<HalfWaveButtonProps> = ({
  onPress,
  width = 193,
  height = 108,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width,
        height,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf:"center"
      }}>
      <CustomSvg />
    </TouchableOpacity>
  );
};
