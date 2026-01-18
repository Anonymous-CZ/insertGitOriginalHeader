import * as assert from 'assert';

import { parseLocalDateTimeString, pickEarliestDate, formatLocalDateTime } from '../dateTime';

suite('dateTime utilities', () => {
	test('parseLocalDateTimeString parses expected format', () => {
		const d = parseLocalDateTimeString('2024-01-02 03:04:05');
		assert.ok(d);
		assert.strictEqual(formatLocalDateTime(d!), '2024-01-02 03:04:05');
	});

	test('pickEarliestDate chooses earliest non-null', () => {
		const a = new Date(2024, 0, 2, 0, 0, 0);
		const b = new Date(2024, 0, 1, 0, 0, 0);
		assert.strictEqual(pickEarliestDate(a, b)!.getTime(), b.getTime());
		assert.strictEqual(pickEarliestDate(null, b)!.getTime(), b.getTime());
		assert.strictEqual(pickEarliestDate(a, null)!.getTime(), a.getTime());
		assert.strictEqual(pickEarliestDate(null, null), null);
	});
});
