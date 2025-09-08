const { src, dest, watch, parallel, series} = require('gulp');

const scss         = require('gulp-sass')(require('sass'));
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer').default;
const imagemin     = require('gulp-imagemin'); 
const del          = require('del');

function browserSyncFunction(){
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}

function cleanDist(){
    return del('dist')
}

function minImages(){
    return src('app/images/**/*', { encoding: false })
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {
                        name: 'removeViewBox',
                        active: true
                    },
                    {
                        name: 'cleanupIDs',
                        active: false
                    }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function buildScripts(){
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function buildStyles(){
    return src('app/scss/style.scss')
        .pipe(scss({style: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function build(){
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching(){
    watch(['app/scss/**/*.scss'], buildStyles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], buildScripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.buildStyles         = buildStyles
exports.watching            = watching;
exports.browserSyncFunction = browserSyncFunction;
exports.buildScripts        = buildScripts;
exports.cleanDist           = cleanDist;
exports.minImages           = minImages;

exports.build               = series(cleanDist, minImages, build);
exports.default = parallel(buildScripts, browserSyncFunction, watching);