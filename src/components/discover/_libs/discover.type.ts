import { IntervalEnum } from '@/shared/data/app.data.server';
import { SortOrder } from 'antd/lib/table/interface';
import { Dayjs } from 'dayjs';

export enum DiscoverSearchTypeEnum {
    SQL = 'SQL',
    Search = 'Search',
}
export type IndexType = { name: string; support_phrase?: boolean };
export type FieldType = { name: string; type: string };

export interface SQLSearchDataStore {
    statement: string;
    setStatement: (newStatement: string) => void;
}

export interface getMilliSecondOption {
    year?: number;
    month?: number;
    week?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
}

export type SortedFieldType = [string, SortOrder];

export interface QueryTableDataParams {
    catalog: string;
    database: string;
    table: string;
    cluster: string;
    startDate: string;
    endDate: string;
    sort: string;
    timeField: string;
    interval: IntervalEnum;
}

export interface DataFilterType {
    fieldName: string;
    operator: Operator;
    value: (string | number)[];
    label?: string;
    id: string;
}

export type Operator = '=' | '!=' | 'in' | 'not in' | 'is null' | 'is not null' | 'between' | 'not between' | 'like' | 'not like' | 'match_all' | 'match_any' | 'match_phrase';

export interface DiscoverCurrent {
    cascaderData: any[];
    catalog: string;
    database: string;
    table: string;
    cluster: string;
    timeField: string;
    date: [Dayjs, Dayjs] | [];
}

export interface RequestParams {
    catalog: string;
    database: string;
    table: string;
    describe_extend_variant_column?: boolean;
}