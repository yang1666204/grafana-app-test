'use client';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import DiscoverHeader from './_components/discover-header';
import { appInfoAtom, catalogAtom } from '@/shared/stores/app.store';
import { next_request } from '@/utils/next-request';
import { isSuccess } from '@/utils/request';
import { useRequest } from 'ahooks';
import DiscoverFilter from './_components/discover-filter';
import DiscoverSidebar from './_components/discover-sidebar';
import { DiscoverHistogram } from './_components/discover-histogram';
import { DiscoverContent } from './_components/discover-content';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect } from 'react';
import {
    currentClusterAtom,
    currentTableAtom,
    currentCatalogAtom,
    currentDatabaseAtom,
    currentDateAtom,
    currentTimeFieldAtom,
    tableDataChartsAtom,
    intervalAtom,
    tableTotalCountAtom,
    tableDataAtom,
    dataFilterAtom,
    searchValueAtom,
    searchTypeAtom,
    tableFieldsAtom,
    selectedIndexesAtom,
    pageAtom,
    pageSizeAtom,
    topDataAtom,
} from './_libs/store';
import { HistogramSkeleton } from './_components/loading/histogram-skeleton';
import { IntervalEnum } from '@/shared/data/app.data.server';
import { formatDate, getAutoInterval, getDateRange } from '@/utils/utils';
import { isObject, orderBy } from 'lodash-es';
import { DATE_FORMAT } from '@/config/site';
import { ContentSkeleton } from './_components/loading/content-skeleton';
import { getCatalogListUsingGet } from '@/lib/api/dataManagement';
import { AutoInterval } from '@/shared/types/app.interface';
import { getIndexesStatement } from './_libs/discover.data';
import SDEmpty from '@/app/components/sd-empty';
import { useTheme } from 'next-themes';
import { enableCloudNative } from '@/lib/version';
import { encodeBase64 } from '@/lib/utils';

