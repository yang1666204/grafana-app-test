'use client';
import SDCollapsibleTable from '@/app/components/sd-collapsible-table';
import { SDIcon } from '@/app/components/sd-icons';
import { Button } from '@/components/ui/button';
import { ColumnDef, Row } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    currentTimeFieldAtom,
    dataFilterAtom,
    selectedRowAtom,
    selectedFieldsAtom,
    tableDataAtom,
    surroundingTableDataAtom,
    tableTotalCountAtom,
    pageSizeAtom,
    pageAtom,
} from '../../_libs/store';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { SDTabs } from '@/app/components/sd-tabs';
import { TabsContent } from '@/components/ui/tabs';
import SDCellPlaceholder from '@/app/components/sd-cell-placeholder';
import { SDTable, SDTableRow, SDTableBody, SDTableCell } from '@/app/components/sd-table-shadcn';
import { ContentItem } from './content-item';
import { css } from '@emotion/css';
import { ContentTableActions } from './content-table-actions';
import { ColumnStyleWrapper, HoverStyle } from './discover-content.style';
import JsonView from '@uiw/react-json-view';
import { SELECTDB_THEME, SELECTDB_THEME_LIGHT } from './json-viewer.theme';
import SurroundingLogs from '../surrounding-logs';
import { SDSheet, SDSheetContent, SDSheetHeader, SDSheetTitle } from '@/app/components/sd-sheet';
import { afterCountAtom, beforeCountAtom, surroundingDataFilterAtom, surroundingSelectedFieldsAtom } from '../surrounding-logs/store';
import { SDPagination } from '@/app/components/sd-pagination';
import SDErrorBoundary from '@/app/components/sd-error-boundary';
import { useTheme } from 'next-themes';
import { get } from 'lodash-es';

export function DiscoverContent({ fetchNextPage }: { fetchNextPage: (page: number) => void }) {
    const { theme } = useTheme();
    const [fields, setFields] = useState<any[]>([]);
    const tableTotalCount = useAtomValue(tableTotalCountAtom);
    const { t } = useTranslation();
    const [tableData, setTableData] = useAtom(tableDataAtom);
    const [selectedFields, setSelectedFields] = useAtom(selectedFieldsAtom);
    const hasSelectedFields = selectedFields.length > 0;
    const currentTimeField = useAtomValue(currentTimeFieldAtom);
    const [surroundingOpen, setSurroundingOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useAtom(selectedRowAtom);
    const setSurroundingTableData = useSetAtom(surroundingTableDataAtom);
    const setSurroundingDataFilter = useSetAtom(surroundingDataFilterAtom);
    const setSelectedSurroundingFields = useSetAtom(surroundingSelectedFieldsAtom);
    const setBeforeCount = useSetAtom(beforeCountAtom);
    const setAfterCount = useSetAtom(afterCountAtom);
    const [pageSize, setPageSize] = useAtom(pageSizeAtom);
    const [page, setPage] = useAtom(pageAtom);

    function onClose() {
        setSurroundingOpen(false);
    }

    useEffect(() => {
        const data = tableData.map(item => {
            return {
                _original: item._original,
                time: item._original?.[currentTimeField] || '',
                _source: item._source,
                _uid: item._uid,
            };
        });
        setFields(data);
    }, [tableData, currentTimeField]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function handleRemove(field: any) {
        const index = selectedFields.findIndex((item: any) => item.Field === field.Field);
        selectedFields.splice(index, 1);
        setSelectedFields([...selectedFields]);
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
                        <SDErrorBoundary>
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
                                            <SDTableRow className={`hover:b1/80 h-8 border-none dark:hover:bg-n8/80 ${tableRowStyle}`} key={fieldName}>
                                                <SDTableCell className="h-8 w-[70px] text-xs">
                                                    <div className="filter-table-content invisible">
                                                        <ContentTableActions fieldName={fieldName} fieldValue={fieldValue} />
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
                        </SDErrorBoundary>
                    </TabsContent>
                    <TabsContent value="JSON">
                        <JsonView
                            value={row.original._original}
                            className={`-mt-2 pl-11 !leading-6 ${css`
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
                <span
                    onClick={() => {
                        setSurroundingOpen(true);
                        setSelectedRow(row.original);
                    }}
                    className="absolute right-4 top-0 cursor-pointer pt-2 text-sm hover:text-b7 dark:hover:text-b3"
                >{t`Query.LogAnalysis.Surrounding`}</span>
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
                    const fieldValue = getValue<string>();
                    const fieldName = currentTimeField;
                    const fieldType = 'DATE';
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
                                    <ContentItem fieldName={fieldName} fieldValue={fieldValue} fieldType={fieldType} />
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
                            <ColumnStyleWrapper className={theme}>
                                <div dangerouslySetInnerHTML={createMarkup()} className="max-h-48 overflow-auto" />
                            </ColumnStyleWrapper>
                        </div>
                    );
                },
            });
        } else {
            dynamicColumns = [
                ...dynamicColumns,
                ...selectedFields.map((field: any) => {
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
                            // let fieldValue = row.original._original[field.Field];
                            let fieldValue = get(row.original._original, field.Field);
                            const fieldName = field.Field;
                            const fieldType = field.Type;
                            if (typeof fieldValue === 'object') {
                                fieldValue = JSON.stringify(fieldValue);
                            }
                            return (
                                <div className={`${HoverStyle} flex min-w-48 items-center `}>
                                    <div className={`max-h-48 overflow-auto`}>
                                        <div className="flex items-center break-all py-4">
                                            <span className="text-xs">{fieldValue}</span>
                                        </div>
                                    </div>
                                    <div className="filter-content invisible">
                                        <ContentItem fieldName={fieldName} fieldValue={fieldValue} fieldType={fieldType} />
                                    </div>
                                </div>
                            );
                        },
                    };
                }),
            ];
        }
        return dynamicColumns;
    }, [currentTimeField, handleRemove, hasSelectedFields, selectedFields, t]);
    return (
        <div className="overflow-x-auto">
            <SDCollapsibleTable data={fields} columns={columns} getRowCanExpand={() => true} renderSubComponent={renderSubComponent} />
            <SDSheet
                open={surroundingOpen}
                onOpenChange={open => {
                    setSurroundingOpen(open);
                    setSurroundingTableData([]);
                    setSurroundingDataFilter([]);
                    setBeforeCount(0);
                    setAfterCount(0);
                    setSelectedSurroundingFields([]);
                }}
            >
                <SDSheetContent className="flex flex-col justify-between gap-0 lg:max-w-screen-xl">
                    <SDSheetHeader className="shrink-0">
                        <SDSheetTitle>{t`Query.LogAnalysis.Surrounding`}</SDSheetTitle>
                    </SDSheetHeader>
                    <div className="h-full overflow-auto">
                        <SurroundingLogs />
                    </div>
                </SDSheetContent>
            </SDSheet>
            <div className="w-full rounded-b-sm bg-n8 px-5 py-4">
                <SDPagination
                    showLessItems={true}
                    current={page}
                    pageSize={pageSize}
                    total={tableTotalCount}
                    showSizeChanger
                    onChange={(current, size) => {
                        setPageSize(size);
                        setPage(current);
                    }}
                />
            </div>
        </div>
    );
}
