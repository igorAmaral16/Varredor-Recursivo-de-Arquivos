import { api } from "./api";
import type { SearchResponse, CopyResponse, CopySelection } from "../types";

export async function searchDocs(docs: string[]): Promise<SearchResponse> {
    const { data } = await api.post<SearchResponse>("/api/search", { docs });
    return data;
}

export async function copyFiles(selections: CopySelection[]): Promise<CopyResponse> {
    const { data } = await api.post<CopyResponse>("/api/copy", { selections });
    return data;
}
