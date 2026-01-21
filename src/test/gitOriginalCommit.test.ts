import * as assert from 'assert';

import { buildGitOriginalCommitArgs, parseGitOriginalCommitStdout, toGitPathSpec } from '../gitOriginalCommit';

suite('gitOriginalCommit', () => {
	test('buildGitOriginalCommitArgs includes --follow by default', () => {
		const args = buildGitOriginalCommitArgs('src/a.ts');
		assert.ok(args.includes('--follow'));
		assert.ok(args.includes('--'));
		assert.ok(args.some(a => a.startsWith('--pretty=format:')));
		assert.ok(args.some(a => a.startsWith('--date=format:')));
	});

	test('buildGitOriginalCommitArgs can disable follow', () => {
		const args = buildGitOriginalCommitArgs('src/a.ts', { followRenames: false });
		assert.ok(!args.includes('--follow'));
	});

	test('toGitPathSpec returns repo-relative posix path when inside repo', () => {
		const repoRoot = 'C:/repo';
		const filePath = 'C:/repo/src/a b.ts';
		assert.strictEqual(toGitPathSpec(filePath, repoRoot), 'src/a b.ts');
	});

	test('toGitPathSpec keeps absolute path when outside repo', () => {
		const repoRoot = 'C:/repo';
		const filePath = 'C:/outside/repo/file.ts';
		assert.strictEqual(toGitPathSpec(filePath, repoRoot), 'C:/outside/repo/file.ts');
	});

	test('parseGitOriginalCommitStdout parses author and date', () => {
		const parsed = parseGitOriginalCommitStdout('Alice|||2026-01-01 00:00:00\n');
		assert.deepStrictEqual(parsed, { author: 'Alice', date: '2026-01-01 00:00:00' });
	});

	test('parseGitOriginalCommitStdout picks last line when multiple commits are present', () => {
		const parsed = parseGitOriginalCommitStdout('Alice|||2026-01-01 00:00:00\nBob|||2026-02-01 00:00:00\n');
		assert.deepStrictEqual(parsed, { author: 'Bob', date: '2026-02-01 00:00:00' });
	});

	test('parseGitOriginalCommitStdout returns empty fields on empty stdout', () => {
		const parsed = parseGitOriginalCommitStdout('   ');
		assert.deepStrictEqual(parsed, { author: '', date: '' });
	});
});
