var gulp = require('gulp');
var gutil = require('gulp-util');
var rimraf = require('gulp-rimraf');
var bower = require('bower');
var docGenerator = require('../lib/index');
var merge = require('event-stream').merge;
var express = require('express');


// We indicate to gulp that tasks are async by returning the stream.
// Gulp can then wait for the stream to close before starting dependent tasks.
// See clean and bower for async tasks, and see assets and doc-gen for dependent tasks below

gulp.task('clean', function() {
  return gulp.src('build', { read: false })
  .pipe(rimraf());
});

gulp.task('bower', function() {
  return bower.commands.install();
});

gulp.task('assets', ['bower', 'clean'], function() {
  return merge(
    gulp.src(['config/assets/**/*']).pipe(gulp.dest('build')),
    gulp.src('bower_components/components-font-awesome/**').pipe(gulp.dest('build/components/font-awesome')),
    gulp.src('bower_components/bootstrap/dist/**').pipe(gulp.dest('build/components/bootstrap')),
    gulp.src('bower_components/lunr.js/*.js').pipe(gulp.dest('build/components/lunr.js')),
    gulp.src('bower_components/jquery/*.js').pipe(gulp.dest('build/components/jquery')),
    gulp.src('node_modules/marked/**/*.js').pipe(gulp.dest('build/components/marked'))
  );
});


gulp.task('doc-gen', ['clean'], function() {
  return docGenerator('config/ngdoc.config.js').generateDocs();
});


// The default task that will be run if no task is supplied
gulp.task('default', ['assets', 'doc-gen']);


// Watch the files and run the default task when something changes
gulp.task('watch', function() {
  return gulp.watch([
    'content/**/*',
    'src/**/*',
    'config/**/*',
    '../lib/**/*',
    '../packages/**/*'
  ], function() {
    // I couldn't providing an array of tasks to run to work so had to go with a callback and gulp.run()
    return gulp.run('default');
  });
});


// A simple server that can cope with HTML5 deep links
gulp.task('server', function() {
  var port = 8000;
  var build = gulp.env.type || '';
  var indexPage = ['index',build].join('-') + '.html';
  var app = express();
  // Log requests to the console
  app.use(express.logger());
  // If the file exists then supply it
  app.use(express.static('build'));
  // Otherwise just send the index.html for other files to support HTML5Mode
  app.all('/*', function(req, res) {
    res.sendfile(indexPage, { root: 'build' });
  });
  app.listen(port, function() {
    gutil.log('Server listening on port', gutil.colors.magenta(port));
  });
});