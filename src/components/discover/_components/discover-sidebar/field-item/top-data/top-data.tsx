import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { dataFilterAtom, topDataAtom, tableTotalCountAtom } from '../../../../_libs/store';
import { css } from '@emotion/css';
import { Progress, Tooltip } from 'antd';
import { SDIcon } from '@/app/components/sd-icons';
import { isComplexType } from '@/shared/data/app.data.client';
import SDButtonWithIcon from '@/app/components/sd-button-with-icon';
import { nanoid } from 'nanoid';
import { get } from 'lodash-es';

export function TopData({ field }: any) {
    const { t } = useTranslation();
    const topData = useAtomValue(topDataAtom);
    const tableTotalCount = useAtomValue(tableTotalCountAtom);
    const [dataFilter, setDataFilter] = useAtom(dataFilterAtom);
    const canDisplayTopData = field?.Type?.toUpperCase() !== 'VARIANT';
    const res = Object.entries(
        topData.reduce<Record<string, { type: string; count: number }>>((previousValue: any, currentValue: any) => {
            let value = field.Field === 'children' ? currentValue._original['_children'] : get(currentValue._original, field.Field);
            if (value === undefined) {
                value = '';
            }
            if (Object.hasOwn(previousValue, value)) {
                previousValue[value].count++;
            } else {
                previousValue[value] = { count: 1, type: typeof value };
            }
            return previousValue;
        }, {}),
    ).sort((a: any, b: any) => b[1].count - a[1].count);

    return (
        <div className="w-auto rounded-md dark:divide-gray-700">
            <div className="mb-2 mt-2 break-words text-xs text-n5">
                <span className='mr-2'>{field.Field}</span>
                <span>({field.Type})</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-n1">TOP5</div>
                <small className="text-n2">{tableTotalCount >= 500 ? 500 : tableTotalCount} 条</small>
            </div>
            {canDisplayTopData ? (
                <div className="mt-3 space-y-3 text-n5">
                    {res.map(
                        ([value, { type, count }], index) =>
                            index < 5 && (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="h-6 flex-1 overflow-hidden">
                                        <div className="flex items-center justify-between overflow-hidden text-xs">
                                            <div className="flex-1 truncate">{value}</div>
                                            <div className="ml-4 shrink-0">{+((count * 100) / topData.length).toFixed(1)}%</div>
                                        </div>
                                        <Progress
                                            size={4}
                                            className={css`
                                                .ant-progress-outer {
                                                    .ant-progress-inner {
                                                        position: absolute;
                                                        top: 0px;
                                                    }
                                                }
                                            `}
                                            style={{ width: '100%', height: '0px' }}
                                            percent={+((count * 100) / topData.length).toFixed(1)}
                                            status="normal"
                                            showInfo={false}
                                        />
                                    </div>
                                    {!isComplexType(field.Type) && (
                                        // eslint-disable-next-line tailwindcss/enforces-negative-arbitrary-values
                                        <div className="-mr-[5px] ml-4 flex shrink-0 items-center">
                                            <Tooltip title={t`Equivalent filtration`}>
                                                <SDButtonWithIcon
                                                    className="text-n5"
                                                    onClick={e => {
                                                        setDataFilter([
                                                            ...dataFilter,
                                                            {
                                                                fieldName: field.Field,
                                                                operator: '=',
                                                                value: [type === 'string' ? value : +value],
                                                                id: nanoid(),
                                                            },
                                                        ]);
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <SDIcon type="icon-add-circle" />
                                                </SDButtonWithIcon>
                                            </Tooltip>
                                            <Tooltip title={t`Nonequivalent filtration`}>
                                                <SDButtonWithIcon
                                                    className="text-n5"
                                                    onClick={e => {
                                                        setDataFilter([
                                                            ...dataFilter,
                                                            {
                                                                fieldName: field.Field,
                                                                operator: '!=',
                                                                value: [type === 'string' ? value : +value],
                                                                id: nanoid(),
                                                            },
                                                        ]);
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <SDIcon type="icon-minus-circle" />
                                                </SDButtonWithIcon>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            ),
                    )}
                </div>
            ) : (
                <div className="mt-2 text-xs text-n5">不支持该字段类型</div>
            )}
        </div>
    );
}
