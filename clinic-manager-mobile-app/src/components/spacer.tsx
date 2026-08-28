import React from 'react';
import { View, ViewProps } from 'react-native';

interface SpacerProps extends ViewProps {
  height?: number;
  width?: number;
}

const Spacer: React.FC<SpacerProps> = ({ height = 0, width = 0, ...rest }) => {
  return <View style={{ height, width }} {...rest} />;
};

export default Spacer;
