var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var replace = require("replace");

var paths = {
    sass: ['./scss/**/*.scss'],
    controllers: ['./www/js/controllers/*.js'],
    services:['./www/js/services/*.js']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.controllers, ['concat-controllers']);
    gulp.watch(paths.services, ['concat-services']);
});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});

gulp.task('concat-controllers', function() {
    return gulp.src('./www/js/controllers/*.js')
        .pipe(concat('controllers.js'))
        .pipe(gulp.dest('./www/js/'));
});

gulp.task('concat-services', function() {
    return gulp.src('./www/js/services/*.js')
        .pipe(concat('services.js'))
        .pipe(gulp.dest('./www/js/'));
});

var replaceFiles = ['./www/js/constants.js'];

gulp.task('add-monitoring-proxy', function() {
    return replace({
        regex: "http://imfpush.ng.bluemix.net/imfpush/v1/apps",
        replacement: "http://localhost:8100/push/api",
        paths: ["./www/js/constants.js"],
        recursive: false,
        silent: false,
    });
});

gulp.task('add-proxy', ['add-monitoring-proxy'], function() {
    return replace({
        regex: "https://ddb2d6fd-f74e-47f0-a758-b72fba205934-bluemix.cloudant.com/result/_design/views",
        replacement: "http://localhost:8100/healthcheck/api",
        paths: ["./www/js/constants.js"],
        recursive: false,
        silent: false,
    });
});

gulp.task('remove-monitoring-proxy', function() {
    return replace({
        regex: "http://localhost:8100/push/api",
        replacement: "http://imfpush.ng.bluemix.net/imfpush/v1/apps/",
        paths: replaceFiles,
        recursive: false,
        silent: false,
    });
});

gulp.task('remove-proxy', ['remove-monitoring-proxy'], function() {
    return replace({
        regex: "http://localhost:8100/healthcheck/api",
        replacement: "https://ddb2d6fd-f74e-47f0-a758-b72fba205934-bluemix.cloudant.com/result/_design/views",
        paths: replaceFiles,
        recursive: false,
        silent: false,

    });
});
