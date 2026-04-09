import * as assert from 'assert';
import { normalize } from '../../util';

suite('Utility Test Suite', () => {
    test('normalize should convert CRLF to LF', () => {
        assert.strictEqual(normalize('hello\r\nworld'), 'hello\nworld');
        assert.strictEqual(normalize('line1\r\nline2\r\nline3'), 'line1\nline2\nline3');
    });

    test('normalize should remove trailing newlines', () => {
        assert.strictEqual(normalize('text\n'), 'text');
        assert.strictEqual(normalize('text\r\n'), 'text');
    });

    test('normalize should remove multiple trailing newlines', () => {
        assert.strictEqual(normalize('text\n\n'), 'text');
        assert.strictEqual(normalize('text\r\n\r\n'), 'text');
    });

    test('normalize should handle empty string', () => {
        assert.strictEqual(normalize(''), '');
    });

    test('normalize should handle text without trailing newline', () => {
        assert.strictEqual(normalize('text'), 'text');
    });
});
