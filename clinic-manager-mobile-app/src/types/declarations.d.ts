// Declare SVG as React component
declare module '*.svg' {
  import React from 'react';
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Declare PNG, JPG, JPEG, GIF as ImageSourcePropType
declare module '*.png' {
  import {ImageSourcePropType} from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpg' {
  import {ImageSourcePropType} from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpeg' {
  import {ImageSourcePropType} from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.gif' {
  import {ImageSourcePropType} from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}
declare module '@env' {
  export const BASE_URL: string;
  export const AI_BASE_URL: string;
  export const APP_ENV: string;
}