export default function DiscoverPage() {
    const appInfo = useAtomValue(appInfoAtom);
    const [catalogs, setCatalogs] = useAtom(catalogAtom);
    const selectedIndexes = useAtomValue(selectedIndexesAtom);
    const currentCluster = useAtomValue(currentClusterAtom);
    const currentTable = useAtomValue(currentTableAtom);
    const currentCatalog = useAtomValue(currentCatalogAtom);
    const currentDatabase = useAtomValue(currentDatabaseAtom);
    const currentDate = useAtomValue(currentDateAtom);
    const setTableDataCharts = useSetAtom(tableDataChartsAtom);
    const currentTimeField = useAtomValue(currentTimeFieldAtom);
    const [interval, setTimeInterval] = useAtom(intervalAtom);
    const setTableTotalCount = useSetAtom(tableTotalCountAtom);
    const searchValue = useAtomValue(searchValueAtom);
    const searchType = useAtomValue(searchTypeAtom);
    const tableFields = useAtomValue(tableFieldsAtom);
    const [dataFilter, setDataFilter] = useAtom(dataFilterAtom);
    const [tableData, setTableData] = useAtom(tableDataAtom);
    const setTopData = useSetAtom(topDataAtom);
    const [page, setPage] = useAtom(pageAtom);
    const pageSize = useAtomValue(pageSizeAtom);
    const { theme } = useTheme();

    const shouldUseClusterParam = () => enableCloudNative(appInfo?.version, appInfo?.supportComputeGroup);

    function getChartsData(tableDataCharts: any[], selectInterval: AutoInterval) {
        const [startDate, endDate] = currentDate;
        const timeInterval: any = interval === IntervalEnum.Auto ? selectInterval : { interval_value: 1, interval_unit: interval };
        const dates = getDateRange(startDate as Dayjs, endDate as Dayjs, timeInterval);
        const tableDataMap = new Map();
        const result: any[] = [];
        const DATE_FORMAT_FROM_INTERVAL = formatDate(timeInterval.interval_unit);

        tableDataCharts.forEach(e => {
            const date = dayjs(e['TT']).format(DATE_FORMAT_FROM_INTERVAL);
            tableDataMap.set(date, e['sum(cnt)']);
        });
        dates.forEach(date => {
            const newDate = dayjs(date).format(DATE_FORMAT_FROM_INTERVAL);
            if (!tableDataMap.get(newDate)) {
                tableDataMap.set(newDate, null);
            }
        });

        tableDataMap.forEach((value, key) => {
            result.push({
                TT: key,
                ['sum(cnt)']: value,
            });
        });
        return orderBy(result, ['TT'], ['asc']);
    }

    const {} = useRequest(
        () => {
            return getCatalogListUsingGet();
        },
        {
            onSuccess: async (res: any) => {
                if (isSuccess(res)) {
                    setCatalogs(res.data);
                }
            },
        },
    );

    const { loading: getTableDataLoading, run: getTableData } = useRequest(
        () => {
            const params: any = {
                catalog: currentCatalog,
                database: currentDatabase,
                table: currentTable,
                timeField: currentTimeField,
                startDate: currentDate[0]?.format(DATE_FORMAT),
                endDate: (currentDate[1] as Dayjs).format(DATE_FORMAT),
                cluster: shouldUseClusterParam() ? currentCluster : '',
                sort: 'DESC',
                search_type: searchType,
                indexes: selectedIndexes,
                page,
                pageSize,
            };
            if (searchType === 'Search') {
                const indexesStatement = getIndexesStatement(selectedIndexes, tableFields, searchValue);
                params.indexesStatement = indexesStatement;
            }
            if (dataFilter.length > 0) {
                params.data_filters = dataFilter;
            } else {
                params.data_filters = [];
            }
            if (searchValue) {
                params.search_value = encodeBase64(searchValue);
            }

            return next_request<API.CommonDTOboolean>('/webui_api/api/discover/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
        },
        {
            onSuccess: async (res: any) => {
                if (isSuccess(res)) {
                    setTableData(res.data);
                } else {
                    setTableData([]);
                }
            },
            onError: err => {
                setTableData([]);
                console.log(err);
            },
            manual: true,
        },
    );

    const { loading: getTopDataLoading, run: getTopData } = useRequest(
        () => {
            const params: any = {
                catalog: currentCatalog,
                database: currentDatabase,
                table: currentTable,
                timeField: currentTimeField,
                startDate: currentDate[0]?.format(DATE_FORMAT),
                endDate: (currentDate[1] as Dayjs).format(DATE_FORMAT),
                cluster: shouldUseClusterParam() ? currentCluster : '',
                sort: 'DESC',
                search_type: searchType,
                indexes: selectedIndexes,
                page: 1,
                pageSize: 500,
            };
            if (searchType === 'Search') {
                const indexesStatement = getIndexesStatement(selectedIndexes, tableFields, searchValue);
                params.indexesStatement = indexesStatement;
            }
            if (dataFilter.length > 0) {
                params.data_filters = dataFilter;
            } else {
                params.data_filters = [];
            }
            if (searchValue) {
                params.search_value = encodeBase64(searchValue);
            }

            return next_request<API.CommonDTOboolean>('/webui_api/api/discover/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
        },
        {
            onSuccess: async (res: any) => {
                if (isSuccess(res)) {
                    setTopData(res.data);
                } else {
                    setTopData([]);
                }
            },
            onError: err => {
                setTopData([]);
                console.log(err);
            },
            manual: true,
        },
    );

    const { loading: getTableDataChartCountLoading, run: getTableDataChartCount } = useRequest(
        (params?: any) => {
            const timeInterval = interval === IntervalEnum.Auto ? getAutoInterval(currentDate as any).interval_unit : interval;
            const timeIntervalValue = interval === IntervalEnum.Auto ? getAutoInterval(currentDate as any).interval_value : 1;
            let payload: any = {
                catalog: currentCatalog,
                database: currentDatabase,
                table: currentTable,
                timeField: currentTimeField,
                startDate: currentDate[0]?.format(DATE_FORMAT),
                endDate: (currentDate[1] as Dayjs).format(DATE_FORMAT),
                cluster: shouldUseClusterParam() ? currentCluster : '',
                sort: 'DESC',
                interval: timeInterval,
                interval_value: timeIntervalValue,
                data_filters: dataFilter,
                search_type: searchType,
            };
            if (searchType === 'Search') {
                const indexesStatement = getIndexesStatement(selectedIndexes, tableFields, searchValue);
                payload.indexes = indexesStatement;
            }
            if (isObject(params)) {
                payload = { ...payload, ...params };
            }
            if (dataFilter.length > 0) {
                payload.data_filters = JSON.stringify(dataFilter);
            } else {
                payload.data_filters = '[]';
            }
            if (searchValue) {
                payload.search_value = encodeBase64(searchValue);
            }
            return next_request<API.CommonDTOboolean>('/webui_api/api/discover/count', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                params: payload,
            });
        },
        {
            onSuccess: async (res: any) => {
                if (isSuccess(res)) {
                    setTableTotalCount(res.data.total_count);
                }
            },
            manual: true,
        },
    );

    const { loading: getTableDataChartsLoading, run: getTableDataCharts } = useRequest(
        (params?: any) => {
            const timeInterval = interval === IntervalEnum.Auto ? getAutoInterval(currentDate as any).interval_unit : interval;
            const timeIntervalValue = interval === IntervalEnum.Auto ? getAutoInterval(currentDate as any).interval_value : 1;
            const indexesStatement = getIndexesStatement(selectedIndexes, tableFields, searchValue);
            let payload: any = {
                catalog: currentCatalog,
                database: currentDatabase,
                table: currentTable,
                timeField: currentTimeField,
                startDate: currentDate[0]?.format(DATE_FORMAT),
                endDate: (currentDate[1] as Dayjs).format(DATE_FORMAT),
                cluster: shouldUseClusterParam() ? currentCluster : '',
                sort: 'DESC',
                interval: timeInterval,
                interval_value: timeIntervalValue,
                search_type: searchType,
                indexes: indexesStatement,
            };
            if (dataFilter.length > 0) {
                payload.data_filters = JSON.stringify(dataFilter);
            }
            if (searchValue) {
                payload.search_value = encodeBase64(searchValue);
            }
            if (isObject(params)) {
                payload = { ...payload, ...params };
            }

            return next_request<API.CommonDTOboolean>('/webui_api/api/discover/charts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                params: payload,
            });
        },
        {
            onSuccess: async (res: any) => {
                if (isSuccess(res)) {
                    const intervalInfo = getAutoInterval(currentDate as any);
                    const ChartsData = getChartsData(res.data, intervalInfo);
                    setTableDataCharts(ChartsData);
                }
            },
            manual: true,
        },
    );

    useEffect(() => {
        setPage(1);
        if (currentTimeField) {
            getTableData();
            getTopData();
            getTableDataCharts();
            getTableDataChartCount();
        } else {
            setTableDataCharts([]);
            setTableTotalCount(NaN);
            setTableData([]);
            setTopData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        getTableDataCharts,
        getTopData,
        setTopData,
        getTableDataChartCount,
        getTableData,
        currentDate,
        currentTimeField,
        dataFilter,
        interval,
        setTableDataCharts,
        setTableTotalCount,
        setTableData,
    ]);

    useEffect(() => {
        if (currentTimeField) {
            getTableData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getTableData, page, pageSize]);

    // useEffect(() => {
    //     setDataFilter([]);
    // }, [currentTable, setDataFilter]);

    return (
        <div>
            <header>
                <DiscoverHeader
                    onQuerying={() => {
                        if (currentTimeField) {
                            setPage(1);
                            getTableDataCharts();
                            getTableData();
                            getTopData();
                            getTableDataChartCount();
                        }
                    }}
                    loading={getTableDataLoading && getTableDataChartsLoading}
                />
                <DiscoverFilter />
            </header>
            <section className="grid grid-cols-10 gap-2 pt-2">
                <div
                    className="col-span-2"
                    style={{
                        height: 'calc(100vh - 176px)',
                    }}
                >
                    <DiscoverSidebar />
                </div>
                <div
                    className="col-span-8 flex flex-col overflow-auto rounded-sm dark:bg-n8"
                    style={{
                        height: 'calc(100vh - 176px)',
                    }}
                >
                    {tableData.length <= 0 && !getTableDataLoading ? (
                        <SDEmpty
                            className="h-full"
                            emptyProps={{
                                style: {
                                    backgroundColor: theme === 'light' ? '#ffffff' : '',
                                },
                            }}
                        />
                    ) : (
                        <div>
                            <div className="shrink-0 rounded-t-sm bg-n8 p-4">{getTableDataChartsLoading ? <HistogramSkeleton /> : <DiscoverHistogram />}</div>
                            <div className="relative mt-px flex-1 rounded-b-sm bg-n8">
                                {getTableDataLoading ? (
                                    <ContentSkeleton />
                                ) : (
                                    <DiscoverContent
                                        fetchNextPage={() => {
                                            getTableData();
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
