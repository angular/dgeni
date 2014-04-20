var gulp = require('gulp');
var traceur = require('gulp-traceur');
var jasmine = require('jasmine-node');
var rimraf = require('rimraf');

var path = {
  src: './src/**/*.js',
  test: './test/**/*.js'
};

var traceurOptions = {
  modules: 'commonjs',
  types: true,
  annotations: true,
  typeAssertions: true,
  typeAssertionModule: 'rtts-assert'
};

gulp.task('build-test', function() {
  return gulp.src(path.test)
      .pipe(traceur(traceurOptions))
      .pipe(gulp.dest('compiled/test'));
});

gulp.task('build-src', function() {
  return gulp.src(path.src)
      .pipe(traceur(traceurOptions))
      .pipe(gulp.dest('compiled/src'));
});

gulp.task('build', ['build-src', 'build-test']);

gulp.task('test', ['build'], function(done) {
  jasmine.executeSpecsInFolder({
    specFolders: ['./compiled/test'],
    onComplete: function(runner, log) {
      console.log('done');
      done(runner.results().failedCount !== 0);
    }
  });
});

gulp.task('clean', function(done) {
  rimraf('./compiled', done);
});

gulp.task('default', ['clean', 'build']);