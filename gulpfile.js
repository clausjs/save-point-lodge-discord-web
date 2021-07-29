const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

const DEV = "dev", PROD = "prod";

const webpackConfigCommon = require('./webpack.common.js');
const webpackConfigDev = require('./webpack.dev.js');
const webpackConfigProd = require('./webpack.prod.js');

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

function runWebpack(env) {
    return new Promise((resolve, reject) => {
        let config;

        switch (env) {
            case DEV:
                config = webpackConfigDev;
                break;
            case PROD:
                config = webpackConfigProd;
                break;
            default:
                config = webpackConfigCommon;
                break;
        }

        webpack(config, (err, status) => {
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

function runWebpackDev() {
    return runWebpack(DEV);
}

function runWebpackProd() {
    return runWebpack(PROD);
}


exports.typescript = buildTypescript;
exports.sass = copySassToBuild;
exports.webpack = runWebpack;
exports.dev = gulp.series(buildTypescript, copySassToBuild, runWebpackDev);
exports.prod = gulp.series(buildTypescript, copySassToBuild, runWebpackProd);
exports.default = gulp.series(buildTypescript, copySassToBuild, runWebpack);

