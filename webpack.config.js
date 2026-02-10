const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);
const { presets } = require(`${appDirectory}/babel.config.js`);

const compileNodeModules = [
    // Add every react-native package that needs compiling
    'react-native-qrcode-svg',
    'react-native-svg',
    'react-native-reanimated',
    'react-native-gesture-handler',
    'react-native-screens',
    'react-native-safe-area-context',
].map((moduleName) => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
    test: /\.js$|tsx?$/,
    // Add every directory that needs to be compiled by Babel during the build.
    include: [
        path.resolve(appDirectory, 'index.web.js'),
        path.resolve(appDirectory, 'App.tsx'),
        path.resolve(appDirectory, 'src'),
        path.resolve(appDirectory, 'node_modules/react-native-uncompiled'),
        ...compileNodeModules,
    ],
    use: {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
            presets,
            plugins: ['react-native-web'],
        },
    },
};

const svgLoaderConfiguration = {
    test: /\.svg$/,
    use: [
        {
            loader: '@svgr/webpack',
        },
    ],
};

const imageLoaderConfiguration = {
    test: /\.(gif|jpe?g|png)$/,
    use: {
        loader: 'url-loader',
        options: {
            name: 'assets/[contenthash][ext]',
            esModule: false,
        },
    },
};

module.exports = {
    entry: {
        app: path.join(__dirname, 'index.web.js'),
    },
    output: {
        path: path.resolve(appDirectory, 'dist'),
        publicPath: '/',
        filename: 'rnw.bundle.js',
    },
    resolve: {
        extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
        alias: {
            'react-native$': 'react-native-web',
            'react-native-vision-camera': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            'react-native-fs': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            'react-native-device-info': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            'react-native-biometrics': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            'react-native-geolocation-service': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            'react-native-image-picker': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            'react-native-print': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            'react-native-webview': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            '@react-native-community/blur': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            'react-native-document-picker': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
            '@viro-community/react-viro': path.resolve(appDirectory, 'src/mocks/native-modules.js'),
        },
    },
    module: {
        rules: [
            babelLoaderConfiguration,
            imageLoaderConfiguration,
            svgLoaderConfiguration,
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public/index.html'),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __DEV__: JSON.stringify(true),
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    devServer: {
        open: true,
    },
};
