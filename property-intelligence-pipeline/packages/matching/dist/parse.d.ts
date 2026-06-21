export declare function extractUkPostcodes(text: string): string[];
export declare function extractStreetAddresses(text: string): Array<{
    number?: string;
    street: string;
}>;
export declare function extractContactNames(text: string): string[];
export declare function normalizePostcode(postcode: string): string;
export declare function jaroWinkler(a: string, b: string): number;
