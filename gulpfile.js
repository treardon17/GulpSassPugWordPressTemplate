//
// ─── DEPENDENCIES ───────────────────────────────────────────────────────────────
//
var gulp = require('gulp');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var pug = require('gulp-pug');
var data = require('gulp-data');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var php = require('gulp-connect-php');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var prefix = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var argv = require('yargs').argv;
// ────────────────────────────────────────────────────────────────────────────────

//
// ─── GULP PARAMETERS ────────────────────────────────────────────────────────────
//
var statics = {
    wordpress: (argv.wordpress == undefined) ? false : true,
    isPHP: (argv.php == undefined) ? false : true
}
// ────────────────────────────────────────────────────────────────────────────────

//
// ─── DIRECTORIES ────────────────────────────────────────────────────────────────
//
var paths = {
    build: {
        root: './public/',
        css: './public/resources/css/',
        js: './public/resources/js/',
        forms: './public/resources/forms/',
        images: './public/resources/images/',
        partials: './public/resources/partials',
    },
    dev: {
        root: './src/',
        pages: './src/pages/',
        components: './src/components/',
        images: './src/resources/images/',
        forms: './src/resources/forms/',
        data: './src/resources/data/data.json',
    }
}
// ────────────────────────────────────────────────────────────────────────────────

//
// ─── TASKS ──────────────────────────────────────────────────────────────────────
//
//Create the html from the pug template files.
//File names will match --> index.pug == index.php
gulp.task('pug-pages', ()=>{
    return gulp.src(paths.dev.pages + '**/*.pug')
    .pipe(data(()=>{
        let jsonFile = JSON.parse(fs.readFileSync(paths.dev.data));
        var data = _.assign({}, jsonFile, statics);
        return data;
    }))
    .pipe(pug({
        pretty: true,
    }))
    .pipe(rename({
        extname: statics.isPHP ? '.php' : '.html'
    }))
    .pipe(gulp.dest(paths.build.root));
});

//Generate the pug partials and place them in a directory in the build folder
// called 'partials'
gulp.task('pug-components', ()=>{
    return gulp.src(paths.dev.components + '**/*.pug')
    .pipe(data(()=>{
        let jsonFile = JSON.parse(fs.readFileSync(paths.dev.data));
        var data = _.assign({}, jsonFile, statics);
        return data;
    }))
    .pipe(pug({
        pretty: true
    }))
    .pipe(rename({
        dirname: '',
        extname: statics.isPHP ? '.php' : '.html'
    }))
    .pipe(gulp.dest(paths.build.partials));
});

gulp.task('pug', ['pug-pages', 'pug-components'],()=>{});

//Compile the sass into CSS
gulp.task('sass', ()=>{
    return gulp.src(paths.dev.root + '**/*.scss')
    .pipe(sass({
        // outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(paths.build.css));
});

//Transpile ES6 Javascript
gulp.task('js', ()=>{
    return gulp.src(paths.dev.root + '**/*.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(rename({
        dirname: ''
    }))
    .pipe(gulp.dest(paths.build.js));
});

//Adds files to process forms
gulp.task('php-forms', ()=>{
    return gulp.src(paths.dev.forms + '**/*.php')
    .pipe(gulp.dest(paths.build.forms));
});

//Optimize images
gulp.task('images', ()=>{
    return gulp.src(paths.dev.images+'**/*')
    .pipe(imagemin())
    .pipe(gulp.dest(paths.build.images));
});

//Start a php server so we can look at our generated php files
gulp.task('php-serve', ()=>{
    php.server({base: paths.build.root, port: 8020, keepalive: true});
});

//Set up browser-sync server
gulp.task('browser-sync', ['sass', 'pug', 'js', 'images', 'php-forms', 'php-serve'], ()=>{
    browserSync.init({
        proxy: '127.0.0.1:8020',
        port: 8080,
        open: true,
    });
});

//Set up browser-sync server (html)
gulp.task('browser-sync-html', ['sass', 'pug', 'js', 'images', 'php-forms'], ()=>{
    browserSync.init({
        server: {
            baseDir: paths.build.root
        },
        notify: false,
        watchOptions:{
            ignored: 'node_modules/*'
        }
    });
});

//Watch for changes
gulp.task('watch',()=>{
    gulp.watch(paths.dev.root + '**/*.scss', ['sass']).on('change', ()=>{browserSync.reload()});
    gulp.watch(paths.dev.root + '**/*.pug', ['pug']).on('change', ()=>{browserSync.reload()});
    gulp.watch(paths.dev.root + '**/*.js', ['js']).on('change', ()=>{browserSync.reload()});
    gulp.watch(paths.dev.images + '**/*.[png | PNG | jpe?g | JPE?G]', ['images']).on('change', ()=>{browserSync.reload()});
    gulp.watch(paths.build.root + '**/*.php').on('change', ()=>{browserSync.reload()});
});

//Build and compile everything
gulp.task('build', ['sass', 'pug', 'js', 'images', 'php-forms']);

//Default task
if(statics.isPHP){
    gulp.task('default', ['browser-sync', 'watch']);
}else{
    gulp.task('default', ['browser-sync-html', 'watch']);
}
