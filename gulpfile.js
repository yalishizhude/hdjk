/*global require*/
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var clean = require('gulp-clean');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var jshint = require('gulp-jshint');
var changed = require('gulp-changed');
var combiner = require('stream-combiner2');
var bower = require('gulp-bower');
var mainBowerFiles = require('main-bower-files');
var gulpIf = require('gulp-if');
var ignore = require('gulp-ignore');
var nodemon = require('gulp-nodemon');

var paths = {
  //第三方插件，由bower管理
  libSrc: 'public/lib',
  libDest: 'dist/lib',
  //业务js，发布时需要压缩和复制
  jsSrc: 'public/js/**/*.js',
  jsDest: 'dist/js',
  //less,编译成css（开发环境）并压缩复制（生产、测试环境）
  lessSrc: 'public/less/**/*.less',
  lessDest: 'public/css',
  cssDest: 'dist/css',
  //image,发布时需要压缩和复制
  imageSrc: 'public/img/**/*',
  imageDest: 'dist/img'
};
(function(){
  'use strict';

  gulp.task('clean', function(){
    return gulp.src(['dist/', 'public/css'])
      .pipe(clean())
      ;
  });

  gulp.task('bower', function(){
    return bower()
    .pipe(gulp.dest(paths.libSrc))
    ;
  });

  gulp.task('lib', ['bower'], function(){
    return gulp.src(mainBowerFiles())
    .pipe(gulp.dest(paths.libSrc))
    .pipe(gulpIf(['*.js', '!*.min.js'], uglify()))
    .pipe(gulpIf(['*.css'], minifyCss()))
    .pipe(gulp.dest(paths.libDest))
    ;
  });

  gulp.task('js', function(){
    var combined = combiner.obj([
      gulp.src(paths.jsSrc),
      changed(paths.jsDest),
      gulpIf(jshint(), jshint.reporter('default')),
      uglify(),
      gulp.dest(paths.jsDest)
    ]);
  });

  gulp.task('minifyCss', function(){
    var combined = combiner.obj([
      gulp.src(paths.lessSrc),
      ignore.exclude('util/*.less'),
      less(),
      livereload(),
      gulp.dest(paths.lessDest)
    ]);
    combined.on('error', console.error.bind(console));
    return combined;
  });

  gulp.task('less', ['minifyCss'], function() {
    var combined = combiner.obj([
      gulp.src(paths.lessDest+'/**/*.css'),
      minifyCss(),
      gulp.dest(paths.cssDest)
    ]);
    combined.on('error', console.error.bind(console));
    return combined;
  });

  gulp.task('image', function(){
    var combined = combiner.obj([
      gulp.src(paths.imageSrc),
      changed(paths.imageDest),
      imagemin({optimizationLevel:1}),
      gulp.dest(paths.imageDest)
    ]);
    combined.on('error', console.error.bind(console));
    return combined;
  });

  gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(paths.libSrc, ['lib']);
    gulp.watch(paths.jsSrc, ['js']);
    gulp.watch(paths.lessSrc, ['less']);
    gulp.watch(paths.imageSrc, ['image']);
  });

  gulp.task('develop', ['watch'],  function () {
    nodemon({ 
      script: 'bin/www', 
      ext: 'hbs js less json'
    })
    .on('restart', function () {
      console.log('restarted!');
    });
  });

  gulp.task('publish', ['clean'], function(){
    gulp.run('js'); 
    gulp.run('lib'); 
    gulp.run('less'); 
    gulp.run('image');
  });

  gulp.task('default', ['publish', 'watch', 'develop']);
})();