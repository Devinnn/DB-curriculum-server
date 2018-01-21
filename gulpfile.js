var gulp = require('gulp');
var babel = require('gulp-babel');
const config = {
    source: ['src/**/*'],
    dest: 'build'
};
gulp.task('babel-transform', function() {
    return gulp
        .src(config.source)
        .pipe(babel())
        .pipe(gulp.dest(config.dest));
});
