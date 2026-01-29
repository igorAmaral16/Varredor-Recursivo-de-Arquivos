export type Hit = { name: string; path: string };

export type SearchResult = {
    doc: string;
    variants: string[];
    hits: Hit[];
};

export type InvalidDoc = {
    doc: string;
    normalizedLength: number;
    rule: string;
};

export type SearchResponse = {
    cachedIndex: boolean;
    indexMeta: { dirsVisited: number; itemsChecked: number; errors: number } | null;
    invalid: InvalidDoc[];
    results: SearchResult[];
};

export type CopySelection = { doc: string; path: string };

export type CopyResponse = {
    copied: Array<{ doc: string; sourcePath: string; destPath: string }>;
    failed: Array<{ doc: string; sourcePath: string; error: string }>;
};
