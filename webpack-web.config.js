const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: './app/app.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'build.js'
    },
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.common.js',
        },
    },
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            // {
            //     test: /\.(png|jpg|gif|svg)$/,
            //     loader: 'file',
            //     query: {
            //         name: '[name].[ext]?[hash]'
            //     }
            // }
        ]
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    devtool: '#eval-source-map',
    performance: {
        hints: false
    },
}

// module.exports.plugins = [
//     new webpack.ProvidePlugin({
//         $: "jquery",
//         jQuery: "jquery",
//         jquery: "jquery",
//     }),
// ]

// if (process.env.NODE_ENV === 'production') {
//     module.exports.plugins = [
//         new webpack.DefinePlugin({
//             'process.env': {
//                 NODE_ENV: '"production"'
//             }
//         }),
//         // new webpack.optimize.UglifyJsPlugin({
//         //     compress: {
//         //         warnings: false
//         //     }
//         // })
//     ]
// } else {
//     module.exports.devtool = '#source-map'
// }
