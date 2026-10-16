const geezValues = {
    '፩': 1,
    '፪': 2,
    '፫': 3,
    '፬': 4,
    '፭': 5,
    '፮': 6,
    '፯': 7,
    '፰': 8,
    '፱': 9,
    '፲': 10,
    '፳': 20,
    '፴': 30,
    '፵': 40,
    '፶': 50,
    '፷': 60,
    '፸': 70,
    '፹': 80,
    '፺': 90
};

export function arabicToGeez(value) {
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new RangeError('Enter a positive whole number.');
    }

    const parts = [];
    let remaining = value;

    if (remaining >= 10000) {
        const tenThousands = Math.floor(remaining / 10000);
        parts.push(`${tenThousands > 1 ? arabicToGeez(tenThousands) : ''}፼`);
        remaining %= 10000;
    }

    if (remaining >= 100) {
        const hundreds = Math.floor(remaining / 100);
        parts.push(`${hundreds > 1 ? arabicToGeez(hundreds) : ''}፻`);
        remaining %= 100;
    }

    if (remaining >= 10) {
        const tens = Math.floor(remaining / 10) * 10;
        parts.push(Object.keys(geezValues).find((symbol) => geezValues[symbol] === tens));
        remaining %= 10;
    }

    if (remaining > 0) {
        parts.push(Object.keys(geezValues).find((symbol) => geezValues[symbol] === remaining));
    }

    return parts.join('');
}

export function geezToArabic(value) {
    const numeral = value.replace(/\s+/g, '');
    if (!numeral || !/^[፩-፱፲-፺፻፼]+$/.test(numeral)) {
        throw new Error('Enter a valid Geez numeral using ፩-፱, ፲-፺, ፻, or ፼.');
    }

    let total = 0;
    let group = 0;

    for (const symbol of numeral) {
        if (symbol === '፻') {
            group = (group || 1) * 100;
        } else if (symbol === '፼') {
            total += (group || 1) * 10000;
            group = 0;
        } else {
            group += geezValues[symbol];
        }
    }

    const result = total + group;
    if (!Number.isSafeInteger(result)) {
        throw new RangeError('This Geez numeral is too large to convert safely.');
    }

    return result;
}
