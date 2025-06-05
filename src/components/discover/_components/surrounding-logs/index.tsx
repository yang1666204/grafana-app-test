'use client';

import SDCellPlaceholder from '@/app/components/sd-cell-placeholder';
import SDCollapsibleTable from '@/app/components/sd-collapsible-table';
import { SDIcon } from '@/app/components/sd-icons';
import { SDTable, SDTableBody, SDTableRow, SDTableCell } from '@/app/components/sd-table-shadcn';
import { SDTabs } from '@/app/components/sd-tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { Row, ColumnDef } from '@tanstack/react-table';
import JsonView from '@uiw/react-json-view';
import { t } from 'i18next';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { HoverStyle } from '../discover-content/discover-content.style';
import { SELECTDB_THEME, SELECTDB_THEME_LIGHT } from '../discover-content/json-viewer.theme';
import { useAtom, useAtomValue } from 'jotai';
import { currentCatalogAtom, currentClusterAtom, currentDatabaseAtom, currentTableAtom, currentTimeFieldAtom, selectedRowAtom, surroundingTableDataAtom } from '../../_libs/store';
import { Button } from '@/components/ui/button';
import { css } from '@emotion/css';
import { next_request, isSuccess } from '@/utils/next-request';
import { useRequest } from 'ahooks';
import { SurroundingContentItem } from './surrounding-content-item';
import {
    afterTimeAtom,
    afterTimeFieldPageSizeAtom,
    beforeTimeAtom,
    beforeCountAtom,
    afterCountAtom,
    beforeTimeFieldPageSizeAtom,
    surroundingDataFilterAtom,
    surroundingSelectedFieldsAtom,
} from './store';
import { SurroundingParams } from '@/app/api/discover/surrounding/type';
import { toast } from 'sonner';
import { SDSkeleton } from '@/app/components/sd-skeleton';
import { SurroundingLogsActions } from './logs-actions';
import { SurroundingContentTableActions } from './content/content-table-actions';
import SurroundingDiscoverFilter from './discover-filter';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

