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
    services: ['./www/js/services/*.js']
};

gulp.task('default', ['sass']);

gulp.task('sass', function (done) {
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

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.controllers, ['concat-controllers']);
    gulp.watch(paths.services, ['concat-services']);
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function (done) {
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

gulp.task('concat-controllers', function () {
    return gulp.src('./www/js/controllers/*.js')
        .pipe(concat('controllers.js'))
        .pipe(gulp.dest('./www/js/'));
});

gulp.task('concat-services', function () {
    return gulp.src('./www/js/services/*.js')
        .pipe(concat('services.js'))
        .pipe(gulp.dest('./www/js/'));
});

var replaceFiles = ['./www/js/constants.js'];

gulp.task('add-proxy', function () {
    var replaceVals = [
        {
            regex: "https://ddb2d6fd-f74e-47f0-a758-b72fba205934-bluemix.cloudant.com/sbr2-result/_design/latestTransactionEVTE/_view",
            replacement: "http://localhost:8100/healthcheck/api"
        },
        {
            regex: "https://imfpush.ng.bluemix.net/imfpush/v1/apps",
            replacement: "http://localhost:8100/push/api"
        },
        {
            regex: "https://56939a1c-0f09-4532-9afa-51f16eb2b2fc-bluemix.cloudant.com/randm_incidents",
            replacement: "http://localhost:8100/incidents/api",
        },
        {
            regex: "https://56939a1c-0f09-4532-9afa-51f16eb2b2fc-bluemix.cloudant.com/randm_announcements",
            replacement: "http://localhost:8100/announcements/api",
        }];

        for (var index = 0; index < replaceVals.length; index++) {
            var element = replaceVals[index];
            replace({
                    regex: element.regex,
                    replacement: element.replacement,
                    paths: ["./www/js/constants.js"],
                    recursive: false,
                    silent: false,
            });
         };
});

gulp.task('remove-monitoring-proxy', function () {
    return replace({
        regex: "http://localhost:8100/push/api",
        replacement: "https://imfpush.ng.bluemix.net/imfpush/v1/apps",
        paths: replaceFiles,
        recursive: false,
        silent: false,
    });
});

gulp.task('remove-proxy', ['remove-monitoring-proxy'], function () {
    var replaceVals = [
        { regex: "http://localhost:8100/healthcheck/api", replacement: "https://ddb2d6fd-f74e-47f0-a758-b72fba205934-bluemix.cloudant.com/sbr2-result/_design/latestTransactionEVTE/_view" },
        { regex: "http://localhost:8100/incidents/api", replacement: "https://56939a1c-0f09-4532-9afa-51f16eb2b2fc-bluemix.cloudant.com/randm_incidents" },
        { regex: "http://localhost:8100/announcements/api", replacement: "https://56939a1c-0f09-4532-9afa-51f16eb2b2fc-bluemix.cloudant.com/randm_announcements" }
    ];
    for (var index = 0; index < replaceVals.length; index++) {
        var element = replaceVals[index];
        replace({
            regex: element.regex,
            replacement: element.replacement,
            paths: replaceFiles,
            recursive: false,
            silent: false,
        });

    }
});
