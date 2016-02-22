module.exports = function (gulp, config) {
    gulp.task('dev', ['watch:css', 'watch:scripts']);
	gulp.task('deploy', ['build:css', 'build:scripts']);
};
