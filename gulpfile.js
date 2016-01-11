var gulp = require('gulp');
var uglify = require('gulp-uglify');
var bower = require('gulp-bower');
var filter = require('gulp-filter');
var mainBowerFiles = require('main-bower-files');

gulp.task('bower', function() {
  return bower();
});

gulp.task('main', function(){
	return gulp.src(mainBowerFiles())
		.pipe(filter(['*.js', '!*.min.js']))
		.pipe(gulp.dest('public/lib'))
		.pipe(uglify())       
		.pipe(gulp.dest('dist/lib'));
});