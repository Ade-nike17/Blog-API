const calcReadingTime = require('../../utils/readingTime');

describe('Reading Time Utility', () => {
    it('should return 1 min read for ~200 words', () => {
        const text = 'word '.repeat(200);
        expect(calcReadingTime(text)).toBe('1 min read');
    });

    it('should return 2 min read for ~400 words', () => {
        const text = 'word '.repeat(400);
        expect(calcReadingTime(text)).toBe('2 min read');
    });

    it('should return 0 min read for empty text', () => {
        expect(calcReadingTime('')).toBe('0 min read');
    });
});