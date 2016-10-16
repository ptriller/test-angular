const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const tscConfig = require('./tsconfig.json');
const del = require('del');

// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('build/**/*');
});

/**
 * Static Resources
 */
const RES_SRC='src/main/resources/**/*';
const RES_DEST='build/webapp/';

gulp.task('resources', [], function () {
  return gulp
    .src(RES_SRC)
    .pipe(plugins.changed(RES_DEST))
    .pipe(gulp.dest(RES_DEST));
});

gulp.task('watch:resources', [], function () {
  gulp.watch(RES_SRC, ['resources']);
});

/**
 * Code
 */

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

const JS_SRC='src/main/js/**/*.js';
const JS_DEST='build/js/';

gulp.task('copy-js', [], function () {
  return gulp
    .src(JS_SRC)
    .pipe(plugins.debug())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.changed(JS_DEST))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(JS_DEST));
});


gulp.task('copy-deps', [], function () {
  return gulp.src(plugins.npmFiles(), {base:'./node_modules/'}).pipe(gulp.dest('./build/webapp/vendor/'));
});

const JAVASCRIPT_SRC=[ 'build/ts/**/*.js', 'build/js/**/*.js' ];

gulp.task('javascript', ['compile-ts', 'copy-js', 'copy-deps'], function () {
  return gulp
    .src(JAVASCRIPT_SRC)
    .pipe(plugins.debug())
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('build/webapp'));
});

gulp.task('watch:javascript', ['javascript'], function () {
  return gulp.watch([TS_SRC, JS_SRC], ['javascript']);
});


/**
 * CSS
 */

const SASS_SRC="src/main/sass/**/*.scss";
const SASS_DEST='build/sass/';

gulp.task('compile-sass', [], function () {
  return gulp
    .src(SASS_SRC)
    .pipe(plugins.changed(SASS_DEST,{extension: '.css'}))
    .pipe(plugins.debug())
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
    .pipe(gulp.dest('build/webapp'));
});

gulp.task('watch:css', function () {
  return gulp.watch(SASS_SRC, ['css']);
});

/**
 * Meta Targets
 */

gulp.task('build', ['javascript', 'css', 'resources']);
gulp.task('default', plugins.sequence('clean', 'build'));


/**
 * This tasks has a dependency to all tasks that start with "watch:" But only if they are
 * defined before this task in the file. So it has to be the last one.
 */
gulp.task('watch', Object.keys(gulp.tasks).filter(function (item) { return item.startsWith('watch:'); }));



gulp.task('webserver', ['watch'], function() {
  gulp.src('build/webapp')
    .pipe(plugins.webserver({
      livereload: false,
      fallback: 'index.html'
    }));
});

gulp.task('develop', plugins.sequence('clean', 'build', 'webserver'));