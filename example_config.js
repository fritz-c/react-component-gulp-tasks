// Read the package.json to detect the package name and dependencies
var pkg = JSON.parse(require('fs').readFileSync('./package.json'));

// Get default dependencies from package.json.
// Dependencies can be customised by hard-coding this array.
var dependencies = [].concat(Object.keys(pkg.dependencies));

module.exports = {
	commonBundles: {
		main: {
			dependencies: [
				'react',
				'react-dom',
				'react-select',
			],
			dest: 'src/asfasggsd/dsggds/public',
		}
	},

	targets: {
		targetName: {
			stylesheets: {
				src  : 'src/asfasggsd/dsggds/private/**/*.less',
				dest : 'src/asfasggsd/dsggds/public',
			},
			scripts: {
				src          : 'src/asfasggsd/dsggds/private/entry.js',
				dest         : 'src/asfasggsd/dsggds/public',
				commonBundle : 'main'
			},
		}
	}
};
