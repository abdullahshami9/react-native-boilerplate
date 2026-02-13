import React from 'react';
import FastImage, { FastImageProps } from 'react-native-fast-image';

// Native Implementation
const Img: React.FC<FastImageProps> = (props) => {
    return <FastImage {...props} />;
};

export default Img;
