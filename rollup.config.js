// import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default [
	// CommonJS (for Node) and ES module (for bundlers) build.
	{
		input: 'src/main.js',
		external: ['request', 'snowplow-tracker-core'],
		plugins: [
			// typescript() // so Rollup can convert TypeScript to JavaScript
		],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
];