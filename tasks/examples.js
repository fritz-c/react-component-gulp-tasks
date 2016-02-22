var aliasify     = require('aliasify');
var babelify     = require('babelify');
var browserify   = require('browserify');
var chalk        = require('chalk');
var gutil        = require('gulp-util');
var less         = require('gulp-less');
var merge        = require('merge-stream');
var source       = require('vinyl-source-stream');
var watchify     = require('watchify');
var notify       = require("gulp-notify");
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano      = require('cssnano');

function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end'); // Keep gulp from hanging on this task
}

module.exports = function (gulp, config) {
	function doBundle (target, name, dest) {
		return target.bundle()
			.on('error', handleErrors)
			.pipe(source(name))
			.pipe(gulp.dest(dest))
	}

	function watchBundle (target, name, dest) {
		return watchify(target)
			.on('update', function (scriptIds) {
				scriptIds = scriptIds
					.filter(function (x) { return x.substr(0, 2) !== './'; })
					.map(function (x) { return chalk.blue(x.replace(__dirname, '')); });

				if (scriptIds.length > 1) {
					gutil.log(scriptIds.length + ' Scripts updated:\n* ' + scriptIds.join('\n* ') + '\nrebuilding...');
				} else {
					gutil.log(scriptIds[0] + ' updated, rebuilding...');
				}

				doBundle(target, name, dest);
			})
			.on('time', function (time) {
				gutil.log(chalk.green(name + ' built in ' + (Math.round(time / 10) / 100) + 's'));
			});
	}

	function buildScripts (dev) {
		return merge(targets.map(function(target) {
			var dest = target.dest;
			var opts = dev ? watchify.args : {};
			opts.debug = !!dev;
			opts.hasExports = true;

			return function () {
				var common = browserify(opts);

				var bundle = browserify(opts);
				bundle.transform(babelify, { presets: ["react"] });
				config.aliasify && bundle.transform(aliasify);
				bundle.require('./' + target.src, { expose: target.name });

				var depsBundle = config.commonBundles[target.commonBundle];

				depsBundle.dependencies.forEach(function (pkg) {
					common.require(pkg);
					bundle.exclude(pkg);
				});

				if (dev) {
					watchBundle(common, 'common.js', dest);
					watchBundle(bundle, 'bundle.js', dest);
				}

				var bundles = [
					doBundle(common, 'common.js', dest),
					doBundle(bundle, 'bundle.js', dest)
				];

				return merge(bundles.concat());
			};
		}));
	}

	var targets = config.targetKeys.map(function(targetKey) {
		var target  = config.targets[targetKey];
		target.name = targetKey;
		return target;
	});

	gulp.task('watch:scripts', buildScripts(true));
	gulp.task('build:scripts', buildScripts(false));

	var processors = [
		autoprefixer({ browsers: ['IE >= 8', '> 1%'], cascade: false }),
		cssnano({ zindex: false }),
	];

	gulp.task('build:css', function () {
		var cssBuilds = [];
		config.targetKeys.forEach(function(targetKey) {
			var target = config.targets[targetKey].stylesheets;
			var cssBuild = gulp.src(target.src)
				.pipe(less().on('error', handleErrors))
 				.pipe(postcss(processors).on('error', handleErrors))
				.pipe(gulp.dest(target.dest));

			cssBuilds.push(cssBuild);
		});

		return merge(cssBuilds);
	});

	gulp.task('build', [
		'build:css',
		'build:scripts',
	]);

	gulp.task('watch:css', [
		'build:css'
	], function () {
		buildScripts(true)();
		var watchLESS = [];
		config.targetKeys.forEach(function(targetKey) {
			watchLESS.push(config.targets[targetKey].stylesheets.src);
		});

		gulp.watch(watchLESS, ['build:css']);
	});
};
