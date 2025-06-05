import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { activeShortcutAtom, currentDateAtom, discoverCurrentAtom, intervalAtom, pageAtom, pageSizeAtom, tableDataChartsAtom, tableTotalCountAtom } from '../../_libs/store';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DATE_FORMAT, TIME_INTERVALS } from '@/config/site';
import { useEffect, useRef, useState } from 'react';
import { IntervalEnum } from '@/shared/data/app.data.server';
import dayjs from 'dayjs';
import { getAutoInterval, translationDateIntervalType } from '@/utils/utils';
import SDSelectShadcn from '@/app/components/sd-select-shadcn';
import { useTheme } from 'next-themes';

export function DiscoverHistogram() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
    const ReactEChartsInstance = useRef<ReactECharts>(null);
    const [discoverCurrent, setDiscoverCurrent] = useAtom(discoverCurrentAtom);
    const setActiveItem = useSetAtom(activeShortcutAtom);

    const tableDataCharts = useAtomValue(tableDataChartsAtom);
    if (process.env.NODE_ENV !== 'production') {
        tableDataChartsAtom.debugLabel = 'tableDataCharts';
    }
    const [interval_value, setInterval_value] = useState(1);
    const [interval, setInterval] = useAtom(intervalAtom);
    if (process.env.NODE_ENV !== 'production') {
        intervalAtom.debugLabel = 'interval';
    }
    const tableTotalCount = useAtomValue(tableTotalCountAtom);
    const [pageSize, setPageSize] = useAtom(pageSizeAtom);
    const [page, setPage] = useAtom(pageAtom);

    useEffect(() => {
        const v = getAutoInterval(currentDate as any).interval_value;
        setInterval_value(v);
    }, [currentDate]);

    const timeInterval = interval === IntervalEnum.Auto ? t(translationDateIntervalType(interval)) : `${interval_value} ${t(translationDateIntervalType(interval))}`;

    const options: any = {
        title: {
            subtext: `${t`Time.Interval`}: ${timeInterval}`,
            left: 'right',
            top: 12,
        },
        grid: {
            left: '32px',
            right: '32px',
            bottom: '0px',
            containLabel: true,
        },
        color: theme === 'light' ? ['#608DFF'] : ['#608DFF'],
        xAxis: {
            type: 'category',
            data: tableDataCharts.map(e => e['TT']),
            axisLabel: {
                fontSize: '12px', // 字体大小
                fontStyle: 'normal',
                fontWeight: 400,
                color: theme === 'light' ? '#9F9FA2' : '#5F5F64',
            },
            axisLine: {
                lineStyle: {
                    width: 0.5,
                    color: theme === 'light' ? '#BFBFC1' : '#3F3F45',
                },
            },
            axisTick: {
                show: false,
            },
        },
        toolbox: {
            show: false,
        },
        brush: {
            xAxisIndex: 0,
        },
        yAxis: {
            name: t`Count`,
            nameTextStyle: {
                align: 'right',
                padding: [5, 0],
            },
            type: 'value',
            splitLine: {
                show: true,
                lineStyle: {
                    width: 0.5, // 网格线的粗细
                    color: theme === 'light' ? '#BFBFC1' : '#3F3F45',
                },
            },
            axisLabel: {
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 400,
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
            },
            padding: 0,
            borderWidth: 0,
            backgroundColor: theme === 'light' ? '#ffffff' : 'rgba(63, 63, 69, 0.64)',
            formatter: function (params: any) {
                const html = `<div className="text-n2"
                                   style="
                                      padding: 8px;
                                      min-width: 120px;
                                      border-radius: 6px;
                                      backdrop-filter: blur(12px);
                                      color: ${theme === 'light' ? '#1F1F26' : '#EFEFF0'};
                                    ">
                                  <div style="padding-bottom: 4px; border-bottom: 1px solid ${theme === 'light' ? '#DFDFE0' : '#3F3F45'};">${[params[0].name]}</div>
                                  <div style="padding-top:4px;display: flex;justify-content: space-between;"><span>计数：</span><span style="font-family:DIN Alternate;font-size:14;font-weight:500;">${[params[0].value || 0]}</span></div>
                              </div>`;
                return html;
            },
        },

        series: [
            {
                data: tableDataCharts.map(e => e['sum(cnt)']),
                type: 'bar',
                barWidth: '99.3%',
            },
        ],

        animation: false,
    };

    useEffect(() => {
        const chart = ReactEChartsInstance.current;
        if (chart) {
            const handler = ({ areas }: any) => {
                if (!areas.length) {
                    return;
                }
                setPage(1);
                setPageSize(50);
                setActiveItem(undefined);
                const [startIndex, endIndex] = (areas[0] as any).coordRange as [startIndex: number, endIndex: number];
                const timeInterval = interval === IntervalEnum.Auto ? getAutoInterval(currentDate as any).interval_unit : interval;
                const chartsEndDate = dayjs(new Date(tableDataCharts[endIndex]['TT'])).add(interval_value, timeInterval);
                setDiscoverCurrent({
                    ...discoverCurrent,
                    date: [dayjs(tableDataCharts[startIndex]['TT']), chartsEndDate],
                });
                setCurrentDate([dayjs(tableDataCharts[startIndex]['TT']), chartsEndDate]);
                chart.getEchartsInstance().dispatchAction({
                    type: 'brush',
                    command: 'clear',
                    areas: [],
                });
            };

            if (chart.ele) {
                chart.getEchartsInstance().dispatchAction({
                    type: 'takeGlobalCursor',
                    key: 'brush',
                    brushOption: {
                        brushType: 'lineX',
                    },
                });
                chart.getEchartsInstance().on('brushEnd', handler);
            }

            return () => {
                if (chart.ele) {
                    chart.getEchartsInstance().off('brushEnd', handler);
                }
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <span className="data-number text-2xl font-bold">{tableTotalCount ? tableTotalCount.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') : '0'}</span>{' '}
                    <span className="text-xs">{t`hits`}</span>
                </div>
                <div className="text-sm text-n3">{currentDate && `${currentDate[0]?.format(DATE_FORMAT)} ~ ${currentDate[1]?.format(DATE_FORMAT)} `}</div>
                <SDSelectShadcn
                    className="h-8 w-[140px]"
                    label={t`Time`}
                    value={interval}
                    onChange={value => {
                        setInterval(value as IntervalEnum);
                    }}
                    options={TIME_INTERVALS}
                />
            </div>
            <div className="h-[300px]">
                <ReactECharts option={options} ref={ReactEChartsInstance}></ReactECharts>
            </div>
        </div>
    );
}
