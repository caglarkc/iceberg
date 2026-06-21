const UK_POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/gi;
const STREET_PATTERN = /\b(\d+)\s+([\w\s]+(?:Road|Street|Lane|Avenue|Close|Grove|Drive))\b/gi;
export function extractUkPostcodes(text) {
    const matches = text.match(UK_POSTCODE) ?? [];
    return [...new Set(matches.map((p) => normalizePostcode(p)))];
}
export function extractStreetAddresses(text) {
    const results = [];
    let match;
    const pattern = new RegExp(STREET_PATTERN.source, "gi");
    while ((match = pattern.exec(text)) !== null) {
        results.push({ number: match[1], street: match[2].trim() });
    }
    return results;
}
export function extractContactNames(text) {
    const titles = text.match(/\b(?:Mr|Mrs|Ms|Dr)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g) ?? [];
    return [...new Set(titles)];
}
export function normalizePostcode(postcode) {
    const compact = postcode.replace(/\s+/g, "").toUpperCase();
    if (compact.length <= 3)
        return compact;
    return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}
export function jaroWinkler(a, b) {
    if (a === b)
        return 1;
    if (!a.length || !b.length)
        return 0;
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const matchDistance = Math.floor(Math.max(aLower.length, bLower.length) / 2) - 1;
    const aMatches = new Array(aLower.length).fill(false);
    const bMatches = new Array(bLower.length).fill(false);
    let matches = 0;
    for (let i = 0; i < aLower.length; i += 1) {
        const start = Math.max(0, i - matchDistance);
        const end = Math.min(i + matchDistance + 1, bLower.length);
        for (let j = start; j < end; j += 1) {
            if (bMatches[j] || aLower[i] !== bLower[j])
                continue;
            aMatches[i] = true;
            bMatches[j] = true;
            matches += 1;
            break;
        }
    }
    if (matches === 0)
        return 0;
    let t = 0;
    let k = 0;
    for (let i = 0; i < aLower.length; i += 1) {
        if (!aMatches[i])
            continue;
        while (!bMatches[k])
            k += 1;
        if (aLower[i] !== bLower[k])
            t += 1;
        k += 1;
    }
    const m = matches;
    const jaro = (m / aLower.length + m / bLower.length + (m - t / 2) / m) / 3;
    let prefix = 0;
    for (let i = 0; i < Math.min(4, aLower.length, bLower.length); i += 1) {
        if (aLower[i] === bLower[i])
            prefix += 1;
        else
            break;
    }
    return jaro + prefix * 0.1 * (1 - jaro);
}
