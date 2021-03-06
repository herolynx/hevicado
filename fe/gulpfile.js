// IMPORT PLUGINS (just regular node modules)
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    karma = require('karma').server,
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    rev = require('gulp-rev'),
    clean = require('gulp-clean'),
    browserSync = require('browser-sync'),
    reloadBrowser = browserSync.reload,
    templateCache = require('gulp-angular-templatecache'),
    inject = require('gulp-inject'),
    debug = require('gulp-debug');

// LINTS JS CODE
gulp.task('lint', function () {
    return gulp
        .src(['./app/modules/**/js/*.js', 'test/**/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter("default"));
});

// JS CHECK STYLE
gulp.task('jscs', function () {
    return gulp
        .src(['./app/modules/**/js/*.js', 'test/**/*.js'])
        .pipe(jscs());
});

// RUN UNIT TESTS
gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done);
});

// DELETES THE RELEASE DIR
gulp.task('clean', function () {
    return gulp
        .src('release', {read: false})
        .pipe(clean({force: true}));
});

// CREATE AN ANGULAR TEMPLATE CACHE
gulp.task('views', function () {
    return gulp
        .src('./app/modules/**/*.html')
        .pipe(templateCache({
            module: 'hevicado',
            root: 'modules'
        }))
        .pipe(gulp.dest('./app/tmp/js'));
});

// COPY INDEPENDENT ASSETS TO RELEASE DIR (own and 3rd party)
gulp.task('copy:assets', function () {

    gulp.src('./app/css/*.css')
        .pipe(gulp.dest('release/css'));

    gulp.src('./app/fonts/*')
        .pipe(gulp.dest('release/fonts'));

    gulp.src('./app/images/**/*')
        .pipe(gulp.dest('release/images'));

    gulp.src('./app/lang/**/*')
        .pipe(gulp.dest('release/lang'));

    gulp.src('./app/*.txt')
        .pipe(gulp.dest('release'));
});

// CREATE A RELEASE TO THE RELEASE DIR
gulp.task('release', ['clean', 'views', 'less', 'copy:assets'], function () {
    return gulp
        .src('./app/index.html')
        .pipe(inject(
            gulp.src('./app/tmp/js/templates.js', {read: false}),
            {
                starttag: '<!-- inject:templates:js -->',
                ignorePath: './app/tmp/',
                relative: true
            }
        ))
        .pipe(usemin(
            {
                css: [minifyCss(), 'concat'],
                libJs: [uglify(), rev()],
                kunishuJs: [uglify(), rev()]
            }
        ))
        .pipe(gulp.dest('release/'));
});

// STARTS A WEB SERVER FOR THE RELEASE BUILD (for testing the release build locally)
gulp.task('serve:release', function () {
    browserSync({
        server: {
            baseDir: './release'
        },
        port: 8444
    });
});

// PRE-PROCESSES LESS FILE AND OUTPUTS CSS
gulp.task('less', function () {
    return gulp
        .src('./app/css/*.less')
        .pipe(less())
        // auto-prefixes css so you don't need to use vendor prefixes.
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'IE 9']
        }))
        .pipe(gulp.dest('./app/css'))
        // Stream changes to browser if browserSync is on
        .pipe(reloadBrowser({stream: true}));
});

// STARTS A DEVELOPMENT WEB SERVER WHICH RELOADS BROWSER ON CHANGES
gulp.task('serve:dev', ['less'], function () {

    // TODO: add js linting (lint) once we have less errors
    // TODO: add js code style check (jscs) once coding conventions are ok
    // TODO: ...

    // Watch for Less changes
    gulp.watch('./app/**/*.less', ['less']);

    // Watch for CSS changes
    gulp.watch('./app/css/*.css',
        function () {
            reloadBrowser();
        }
    );

    //Watch for language files changes
    gulp.watch('./app/lang/*.json',
        function () {
            reloadBrowser();
        }
    );

    // Watch for JS or template changes
    gulp.watch([
            './app/**/*.js',
            './app/**/*.html',
            './app/index.html'
        ], function () {
            reloadBrowser();
        }
    );


    browserSync({
        server: {
            baseDir: './app'
        },
        port: 8444
    });


});


// START THE DEVELOPMENT WEB SERVER TASK BY DEFAULT IF NO TARGET TASK IS GIVEN
gulp.task('default', ['serve:dev']);

