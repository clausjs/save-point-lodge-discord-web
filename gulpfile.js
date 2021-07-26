const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

const webpackConfig = require('./webpack.common.js');

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
// function clean(cb) {
//     // body omitted
//     cb();
//   }
  
  // The `build` function is exported so it is public and can be run with the `gulp` command.
  // It can also be used within the `series()` composition.
//   function build(cb) {
//     // body omitted
//     cb();
//   }
  
//   exports.build = build;
//   exports.default = series(clean, build);

function buildTypescript() {
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest('./build'));
}

function copySassToBuild() {
    return gulp.src(path.resolve(__dirname, './src/sass/*.scss'))
            .pipe(gulp.dest(path.resolve(__dirname, './build/sass/')));
}

function runWebpack() {
    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, status) => {
            if (err) {
                return reject(err);
            }

            if (status.hasErrors()) {
                return reject(new Error(status.compilation.errors.join('\n')))
            }

            return resolve();
        });
    });
}

exports.typescript = buildTypescript;
exports.sass = copySassToBuild;
exports.webpack = runWebpack;
exports.default = gulp.series(buildTypescript, copySassToBuild, runWebpack);

