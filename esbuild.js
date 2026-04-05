const esbuild = require('esbuild');
const path = require('path');
const polyfill = require('@esbuild-plugins/node-globals-polyfill');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * This plugin hooks into the build process to print errors in a format that the problem matcher in
 * Visual Studio Code can understand.
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};


/**
 * For web extension, all tests, including the test runner, need to be bundled into
 * a single module that has a exported `run` function .
 * This plugin bundles implements a virtual file extensionTests.ts that bundles all these together.
 * @type {import('esbuild').Plugin}
 */
const testBundlePlugin = {
	name: 'testBundlePlugin',
	setup(build) {
		build.onResolve({ filter: /[\/\\]extensionTests\.ts$/ }, args => {
			if (args.kind === 'entry-point') {
				return { path: path.resolve(args.path) };
			}
		});
		build.onLoad({ filter: /[\/\\]extensionTests\.ts$/ }, async args => {
			const testsRoot = path.join(__dirname, 'src/web/test/suite');
			const { glob } = require('node:fs/promises');
			const files = [];
			for await (const file of glob('*.test.{ts,tsx}', { cwd: testsRoot })) {
				files.push(file);
			}
			return {
				contents:
					`export { run } from './mochaTestRunner.ts';` +
					files.map(f => `import('./${f}');`).join(''),
				watchDirs: files.map(f => path.dirname(path.resolve(testsRoot, f))),
				watchFiles: files.map(f => path.resolve(testsRoot, f))
			};
		});
	}
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/web/extension.ts',
			'src/web/test/suite/extensionTests.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outdir: 'dist/web',
		external: ['vscode'],
		logLevel: 'silent',
		// Node.js global to browser globalThis
		define: {
			global: 'globalThis',
		},

		plugins: [
			polyfill.NodeGlobalsPolyfillPlugin({
				process: true,
				buffer: true,
			}),
			testBundlePlugin,
			esbuildProblemMatcherPlugin, /* add to the end of plugins array */
		],
	});
	const vditorDist = path.join(__dirname, 'node_modules', 'vditor', 'dist');
	const targetVditor = path.join(__dirname, 'dist', 'vditor');

	const fs = require('fs');

	function copyDir(src, dest) {
		fs.mkdirSync(dest, { recursive: true });
		let entries = fs.readdirSync(src, { withFileTypes: true });

		for (let entry of entries) {
			let srcPath = path.join(src, entry.name);
			let destPath = path.join(dest, entry.name);

			entry.isDirectory() ?
				copyDir(srcPath, destPath) :
				fs.copyFileSync(srcPath, destPath);
		}
	}

	if (!watch) {
		console.log('Copying Vditor assets...');
		copyDir(vditorDist, targetVditor);
		await ctx.rebuild();
		await ctx.dispose();
	} else {
		console.log('Watching for changes...');
		copyDir(vditorDist, targetVditor);
		await ctx.watch();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
