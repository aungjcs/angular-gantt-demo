module.exports = {
    entry: {
        watch: ['./watch.js']
    },
    output: {
        path: './dist',
        filename: '[name].bundle.js'
    },
    devServer: {
        contentBase: '.',
        host: 'localhost',
        inline: true,
        port: 3010,
        publicPath: '/dist'
    }
};
