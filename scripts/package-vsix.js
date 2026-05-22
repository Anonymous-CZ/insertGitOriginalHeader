/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-21 18:04:16
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-22 16:04:31
 * @FilePath: /insertGitOriginalHeader/scripts/package-vsix.js
 * @Description: 生成 VSIX 包的脚本，使用 esbuild 构建扩展代码并调用 vsce CLI 进行打包。支持通过环境变量指定版本号和输出文件名
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd,
		stdio: 'inherit',
		shell: false,
		env: options.env ?? process.env,
	});

	if (result.error) {
		throw result.error;
	}

	if (typeof result.status === 'number' && result.status !== 0) {
		process.exit(result.status);
	}
}

function sanitizeFileComponent(input) {
	return String(input)
		.trim()
		.replace(/[\\/:*?"<>|\s]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function main() {
	const repoRoot = path.resolve(__dirname, '..');
	const packageJsonPath = path.join(repoRoot, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

	const version = process.env.VSIX_VERSION || pkg.version;
	if (!version) {
		throw new Error('Unable to determine VSIX version (VSIX_VERSION or package.json#version)');
	}

	const baseNameRaw = pkg.displayName || pkg.name || 'extension';
	const baseName = sanitizeFileComponent(baseNameRaw) || 'extension';

	const outDir = path.join(repoRoot, 'out');
	fs.mkdirSync(outDir, { recursive: true });

	const legacyOutFile = path.join(outDir, 'extension.vsix');
	if (fs.existsSync(legacyOutFile)) {
		fs.rmSync(legacyOutFile);
	}

	const outFile = path.join(outDir, `${baseName}-${version}.vsix`);
	if (fs.existsSync(outFile)) {
		fs.rmSync(outFile);
	}

	console.log(`[package-vsix] Building extension (esbuild)`);
	run(process.execPath, [path.join(repoRoot, 'esbuild.js'), '--production'], { cwd: repoRoot });

	console.log(`[package-vsix] Packaging VSIX -> ${path.relative(repoRoot, outFile)}`);
	const vscePackageJsonPath = require.resolve('@vscode/vsce/package.json');
	const vsceCliPath = path.join(path.dirname(vscePackageJsonPath), 'vsce');
	run(process.execPath, [vsceCliPath, 'package', '--no-dependencies', '--out', outFile], { cwd: repoRoot });
}

try {
	main();
} catch (error) {
	console.error('[package-vsix] Failed:', error);
	process.exit(1);
}
