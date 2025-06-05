import { atom } from "jotai";
import { DataFilterType } from "../../_libs/discover.type";

export const surroundingDataFilterAtom = atom<DataFilterType[]>([]);
export const beforeTimeFieldPageSizeAtom = atom<number>(5);
export const afterTimeFieldPageSizeAtom = atom<number>(5);
export const beforeTimeAtom = atom<string>('');
export const afterTimeAtom = atom<string>('');
export const beforeCountAtom = atom<number>(0);
export const afterCountAtom = atom<number>(0);
export const surroundingTableFieldsAtom = atom<any[]>([]);
export const surroundingSelectedFieldsAtom = atom<any[]>([]);