export default function SurroundingLogs() {
    const { theme } = useTheme();
    const selectedRow = useAtomValue(selectedRowAtom);
    const { t } = useTranslation();
    const currentTimeField = useAtomValue(currentTimeFieldAtom);
    const [selectedSurroundingFields, setSelectedSurroundingFields] = useAtom(surroundingSelectedFieldsAtom);
    const [surroundingDataFilter, setSurroundingDataFilter] = useAtom(surroundingDataFilterAtom);
    const hasSelectedFields = selectedSurroundingFields.length > 0;
    const [fields, setFields] = useState<any[]>([]);
    const currentCluster = useAtomValue(currentClusterAtom);
    const currentTable = useAtomValue(currentTableAtom);
    const currentCatalog = useAtomValue(currentCatalogAtom);
    const currentDatabase = useAtomValue(currentDatabaseAtom);
    const [surroundingTableData, setSurroundingTableData] = useAtom(surroundingTableDataAtom);
    const [beforeCount, setBeforeCount] = useAtom(beforeCountAtom);
    const [afterCount, setAfterCount] = useAtom(afterCountAtom);
    const [beforeTimeFieldPageSize, setBeforeTimeFieldPageSize] = useAtom(beforeTimeFieldPageSizeAtom);
    const [afterTimeFieldPageSize, setAfterTimeFieldPageSize] = useAtom(afterTimeFieldPageSizeAtom);
    const [beforeTime, setBeforeTime] = useAtom(beforeTimeAtom);
    const [afterTime, setAfterTime] = useAtom(afterTimeAtom);

    function handleRemove(field: any) {
        const index = selectedSurroundingFields.findIndex((item: any) => item.Field === field.Field);
        selectedSurroundingFields.splice(index, 1);
        setSelectedSurroundingFields([...selectedSurroundingFields]);
    }

    const { loading: getAfterSurroundingDataLoading, run: getAfterSurroundingData } = useRequest(
        ({ pageSize = afterTimeFieldPageSize, time = afterTime }: any) => {
            console.log(time);
            const params: SurroundingParams = getQueryParams({
                pageSize,
                operator: '>',
                time,
            });
            console.log(params.time);

            return next_request<API.CommonDTOboolean>('/webui_api/api/discover/surrounding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
        },
        {
            manual: true,
            onSuccess: async (res: any, params: any) => {
                if (isSuccess(res)) {
                    if (res.data.length === 0) {
                        return toast.error(t`Query.LogAnalysis.Surrounding.Load.NoDataTips`);
                    }
                    const len = res.data.length;
                    let data = [...surroundingTableData];
                    data.push(...res.data);
                    setAfterCount(afterCount + len);
                    setAfterTime(res.data[0]._original[currentTimeField]);
                    setSurroundingTableData(data);
                    setTimeout(() => {
                        scrollToSelectedRow();
                    }, 50);
                }
            },
        },
    );

    const { loading: getBeforeSurroundingDataLoading, run: getBeforeSurroundingData } = useRequest(
        ({ pageSize = beforeTimeFieldPageSize, time = selectedRow.time }: any) => {
            const params: SurroundingParams = getQueryParams({
                pageSize,
                operator: '<',
                time,
            });

            return next_request<API.CommonDTOboolean>('/webui_api/api/discover/surrounding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
        },
        {
            manual: true,
            onSuccess: async (res: any, params: any) => {
                if (isSuccess(res)) {
                    if (res.data.length === 0) {
                        return toast.error('没有更多数据了');
                    }
                    const len = res.data.length;
                    let data = [...surroundingTableData];
                    data.unshift(...res.data);
                    setBeforeCount(beforeCount + len);
                    setBeforeTime(res.data[0]._original[currentTimeField]);
                    setSurroundingTableData(data);
                    setTimeout(() => {
                        scrollToSelectedRow();
                    }, 50);
                }
            },
        },
    );

    function scrollToSelectedRow() {
        const selectedElement = document.getElementById('selected');
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    const { loading: initLoading, run: refresh } = useRequest(
        () => {
            const prevTimeParams: SurroundingParams = getQueryParams({
                operator: '<',
            });
            const afterTimeParams: SurroundingParams = getQueryParams({
                operator: '>',
            });
            return Promise.all([
                next_request<API.CommonDTOboolean>('/webui_api/api/discover/surrounding', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(prevTimeParams),
                }),
                next_request<API.CommonDTOboolean>('/webui_api/api/discover/surrounding', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(afterTimeParams),
                }),
            ]);
        },
        {
            refreshDeps: [surroundingDataFilter],
            onSuccess: async (res: any) => {
                if (isSuccess(res[0]) && isSuccess(res[1])) {
                    const data = [...res[0].data, selectedRow, ...res[1].data];
                    if (res[0].data.length > 0) {
                        setBeforeCount(res[0].data.length);
                        setBeforeTime(res[0].data[0]._original[currentTimeField]);
                    } else {
                        setBeforeTime(selectedRow.time);
                    }
                    if (res[1].data.length > 0) {
                        setAfterCount(res[1].data.length);
                        setAfterTime(res[1].data[0]._original[currentTimeField]);
                    } else {
                        setAfterTime(selectedRow.time);
                    }
                    setSurroundingTableData(data);
                    setTimeout(() => {
                        scrollToSelectedRow();
                    }, 50);
                } else {
                    toast.error(res[1].message);
                }
            },
            onError: err => {
                console.log(err);
            },
        },
    );

    useEffect(() => {
        const data = surroundingTableData.map(item => {
            return {
                _original: item._original,
                time: item._original?.[currentTimeField] || '',
                _source: item._source,
                _uid: item._uid,
                selected: item._uid === selectedRow._uid,
            };
        });
        setFields(data);
    }, [surroundingTableData, currentTimeField, selectedRow._uid]);

    function getQueryParams({ pageSize = '5', operator = '>', time = selectedRow.time }: any) {
        const params: SurroundingParams = {
            catalog: currentCatalog,
            database: currentDatabase,
            table: currentTable,
            timeField: currentTimeField,
            time,
            data_filters: '',
            pageSize,
            operator,
            cluster: currentCluster,
            theme,
        };
        if (surroundingDataFilter.length > 0) {
            params.data_filters = surroundingDataFilter;
        }
        return params;
    }

    const renderSubComponent = ({ row }: { row: Row<any> }) => {
        const subTableData = Object.keys(row.original._original).map(key => {
            return {
                field: key,
                value: row.original._original[key],
            };
        });
        return (
            <div className="relative">
                <SDTabs
                    inTable
                    key={`tabs`}
                    items={[
                        {
                            label: 'Table',
                            value: 'Table',
                        },
                        {
                            label: 'JSON',
                            value: 'JSON',
                        },
                    ]}
                >
                    <TabsContent value="Table" className="mt-0">
                        <SDTable className="bg-b1/20 pl-4 backdrop-blur-md dark:bg-n9/60">
                            <SDTableBody>
                                {subTableData.map((item: any) => {
                                    let fieldValue = item.value;
                                    const fieldName = item.field;
                                    if (typeof fieldValue === 'object') {
                                        fieldValue = JSON.stringify(fieldValue);
                                    }
                                    const tableRowStyle = css`
                                        &:hover {
                                            .filter-table-content {
                                                visibility: visible;
                                            }
                                        }
                                    `;
                                    return (
                                        <SDTableRow className={`hover:b1/80 h-8 border-none dark:hover:bg-n8/80  ${tableRowStyle}`} key={fieldName}>
                                            <SDTableCell className="h-8 w-[70px] text-xs">
                                                <div className="filter-table-content invisible">
                                                    <SurroundingContentTableActions fieldName={fieldName} fieldValue={fieldValue} />
                                                </div>
                                            </SDTableCell>
                                            <SDTableCell className="h-8 text-xs">{fieldName || <SDCellPlaceholder />}</SDTableCell>
                                            <SDTableCell className="h-8 whitespace-normal text-xs">
                                                <div className="w-full break-all">{fieldValue || <SDCellPlaceholder />}</div>
                                            </SDTableCell>
                                        </SDTableRow>
                                    );
                                })}
                            </SDTableBody>
                        </SDTable>
                    </TabsContent>
                    <TabsContent value="JSON">
                        <JsonView
                            value={row.original._original}
                            className={`mt-0 pl-11 !leading-6 ${css`
                                .w-rjv-wrap {
                                    border-left: none !important;
                                }
                            `}`}
                            shortenTextAfterLength={0}
                            indentWidth={36}
                            displayDataTypes={false}
                            enableClipboard={false}
                            style={theme === 'dark' ? SELECTDB_THEME : SELECTDB_THEME_LIGHT}
                        />
                    </TabsContent>
                </SDTabs>
            </div>
        );
    };
    const columns = useMemo<ColumnDef<any>[]>(() => {
        let dynamicColumns: ColumnDef<any>[] = [
            {
                accessorKey: 'collapse',
                header: t``,
                cell: ({ row, getValue }) => {
                    return (
                        row.getCanExpand() && (
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" className="mt-[2px] h-4 w-4 hover:bg-transparent" onClick={row.getToggleExpandedHandler()}>
                                    {row.getIsExpanded() ? <SDIcon type="icon-arrow-down" /> : <SDIcon type="icon-arrow-right" />}
                                </Button>
                                <div className="ml-1">{getValue<string>()}</div>
                            </div>
                        )
                    );
                },
            },
            {
                header: 'Time',
                accessorKey: 'time',
                cell: ({ row, getValue }) => {
                    let fieldValue = getValue<string>();
                    const fieldName = currentTimeField;
                    const fieldType = 'DATE';
                    if (typeof fieldValue === 'object') {
                        fieldValue = JSON.stringify(fieldValue);
                    }
                    return (
                        <div
                            className={css`
                                width: 210px;
                                &:hover {
                                    .filter-content {
                                        visibility: visible;
                                    }
                                }
                            `}
                        >
                            <div className="flex items-center text-sm">
                                {getValue<string>()}
                                <div className="filter-content invisible">
                                    <SurroundingContentItem fieldName={fieldName} fieldValue={fieldValue} fieldType={fieldType} />
                                </div>
                            </div>
                        </div>
                    );
                },
            },
        ];
        if (!hasSelectedFields) {
            dynamicColumns.push({
                accessorKey: '_source',
                header: '_source',
                cell: ({ row, getValue }) => {
                    function createMarkup() {
                        return { __html: getValue<string>() };
                    }
                    return (
                        <div className="break-all py-4 text-xs leading-6">
                            <div dangerouslySetInnerHTML={createMarkup()} className="max-h-48 overflow-auto" />
                        </div>
                    );
                },
            });
        } else {
            dynamicColumns = [
                ...dynamicColumns,
                ...selectedSurroundingFields.map((field: any) => {
                    return {
                        accessorKey: field.Field,
                        header: () => (
                            <div className="group flex items-center">
                                {field.Field}
                                <span
                                    className="mt-1 hidden group-hover:inline-block"
                                    onClick={e => {
                                        handleRemove(field);
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <SDIcon type="icon-close" className="icon-hover-close ml-1 cursor-pointer" />
                                </span>
                            </div>
                        ),
                        cell: ({ row, getValue }: any) => {
                            let fieldValue = row.original._original[field.Field];
                            const fieldName = field.Field;
                            const fieldType = field.Type;
                            if (typeof fieldValue === 'object') {
                                fieldValue = JSON.stringify(fieldValue);
                            }
                            return (
                                <div className={`${HoverStyle} flex min-w-48 items-center `}>
                                    <div className={`max-h-48 overflow-auto whitespace-normal`}>
                                        <div className="flex items-center break-all py-4">
                                            <span className="break-all text-xs">{fieldValue}</span>
                                        </div>
                                    </div>
                                    <div className="filter-content invisible">
                                        <SurroundingContentItem fieldName={fieldName} fieldValue={fieldValue} fieldType={fieldType} />
                                    </div>
                                </div>
                            );
                        },
                    };
                }),
            ];
        }
        return dynamicColumns;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTimeField, hasSelectedFields, selectedSurroundingFields]);

    return (
        <div>
            <SurroundingDiscoverFilter dataFilter={surroundingDataFilter} setDataFilter={setSurroundingDataFilter} />
            <div className="h-[2px] bg-b1 dark:bg-black" />
            <SurroundingLogsActions
                getSurroundingData={getBeforeSurroundingData}
                getSurroundingDataLoading={getBeforeSurroundingDataLoading}
                time={beforeTime}
                type="before"
                timeFieldPageSize={beforeTimeFieldPageSize}
                setTimeFieldPageSize={setBeforeTimeFieldPageSize}
                tips={t`Query.LogAnalysis.Surrounding.LoadBefore.Tips`}
                count={beforeCount}
            />
            <div style={{ height: 'calc(100vh - 220px)' }} className="overflow-x-auto">
                <SDSkeleton className="mx-6" loading={initLoading}>
                    <div className="mx-6 border">
                        <SDCollapsibleTable data={fields} columns={columns} getRowCanExpand={() => true} renderSubComponent={renderSubComponent} />
                    </div>
                </SDSkeleton>
            </div>
            <SurroundingLogsActions
                getSurroundingData={getAfterSurroundingData}
                getSurroundingDataLoading={getAfterSurroundingDataLoading}
                time={afterTime}
                type="after"
                timeFieldPageSize={afterTimeFieldPageSize}
                setTimeFieldPageSize={setAfterTimeFieldPageSize}
                tips={t`Query.LogAnalysis.Surrounding.LoadAfter.Tips`}
                count={afterCount}
            />
        </div>
    );
}
