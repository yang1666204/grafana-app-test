import { language_en_US } from '@/utils/utils';
import { t } from 'i18next';
import { DataFilterType, DiscoverCurrent } from './discover.type';
import { getFieldType } from '@/shared/data/app.data.client';
import i18n from '@/utils/i18n';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { CAN_SEARCH_FIELD_TYPE } from '@/shared/data/app.data.server';

export const OPERATORS: string[] = ['=', '!=', 'in', 'not in', 'is null', 'is not null', 'like', 'not like', 'between', 'not between', 'match_any', 'match_all', 'match_phrase'];
export const SQL_OPERATORS: string[] = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'AND', 'OR', 'BETWEEN'];
export const TIME_FIELD_TYPES = ['DATETIME', 'DATE', 'DATETIMEV2', 'DATAV2', 'TIME'];
export function isValidTimeFieldType(fieldType: string): boolean {
    // 提取基础字段类型（移除括号及其内容）
    const baseFieldType = fieldType.split('(')[0];
    return TIME_FIELD_TYPES.includes(baseFieldType);
}

export const DISCOVER_DEFAULT_STATUS: DiscoverCurrent = {
    cascaderData: [],
    catalog: '',
    database: '',
    table: '',
    cluster: '',
    timeField: '',
    date: [],
}

export enum SearchableEnum {
    ANY = 'ANY',
    YES = 'YES',
    NO = 'NO',
}
export enum AggregatableEnum {
    ANY = 'ANY',
    YES = 'YES',
    NO = 'NO',
}

export const SEARCHABLE = [
    {
        label: t`any`,
        value: SearchableEnum.ANY,
    },
    {
        label: language_en_US() ? 'Yes' : '可搜索',
        value: SearchableEnum.YES,
    },
    {
        label: language_en_US() ? 'No' : '不可搜索',
        value: SearchableEnum.NO,
    },
];

export const AGGREGATABLE = [
    {
        label: t`any`,
        value: AggregatableEnum.ANY,
    },
    {
        label: language_en_US() ? 'Yes' : '可聚合',
        value: AggregatableEnum.YES,
    },
    {
        label: language_en_US() ? 'No' : '不可聚合',
        value: AggregatableEnum.NO,
    },
];

export enum FieldTypeEnum {
    ANY = 'ANY',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    DATE = 'DATE',
}

export enum ParamsKeyEnum {
    sqlCatalog = 'sqlCatalog',
    sqlDatabase = 'sqlDatabase',
    startDate = 'startDateRange',
    endDate = 'endDateRange',
    sqlSearch = 'sqlSearch',
    selectedTable = 'selectedTable',
    dateInterval = 'dateInterval',
    selectedField = 'selectedField',
    dataFilter = 'dataFilter',
    selectedTimeField = 'selectedTimeField',
    sortedField = 'sortedField',
    searchType = 'searchType',
    selectedIndex = 'selectedIndex',
    selectedCluster = 'selectedCluster',
}

export function getFilterSQL({ fieldName, operator, value }: DataFilterType): string {
    const valueString = value.map(e => {
        if (typeof e == 'string') return `'${e}'`;
        else return e;
    });

    if (
        operator === '=' ||
        operator === '!=' ||
        operator === 'like' ||
        operator === 'not like' ||
        operator === 'match_all' ||
        operator === 'match_any' ||
        operator === 'match_phrase'
    ) {
        return `\`${fieldName}\` ${operator} ${valueString[0]}`;
    }

    if (operator === 'is null' || operator === 'is not null') {
        return `\`${fieldName}\` ${operator}`;
    }

    if (operator === 'between' || operator === 'not between') {
        return `\`${fieldName}\` ${operator} ${valueString[0]} AND ${valueString[1]}`;
    }

    if (operator === 'in' || operator === 'not in') {
        return `\`${fieldName}\` ${operator} (${valueString})`;
    }

    return '';
}

export function addSqlFilter(sql: string, dataFilterValue: DataFilterType): string {
    let result = sql;
    if (!sql.toUpperCase().includes('WHERE')) {
        result += ' WHERE';
    } else {
        result += ' AND';
    }

    result += ` (${getFilterSQL(dataFilterValue)})`;

    return result;
}

