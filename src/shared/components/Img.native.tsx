import React from 'react';
import FastImage, { FastImageProps } from 'react-native-fast-image';

// Native Implementation
const Img: React.FC<FastImageProps> = (props) => {
    // Map string resizeMode to FastImage.resizeMode enum if needed
    const resizeModeMap: { [key: string]: any } = {
        'contain': FastImage.resizeMode.contain,
        'cover': FastImage.resizeMode.cover,
        'stretch': FastImage.resizeMode.stretch,
        'center': FastImage.resizeMode.center,
    };

    const mode = typeof props.resizeMode === 'string' ? resizeModeMap[props.resizeMode] : props.resizeMode;

    return <FastImage {...props} resizeMode={mode || FastImage.resizeMode.cover} />;
};

export default Img;
