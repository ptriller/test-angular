const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const tscConfig = require('./tsconfig.json');
const del = require('del');

// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('build/**/*');
});

const TS_SRC='src/main/ts/**/*.ts';
const TS_DEST='build/ts/';

// TypeScript compile
gulp.task('compile-ts', [], function () {
  return gulp
    .src(TS_SRC)
    .pipe(plugins.changed(TS_DEST,{extension: '.js'}))
    .pipe(plugins.debug())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.typescript(tscConfig.compilerOptions))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(TS_DEST));
});

const JS_SRC='build/ts/**/*.js';

gulp.task('javascript', ['compile-ts'], function () {
  return gulp
    .src(JS_SRC)
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.concat('all.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('build/app'));
});

const SASS_SRC="src/main/sass/**/*.scss";
const SASS_DEST='build/sass/';

gulp.task('compile-sass', [], function () {
  return gulp
    .src(SASS_SRC)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(SASS_DEST));
});

gulp.task('css', ['compile-sass'], function () {
  return gulp
    .src('build/sass/**/*.css')
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.concat('all.css'))
    .pipe(plugins.uglifycss({ maxLineLen: 500, expandVars: true }))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('build/app'));
});

gulp.task('build', ['javascript', 'css']);
gulp.task('default', plugins.sequence('clean', 'build'));
