'use client';
import { Cascader, Divider } from 'antd';
import { PropsWithChildren, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { isSuccess } from '@utils/request';
import { CascaderStyle, DiscoverHeaderSearch, DiscoverHeaderTimeSelect } from './discover-header.style';
import { SDTimeRangePicker } from '@/app/components/sd-time-range-picker';
import { t } from 'i18next';
import SearchType from './search-type';
import SQLSearch from './sql-search';
import { SDIcon } from '@/app/components/sd-icons';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { appInfoAtom, catalogAtom } from '@/shared/stores/app.store';
import {
    currentClusterAtom,
    currentDateAtom,
    currentIndexAtom,
    currentTimeFieldAtom,
    discoverCurrentAtom,
    indexesAtom,
    locationAtom,
    searchFocusAtom,
    searchTypeAtom,
    searchValueAtom,
    selectedIndexesAtom,
    activeShortcutAtom,
    tableFieldsAtom,
    timeFieldsAtom,
} from '../../_libs/store';
import { next_request } from '@/utils/next-request';
import { QueryTableParams } from '@/app/api/data/tables/type';
import { QueryTableFieldsParams } from '@/app/api/data/tables/fields/type';
import { useRequest } from 'ahooks';
import { DISCOVER_SHORTCUTS, getLatestTime, isValidTimeFieldType, TIME_FIELD_TYPES } from '../../_libs/discover.data';
import { DATE_FORMAT } from '@/config/site';
import SDSelectShadcn, { SDSelectShadcnOption } from '@/app/components/sd-select-shadcn';
import SDButtonShadcn from '@/app/components/sd-button-shadcn';
import { AntdCascaderStyle, CascaderPopupStyle } from '@/theme/antd/cascader.style';
import { css } from '@emotion/css';
import { useDatabaseList } from '@/shared/hooks/use-database-list';
import { ShortcutItem } from '@/app/components/sd-time-range-picker/sd-time-range-picker.interface';
import { enableCloudNative, enableVariant, isEnterpriseCloudNative } from '@/lib/version';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { RequestParams } from '../../_libs/discover.type';
import { getClustersUsingGet } from '@/lib/api/userSpaceManagement';
import SDTooltip from '@/app/components/sd-tooltip';
import { QueryTableIndexesParams } from '@/app/api/data/tables/indexes/type';

interface CascaderOption {
    value?: string | number | null;
    label: React.ReactNode;
    children?: CascaderOption[];
    isLeaf?: boolean;
}
export default function DiscoverHeader(
    props: PropsWithChildren & {
        onQuerying: () => void;
        loading: boolean;
    },
) {
    const { theme } = useTheme();
    const catalog = 'internal';
    const appInfo = useAtomValue(appInfoAtom);
    const catalogs = useAtomValue(catalogAtom);
    const setIndexes = useSetAtom(indexesAtom);
    const setSelectedIndexes = useSetAtom(selectedIndexesAtom);
    const setSearchType = useSetAtom(searchTypeAtom);
    const [discoverCurrent, setDiscoverCurrent] = useAtom(discoverCurrentAtom);
    if (process.env.NODE_ENV !== 'production') {
        discoverCurrentAtom.debugLabel = 'current';
    }
    const [loc, setLoc] = useAtom(locationAtom);
    const [currentCluster, setCurrentCluster] = useAtom(currentClusterAtom);
    const setTableFields = useSetAtom(tableFieldsAtom);
    const [options, setOptions] = useState<CascaderOption[]>([]);
    const [timeFields, setTimeFields] = useAtom(timeFieldsAtom);
    const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
    const currentTimeField = useAtomValue(currentTimeFieldAtom);
    const setCurrentIndex = useSetAtom(currentIndexAtom);
    const searchFocus = useAtomValue(searchFocusAtom);
    const { databaseList } = useDatabaseList();
    const [activeItem, setActiveItem] = useAtom(activeShortcutAtom);
    const [clusters, setClusters] = useState<SDSelectShadcnOption[]>([]);
    const database = loc.searchParams?.get('database');
    const table = loc.searchParams?.get('table');
    const cluster = loc.searchParams?.get('cluster');
    const startTime = loc.searchParams?.get('startTime');
    const endTime = loc.searchParams?.get('endTime');

    const { run: getClusters } = useRequest(() => getClustersUsingGet(), {
        ready: enableCloudNative(appInfo?.version, appInfo?.supportComputeGroup),
        onSuccess: res => {
            const data = (res.data || []).map(item => ({ label: item, value: item }));
            setClusters(data);
        },
    });

    useEffect(() => {
        const databases = databaseList.map(item => {
            return {
                label: item.Database,
                value: item.Database,
                isLeaf: false,
            };
        });
        setOptions([...databases]);
    }, [databaseList]);

    useEffect(() => {
        if (startTime && endTime) {
            setCurrentDate([dayjs(startTime), dayjs(endTime)]);
        }
    }, [startTime, endTime, setCurrentDate]);

    useEffect(() => {
        if (cluster) {
            setCurrentCluster(cluster);
        }
        if (database && table) {
            setDiscoverCurrent({
                ...discoverCurrent,
                database,
                table,
                cascaderData: [database, table],
            });
            getFields({
                catalog,
                database,
                table,
            });
            getIndexes({
                catalog,
                database,
                table,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [database, table, cluster]);

    const {
        loading,
        run: getFields,
        refresh,
    } = useRequest(
        (params: QueryTableFieldsParams) => {
            const requestParams: RequestParams = {
                catalog: params.catalog,
                database: params.database,
                table: params.table,
            };
            if (enableVariant(appInfo)) {
                requestParams.describe_extend_variant_column = true;
            }
            return next_request<API.CommonDTOboolean>('/api/data/tables/fields', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                params: requestParams,
            });
        },
        {
            onSuccess: async (res: any) => {
                if (isSuccess(res)) {
                    setTableFields(res.data);
                    const timeFieldsData = res.data.filter((field: any) => {
                        return isValidTimeFieldType(field.Type?.toUpperCase());
                    });
                    if (timeFieldsData.length > 0) {
                        setDiscoverCurrent({
                            ...discoverCurrent,
                            timeField: timeFieldsData[0]?.Field,
                        });
                        setLoc(prev => {
                            const searchParams = prev.searchParams;
                            searchParams?.set('timeField', timeFieldsData[0]?.Field);
                            return {
                                ...prev,
                                searchParams,
                            };
                        });
                        setTimeFields(timeFieldsData);
                    } else {
                        setDiscoverCurrent({
                            ...discoverCurrent,
                            timeField: '',
                        });
                        setTimeFields([]);
                    }
                }
            },
            manual: true,
        },
    );

    const { run: getIndexes } = useRequest(
        (params: QueryTableIndexesParams) => {
            return next_request<API.CommonDTOboolean>('/webui_api/api/data/tables/indexes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    catalog: params.catalog,
                    database: params.database,
                    table: params.table,
                },
            });
        },
        {
            onSuccess: async (res: any) => {
                if (isSuccess(res)) {
                    setIndexes(res.data);
                    setSelectedIndexes(res.data);
                    const values = res.data.map((item: any) => item.Key_name);
                    setCurrentIndex(values);
                    const searchMode = res.data.length > 0;
                    setSearchType(searchMode ? 'Search' : 'SQL');
                }
            },
            manual: true,
        },
    );

    function getTables(params: QueryTableParams) {
        return next_request<API.CommonDTOboolean>('/webui_api/api/data/tables', {
            method: 'GET',
            params: {
                catalog: params.catalog,
                database: params.database,
            },
        });
    }

    const loadData = async (selectedOptions: CascaderOption[]) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const [database] = selectedOptions;
        if (selectedOptions.length >= 1 && database) {
            getTables({
                catalog,
                database: database.value as string,
            }).then((res: any) => {
                if (isSuccess(res)) {
                    targetOption.children = res?.data?.map((table: any) => {
                        return {
                            label: table,
                            value: table,
                            isLeaf: true,
                        };
                    });
                    setOptions([...options]);
                }
            });
        }
    };

    const optionRender = (option: any) => {
        return (
            <SDTooltip content={option.value} className="z-[10000]">
                <div className="max-w-40 truncate">{option.value}</div>
            </SDTooltip>
        );
    };

    return (
        <div className="flex items-center overflow-x-auto rounded-t-sm bg-n8 p-4 pt-6">
            <DiscoverHeaderSearch className="h-8 rounded border border-solid border-n9 dark:border-n7">
                {enableCloudNative(appInfo?.version, appInfo?.supportComputeGroup) && (
                    <>
                        <SDSelectShadcn
                            className="h-8 w-[165px] border-none pl-4 pr-2.5 hover:text-n1"
                            label={<span className="text-n2">{isEnterpriseCloudNative(appInfo) ? t`Compute.Group` : t`Cluster`}</span>}
                            value={currentCluster}
                            options={clusters}
                            onChange={e => {
                                setCurrentCluster(e);
                                setLoc(prev => {
                                    const searchParams = prev.searchParams;
                                    searchParams?.set('cluster', e);
                                    return {
                                        ...prev,
                                        searchParams,
                                    };
                                });
                            }}
                        />
                        <Divider type="vertical" style={{ height: '16px', marginLeft: 0, marginRight: 0 }} />
                    </>
                )}
                <div className="relative h-8 items-center">
                    <span className="absolute left-4 top-1/2 -translate-y-2/4 text-sm dark:text-n2">{t`Table`}</span>
                    <Cascader
                        popupClassName={cn(
                            theme,
                            CascaderPopupStyle,
                            css`
                                min-width: 140px !important;
                            `,
                        )}
                        variant="borderless"
                        className={cn(theme, AntdCascaderStyle, CascaderStyle)}
                        suffixIcon={
                            <span className="text-n6">
                                <SDIcon type="icon-arrow-down" style={{ pointerEvents: 'none', fontSize: 16, verticalAlign: '-8px' }} />
                            </span>
                        }
                        expandIcon={
                            <span className="text-n6">
                                <SDIcon type="icon-arrow-right" style={{ fontSize: 16, verticalAlign: '-4px' }} />
                            </span>
                        }
                        loadData={loadData}
                        value={discoverCurrent.cascaderData}
                        allowClear={false}
                        options={options}
                        optionRender={optionRender}
                        placeholder={t`Please.Select`}
                        displayRender={(labels: string[]) => {
                            return (
                                <span>
                                    {labels.length >= 2 && labels[1] !== '' ? (
                                        <span
                                            className="color-n4 text-n2"
                                            style={{
                                                flex: '1',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {labels[labels.length - 1]}
                                        </span>
                                    ) : (
                                        <span>{t`Please.Select`}</span>
                                    )}
                                </span>
                            );
                        }}
                        onChange={(e: any) => {
                            setDiscoverCurrent({
                                ...discoverCurrent,
                                cascaderData: e,
                            });
                            if (e.length >= 2) {
                                const [database, table] = e;
                                setLoc(prev => {
                                    const searchParams = prev.searchParams;
                                    searchParams?.set('catalog', catalog);
                                    searchParams?.set('database', database);
                                    searchParams?.set('table', table);
                                    return {
                                        ...prev,
                                        searchParams,
                                    };
                                });
                                setDiscoverCurrent({
                                    ...discoverCurrent,
                                    database,
                                    table,
                                    cascaderData: e,
                                });
                                getFields({
                                    catalog,
                                    database,
                                    table,
                                });
                                getIndexes({
                                    catalog,
                                    database,
                                    table,
                                });
                            }
                        }}
                        changeOnSelect
                    />
                </div>
                <Divider type="vertical" style={{ height: '16px', marginLeft: 0, marginRight: 0 }} />
                <SearchType />
                <Divider type="vertical" style={{ height: '16px', marginLeft: 16, marginRight: 5 }} />
                <SQLSearch
                    style={{ flex: '1' }}
                    onQuerying={() => {
                        props?.onQuerying();
                    }}
                />
            </DiscoverHeaderSearch>
            {!searchFocus && (
                <DiscoverHeaderTimeSelect className="h-8 rounded border border-solid border-n9 dark:border-n7">
                    <SDSelectShadcn
                        label={t`Time`}
                        className="w-[175px] border-none pl-4 pr-0 hover:text-n1"
                        value={currentTimeField}
                        options={timeFields.map(field => {
                            return { value: field.Field, label: field.Field };
                        })}
                        onChange={e => {
                            setDiscoverCurrent({
                                ...discoverCurrent,
                                timeField: e,
                            });
                            setLoc(prev => {
                                const searchParams = prev.searchParams;
                                searchParams?.set('timeField', e);
                                return {
                                    ...prev,
                                    searchParams,
                                };
                            });
                        }}
                        placeholder={t`Time.field`}
                    />
                    <Divider type="vertical" style={{ height: '16px', marginLeft: 12, marginRight: 0 }} />
                    <SDTimeRangePicker
                        className="flex-1 border-none pl-4 pr-2"
                        shortcuts={DISCOVER_SHORTCUTS}
                        positionExchange
                        defaultShortcutKey={DISCOVER_SHORTCUTS[2].key}
                        onChange={(val: number[], activeItem: ShortcutItem) => {
                            if (val && val.length === 2) {
                                setActiveItem(activeItem);
                                const [startTime, endTime] = val;
                                setLoc(prev => {
                                    const searchParams = prev.searchParams;
                                    searchParams?.set('startTime', dayjs(startTime).format(DATE_FORMAT));
                                    searchParams?.set('endTime', dayjs(endTime).format(DATE_FORMAT));
                                    return {
                                        ...prev,
                                        searchParams,
                                    };
                                });
                                setCurrentDate([dayjs(startTime), dayjs(endTime)]);
                            }
                        }}
                        value={currentDate ? [currentDate?.[0]?.valueOf(), currentDate?.[1]?.valueOf()] : ([] as any)}
                        prefixIconStyle={{ visibility: 'hidden' }}
                        suffixIconStyle={{ fontSize: '16px' }}
                    />
                </DiscoverHeaderTimeSelect>
            )}
            <SDButtonShadcn
                onClick={() => {
                    const latestTime = getLatestTime(activeItem?.key as string);
                    if (latestTime) {
                        const [latestStartTime, latestEndTime] = latestTime;
                        setLoc(prev => {
                            const searchParams = prev.searchParams;
                            searchParams?.set('startTime', dayjs(latestStartTime).format(DATE_FORMAT));
                            searchParams?.set('endTime', dayjs(latestEndTime).format(DATE_FORMAT));
                            return {
                                ...prev,
                                searchParams,
                            };
                        });
                    }
                    props?.onQuerying();
                }}
                variant="primary"
                className="h-8"
                loading={props?.loading}
                disabled={!currentTimeField}
            >
                {t`Query`}
            </SDButtonShadcn>
        </div>
    );
}
