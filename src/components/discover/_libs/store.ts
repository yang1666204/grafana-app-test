import { SearchableEnum, AggregatableEnum, FieldTypeEnum, DISCOVER_SHORTCUTS, DISCOVER_DEFAULT_STATUS } from './discover.data';
import { atom } from 'jotai';
import { atomWithStorage, selectAtom } from 'jotai/utils';
import { DataFilterType, DiscoverCurrent } from './discover.type';
import { IntervalEnum } from '@/shared/data/app.data.server';
// import { focusAtom } from 'jotai-optics'
import { atomWithLocation } from 'jotai-location';
import dayjs, { Dayjs } from 'dayjs';
import { ShortcutItem } from '@/app/components/sd-time-range-picker/sd-time-range-picker.interface';

export const locationAtom = atomWithLocation();
export const dataFilterAtom = atom<DataFilterType[]>([]);
export const discoverCurrentAtom = atom<DiscoverCurrent>(DISCOVER_DEFAULT_STATUS);

export const currentCatalogAtom = atom('internal');
export const searchTypeAtom = atom<'SQL' | 'Search'>('SQL');
export const currentDatabaseAtom = selectAtom(discoverCurrentAtom, current => current.database);
export const currentTableAtom = selectAtom(discoverCurrentAtom, current => current.table);
export const currentCascaderDataAtom = selectAtom(discoverCurrentAtom, current => current.cascaderData);
export const currentClusterAtom = atom('');
export const currentTimeFieldAtom = selectAtom(discoverCurrentAtom, current => current.timeField);
export const currentDateAtom = atom<Dayjs[]>(DISCOVER_SHORTCUTS[2].range());
export const currentIndexAtom = atom<any>(undefined);
export const selectedIndexesAtom = atom<any>([]);
export const searchValueAtom = atom('');
export const searchFocusAtom = atom(false);
export const activeShortcutAtom = atom<ShortcutItem | undefined>(DISCOVER_SHORTCUTS[2]);

export const selectedFieldsAtom = atom<any[]>([]);
export const tableFieldsAtom = atom<any[]>([]);

export const timeFieldsAtom = atom<any[]>([]);
export const tableDataAtom = atom<any[]>([]);
export const topDataAtom = atom<any[]>([]);
export const surroundingTableDataAtom = atom<any[]>([]);
export const tableDataChartsAtom = atom<any[]>([]);
export const intervalAtom = atom<IntervalEnum>(IntervalEnum.Auto);
export const tableTotalCountAtom = atom<number>(0);
export const tableEChartsDataAtom = atom<any[]>([]);

// Filter Content Atom
export const searchableAtom = atom<SearchableEnum>(SearchableEnum.ANY);
export const aggregatableAtom = atom<AggregatableEnum>(AggregatableEnum.ANY);
export const fieldTypeAtom = atom<FieldTypeEnum>(FieldTypeEnum.ANY);
export const indexesAtom = atom<any[]>([]);
export const selectedRowAtom = atom<any>({});

export const pageAtom = atom<number>(1);
export const pageSizeAtom = atomWithStorage<number>('discover-pagination-size', 50);
