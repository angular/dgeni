var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var bower = require('bower');
var docGenerator = require('../lib/index');
var merge = require('event-stream').merge;

gulp.task('clean', function() {
  // We indicate to gulp that this task is async by returning
  // the stream - gulp can then wait for the stream to close before
  // starting dependent tasks - see 'default' task below
  return gulp.src('build', { read: false })
  .pipe(rimraf());
});

gulp.task('bower', function() {
  return bower.commands.install();
});

gulp.task('assets', ['bower', 'clean'], function() {
  return merge(
    gulp.src(['assets/**/*']).pipe(gulp.dest('build')),
    gulp.src('bower_components/components-font-awesome/**').pipe(gulp.dest('build/components/font-awesome')),
    gulp.src('bower_components/bootstrap/dist/**').pipe(gulp.dest('build/components/bootstrap')),
    gulp.src('bower_components/lunr.js/*.js').pipe(gulp.dest('build/components/lunr.js')),
    gulp.src('bower_components/jquery/*.js').pipe(gulp.dest('build/components/jquery'))
  );
});

gulp.task('doc-gen', ['clean'], function() {
  return docGenerator('ngdoc.config.js').generateDocs();
});

gulp.task('default', ['assets', 'doc-gen']);

gulp.task('watch', function() {
  gulp.watch(['assets/**', 'content/**', 'src/**', 'ngdoc.config.js'], ['default']);
});