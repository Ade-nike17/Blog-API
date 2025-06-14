module.exports = function calcReadingTime(text) {
    // if (!text) {
    //     console.error("Reading time error: body is undefined");
    //     return "0 min read";
    // }

    const wordsPerMinute = 200;
    const trimmedText = text.trim();
    if (!trimmedText) return '0 min read';

    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
};