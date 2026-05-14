import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import { writeFile, rm } from 'fs/promises';

import { isProbablyBinaryFile } from '../batch/binary';

suite('batch binary detection', () => {
	test('treats NUL byte as binary', async () => {
		const filePath = path.join(os.tmpdir(), `git-original-author-header-binary-${Date.now()}.bin`);
		try {
			await writeFile(filePath, Buffer.from([0x41, 0x00, 0x42]));
			assert.strictEqual(await isProbablyBinaryFile(filePath), true);
		} finally {
			await rm(filePath, { force: true });
		}
	});

	test('treats plain text as non-binary', async () => {
		const filePath = path.join(os.tmpdir(), `git-original-author-header-text-${Date.now()}.txt`);
		try {
			await writeFile(filePath, 'hello\nworld\n', 'utf8');
			assert.strictEqual(await isProbablyBinaryFile(filePath), false);
		} finally {
			await rm(filePath, { force: true });
		}
	});
});
