import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';

import { buildGitOriginalCommitArgs, parseGitOriginalCommitStdout } from '../gitOriginalCommit';

function runGit(cwd: string, args: string[]): string {
	return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

suite('git log follow rename (integration)', () => {
	test('uses earliest author across renames when --follow is enabled', async function () {
		try {
			execFileSync('git', ['--version'], { encoding: 'utf8' });
		} catch {
			this.skip();
			return;
		}

		const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'git-original-author-header-'));
		try {
			runGit(tmpRoot, ['init']);
			runGit(tmpRoot, ['config', 'user.email', 'test@example.com']);

			// First commit as Alice
			runGit(tmpRoot, ['config', 'user.name', 'Alice']);
			const oldPath = path.join(tmpRoot, 'old.txt');
			await fs.writeFile(oldPath, 'hello\n', 'utf8');
			runGit(tmpRoot, ['add', 'old.txt']);
			runGit(tmpRoot, ['commit', '-m', 'add old']);

			// Rename and commit as Bob
			runGit(tmpRoot, ['config', 'user.name', 'Bob']);
			runGit(tmpRoot, ['mv', 'old.txt', 'new.txt']);
			runGit(tmpRoot, ['commit', '-m', 'rename to new']);

			const stdoutFollow = runGit(tmpRoot, buildGitOriginalCommitArgs('new.txt', { followRenames: true }));
			const parsedFollow = parseGitOriginalCommitStdout(stdoutFollow);
			assert.strictEqual(parsedFollow.author, 'Alice');

			const stdoutNoFollow = runGit(tmpRoot, buildGitOriginalCommitArgs('new.txt', { followRenames: false }));
			const parsedNoFollow = parseGitOriginalCommitStdout(stdoutNoFollow);
			assert.strictEqual(parsedNoFollow.author, 'Bob');
		} finally {
			await fs.rm(tmpRoot, { recursive: true, force: true });
		}
	});
});
