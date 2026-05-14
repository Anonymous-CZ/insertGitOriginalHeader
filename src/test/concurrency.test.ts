import * as assert from 'assert';

import { runWithConcurrency } from '../batch/concurrency';

function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

suite('batch concurrency', () => {
	test('caps concurrent workers', async () => {
		const items = Array.from({ length: 20 }, (_, i) => i);
		let current = 0;
		let max = 0;

		await runWithConcurrency({
			items,
			concurrency: 3,
			worker: async () => {
				current++;
				max = Math.max(max, current);
				await delay(10);
				current--;
				return true;
			},
		});

		assert.ok(max <= 3, `max concurrency should be <= 3, got ${max}`);
	});
});
