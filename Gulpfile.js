var gulp = require('gulp'),
    $    = require('gulp-load-plugins')({
      pattern: ['gulp-*', 'del', 'main-bower-files', 'browser-sync', 'open']
    });

gulp.task('clean', function (cb) {
  $.del('public', cb);
});

gulp.task('bower', function () {
  gulp
    .src($.mainBowerFiles())
    .pipe($.concat('build.js'))
    .pipe(gulp.dest('public/lib'));
  // gulp
  //   .src($.mainBowerFiles('**/*.css'))
  //   .pipe($.concat('build.css'))
  //   .pipe(gulp.dest('public/lib'));
});

gulp.task('jade:dev', function () {
  gulp
    .src(['src/**/*.jade', '!src/**/_*.jade'])
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest('public'));
});

// gulp.task('jade:prod', function () {
//   gulp
//     .src(['src/**/*.jade', '!src/**/_*.jade'])
//     .pipe($.sourcemaps.init())
//     .pipe($.jade())
//     .pipe($.sourcemaps.write())
//     .pipe(gulp.dest('public'));
// });

gulp.task('sass:dev', function () {
  gulp
    .src('src/_styles/main.scss')
    .pipe($.sass()
      .on('error', $.sass.logError))
    .pipe(gulp.dest('public/css'));
});

// gulp.task('sass:prod', function () {
//   gulp
//     .src('src/_styles/main.scss')
//     .pipe($.sourcemaps.init())
//     .pipe($.sass({
//       outputStyle: 'compressed'
//       })
//       .on('error', $.sass.logError))
//     .pipe($.autoprefixer({
//       browsers: ['> 1%'],
//       cascade: true
//     }))
//     //.pipe($.minifyCss({compatibility: 'ie8'}))
//     .pipe($.sourcemaps.write())
//     .pipe(gulp.dest('public/css'));
// });

gulp.task('js:dev', function () {
  gulp.src('src/**/*.js')
    .pipe($.babel())
    .pipe(gulp.dest('public'));
});

// gulp.task('js:prod', function () {
//   gulp.src('src/**/*.js')
//     .pipe($.sourcemaps.init())
//     .pipe($.babel())
//     .pipe($.uglify())
//     .pipe($.sourcemaps.write())
//     .pipe(gulp.dest('public'));
// });

gulp.task('browser-sync', function() {
    $.browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
});

gulp.task('copy', function () {
  gulp.src('src/CNAME')
    .pipe(gulp.dest('public'));
  gulp.src('src/images/**/*')
    .pipe(gulp.dest('public/images'));
  gulp.src('src/sounds/**/*')
    .pipe(gulp.dest('public/sounds'));
});

gulp.task('open', function () {
  $.open('http://hitme.tehcode.com');
});

//gulp.task('build:prod', ['jade:prod', 'sass:prod', 'js:prod', 'bower', 'copy']);
gulp.task('build:dev', ['jade:dev', 'sass:dev', 'js:dev', 'bower', 'copy']);

gulp.task('serve', ['build:dev'], function () {
  gulp.start('browser-sync');
  gulp.watch(['src/**/*.jade'], ['jade:dev']).on('change', $.browserSync.reload);
  gulp.watch(['src/**/*.scss'], ['sass:dev']).on('change', $.browserSync.reload);
  gulp.watch(['src/**/*.js'], ['js:dev']).on('change', $.browserSync.reload);
 // gulp.watch(['src/**/*', '!src/**/*.jade', '!src/**/*.scss', '!src/**/*.js'], ['build:dev']).on('change', $.browserSync.reload);
});

gulp.task('default', ['clean'], function () {
  gulp.start('serve');
});
