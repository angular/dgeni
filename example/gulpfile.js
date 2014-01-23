var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var bower = require('bower');
var docGenerator = require('../lib/index');

gulp.task('clean', function() {
  // We indicate to gulp that this task is async by returning
  // the stream - gulp can then wait for the stream to close before
  // starting dependent tasks - see 'default' task below
  return gulp.src('build', { read: false })
  .pipe(rimraf());
});

gulp.task('assets', ['clean'], function() {
  return gulp.src(['assets/**/*'])
  .pipe(gulp.dest('build'));
});

gulp.task('doc-gen', ['clean'], function() {
  return docGenerator('ngdoc.config.js').generateDocs();
});

gulp.task('default', ['assets', 'doc-gen']);