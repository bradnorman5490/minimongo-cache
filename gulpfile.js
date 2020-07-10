var { src, series, dest } = require("gulp");
var babel = require('gulp-babel');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var browserify = require('browserify');
var streamConvert = require('vinyl-source-stream');
var glob = require('glob');
var uglify = require('gulp-uglify');
var coffeeify = require('coffeeify');
var buffer = require('vinyl-buffer');
var rename = require("gulp-rename");
const { compile } = require("coffeeify");

// compilation
function compileCoffee (cb) {
	return src('./src/*.coffee')
		.pipe(coffee({ bare: true }).on('error', console.log))
		.pipe(dest('./lib'));
	cb();
}

function copy (cb) {
	return src(['./src/**/*.js'])
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(dest('./lib'));
}

function prepareTests (cb) {
	var bundler = browserify({ entries: glob.sync('./test/*Tests.coffee'), extensions: [".coffee"] })
		.transform(coffeeify);
	var stream = bundler.bundle()
		.on('error', gutil.log)
		.on('error', function () {
			throw 'Failed';
		})
		.pipe(streamConvert('browserified.js'))
		.pipe(dest('./test'));
	return stream;
}

function dist () {
	var bundler = browserify();
	bundler.require('./index.js', { expose: 'minimongo' });
	return bundler.bundle()
		.pipe(streamConvert('minimongo.js'))
		.pipe(dest('./dist/'))
		.pipe(buffer())
		.pipe(rename('minimongo.min.js'))
		.pipe(uglify())
		.pipe(dest('./dist/'));
}

exports.default = series(compileCoffee, copy, dist)