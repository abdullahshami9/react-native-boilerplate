import React from 'react';
import { Image, ImageProps } from 'react-native';

// Web Implementation
const Img: React.FC<ImageProps> = (props) => {
    return <Image {...props} />;
};

export default Img;
