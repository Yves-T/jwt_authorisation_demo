module.exports = {
    entry: './src',
    output: {
        path: 'builds',
        filename: 'bundle.js',
        publicPath: 'builds/'
    },
    devtool: 'source-map',
    devServer: {
        hot: true
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel' // 'babel-loader' is also a legal name to reference
        }]
    }
};