function isWrappedInQuotes(inputString: string): boolean {
    const pattern = /(["'])(.*?)\1/;
    return pattern.test(inputString);
}

export function getIndexesStatement(indexes: any[], allField: any[], keywords: string) {
    let operator: 'MATCH_ANY' | 'MATCH_PHRASE' | '=' = 'MATCH_ANY';

    let searchValue = keywords.trim();

    if (!searchValue || !indexes) {
        return '';
    }

    if (isWrappedInQuotes(keywords)) {
        operator = 'MATCH_PHRASE';
    } else {
        searchValue = `'${searchValue}'`;
    }
    const indexesNames = indexes.map(item => item.Column_name);
    return indexesNames.reduce((prevValue, currValue) => {
        const currentField = allField.find(field => `${field.Field}` === currValue);
        const currentFieldType = getFieldType(currentField.Type);
        if (currentFieldType === 'NUMBER') {
            operator = '=';
        }
        if (currentFieldType === 'STRING' || currentFieldType === 'ARRAY') {
            if (isWrappedInQuotes(keywords)) {
                operator = 'MATCH_PHRASE';
            } else {
                operator = 'MATCH_ANY';
            }
        }
        const canSearchField = CAN_SEARCH_FIELD_TYPE.includes(currentFieldType as string);
        if (canSearchField) {
            if (prevValue) {
                return `${prevValue} OR \`${currValue}\` ${operator} ${searchValue}`;
            } else {
                return `\`${currValue}\` ${operator} ${searchValue}`;
            }
        }
        return prevValue;
    }, '');
}

export const DISCOVER_SHORTCUTS = [
    {
        key: nanoid(),
        text: i18n.t`Last 5 Minutes`,
        label: i18n.t`Last 5 Minutes`,
        range: (now: dayjs.Dayjs = dayjs()) => [now.add(-5, 'minute').startOf('second'), now],
        format: 'HH:mm',
        type: 'minute',
        number: -5,
    },
    {
        key: nanoid(),
        text: i18n.t`Last 15 Minutes`,
        label: i18n.t`Last 15 Minutes`,
        range: (now: dayjs.Dayjs = dayjs()) => [now.add(-15, 'minute').startOf('second'), now],
        format: 'HH:mm',
        type: 'minute',
        number: -15,
    },
    {
        key: nanoid(),
        text: i18n.t`Last 1 Hour`,
        label: i18n.t`Last 1 Hour`,
        range: (now: dayjs.Dayjs = dayjs()) => [now.add(-1, 'hour').startOf('second'), now],
        format: 'HH:mm',
        type: 'hour',
        number: -1,
    },
    {
        key: nanoid(),
        text: i18n.t`Last 1 Day`,
        label: i18n.t`Last 1 Day`,
        range: (now: dayjs.Dayjs = dayjs()) => [now.add(-1, 'day').startOf('second'), now],
        format: 'HH:mm',
        type: 'day',
        number: -1,
    },
    {
        key: nanoid(),
        text: i18n.t`Last 1 Week`,
        label: i18n.t`Last 1 Week`,
        range: (now: dayjs.Dayjs = dayjs()) => [now.add(-7, 'day').startOf('second'), now],
        format: 'HH:mm',
        type: 'day',
        number: -7,
    },
    {
        key: nanoid(),
        text: i18n.t`Last 1 Month`,
        label: i18n.t`Last 1 Month`,
        range: (now: dayjs.Dayjs = dayjs()) => [now.add(-1, 'month').startOf('second'), now],
        format: 'HH:mm',
        type: 'month',
        number: -1,
    },
    {
        key: nanoid(),
        text: i18n.t`Last 3 Months`,
        label: i18n.t`Last 3 Months`,
        range: (now: dayjs.Dayjs = dayjs()) => [now.add(-3, 'month').startOf('second'), now],
        format: 'HH:mm',
        type: 'month',
        number: -3,
    },
    {
        key: nanoid(),
        text: i18n.t`Last 1 Year`,
        label: i18n.t`Last 1 Year`,
        range: (now: dayjs.Dayjs = dayjs()) => [now.add(-1, 'year').startOf('second'), now],
        format: 'HH:mm',
        type: 'year',
        number: -1,
    },
];

export const SURROUNDING_LOGS_OPERATORS = [
    {
        label: '5',
        value: '5',
    },
    {
        label: '10',
        value: '10',
    },
];

export function getLatestTime(id: string) {
    if (!id) {
        return null;
    }
    const selectedItem = DISCOVER_SHORTCUTS.find(item => item.key === id);
    return selectedItem?.range();
}
