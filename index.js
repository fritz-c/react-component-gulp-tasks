var defaults = require('defaults');
var capitalize = require('capitalize');
var camelCase = require('camelcase');
var parseArgs = require('minimist');

// Extract package.json metadata
function readPackageJSON () {
	var pkg = JSON.parse(require('fs').readFileSync('./package.json'));
	var dependencies = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
	var peerDependencies = pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : [];

	return {
		name: pkg.name,
		deps: dependencies.concat(peerDependencies),
		aliasify: pkg.aliasify
	};
}

function readCommandLineArguments(config) {
	var knownOptions = {
		string  : [
			'targets',
		],
		default : {
			targets: process.env.GULP_BUILD_TARGETS || Object.keys(config.targets)[0],
		}
	};

	return parseArgs(process.argv.slice(2), knownOptions);
}

/**
 * This package exports a function that binds tasks to a gulp instance
 * based on the provided config.
 */
function initTasks (gulp, config) {
	var pkg    = readPackageJSON();
	var clArgs = readCommandLineArguments(config);
	var targetKeys = clArgs.targets instanceof Array ? clArgs.targets : clArgs.targets.split(' ');

	config = defaults(config, {
		aliasify   : pkg.aliasify,
		targetKeys : targetKeys,
	});

	require('./tasks/examples')(gulp, config);

	gulp.task('default', ['watch']);
	gulp.task('deploy', ['deploy:css', 'deploy:scripts']);
}

module.exports = initTasks;
module.exports.readPackageJSON = readPackageJSON;
