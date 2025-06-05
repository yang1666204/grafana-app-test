import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { Button, Divider, Space, Select, InputNumber } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useContext, useState } from 'react';

const CommonlyUsedItem = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    button {
        &:hover {
            span {
                text-decoration: underline;
            }
        }
    }
`;

const allCommonlyUsedItem: { label: string; dateInterval: [Dayjs, Dayjs] }[] = [
    { label: 'Today', dateInterval: [dayjs().startOf('day'), dayjs()] },
    { label: 'Last 24 hours', dateInterval: [dayjs().add(-24, 'hour'), dayjs()] },
    { label: 'This week', dateInterval: [dayjs().startOf('week'), dayjs()] },
    { label: 'Last 7 days', dateInterval: [dayjs().add(-7, 'day'), dayjs()] },
    { label: 'Last 15 minutes', dateInterval: [dayjs().add(-15, 'minute'), dayjs()] },
    { label: 'Last 30 days', dateInterval: [dayjs().add(-30, 'day'), dayjs()] },
    { label: 'Last 30 minutes', dateInterval: [dayjs().add(-30, 'minute'), dayjs()] },
    { label: 'Last 90 days', dateInterval: [dayjs().add(-90, 'day'), dayjs()] },
    { label: 'Last 1 hour', dateInterval: [dayjs().add(-1, 'hour'), dayjs()] },
    { label: 'Last 1 year', dateInterval: [dayjs().add(-1, 'year'), dayjs()] },
];

export default function DropdownQuickSelect() {
    const [intervalValue, setIntervalValue] = useState<number>(15);
    const [intervalUnit, setIntervalUnit] = useState<dayjs.ManipulateType>('minute');
    // const { setDateRange } = useContext(DiscoverContext);

    return (
        <div>
            <div>Quick select</div>
            <Space style={{ marginTop: '10px' }}>
                <InputNumber
                    style={{ borderRadius: '0' }}
                    value={intervalValue}
                    min={0}
                    max={500}
                    onChange={value => setIntervalValue(value || 0)}
                />
                <Select
                    value={intervalUnit}
                    className={css`
                        width: 125px;
                        .ant-select-selector.ant-select-selector {
                            border-radius: 0;
                        }
                    `}
                    style={{}}
                    options={[
                        {
                            value: 'second',
                            label: 'seconds',
                        },
                        {
                            value: 'minute',
                            label: 'minutes',
                        },
                        {
                            value: 'hour',
                            label: 'hours',
                        },
                        {
                            value: 'day',
                            label: 'days',
                        },
                        {
                            value: 'week',
                            label: 'weeks',
                        },
                        {
                            value: 'month',
                            label: 'months',
                        },
                        {
                            value: 'year',
                            label: 'years',
                        },
                    ]}
                    onChange={(value: dayjs.ManipulateType) => setIntervalUnit(value)}
                />
                <Button
                    style={{ borderRadius: '0' }}
                    onClick={() => {
                        // setDateRange([dayjs().add(-intervalValue, intervalUnit), dayjs()]);
                    }}
                >
                    Apply
                </Button>
            </Space>
            <Divider />
            <div>Commonly used</div>

            {allCommonlyUsedItem.reduce(
                (previousValue, currentValue, currentIndex) => {
                    if (currentIndex % 2 == 1) return previousValue;
                    return (
                        <>
                            {previousValue}
                            <CommonlyUsedItem>
                                <Button
                                    type="link"
                                    onClick={() => {
                                        // setDateRange(currentValue.dateInterval);
                                    }}
                                >
                                    {currentValue.label}
                                </Button>{' '}
                                {currentIndex + 1 < allCommonlyUsedItem.length && (
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            // setDateRange(allCommonlyUsedItem[currentIndex + 1].dateInterval);
                                        }}
                                    >
                                        {allCommonlyUsedItem[currentIndex + 1].label}
                                    </Button>
                                )}
                            </CommonlyUsedItem>
                        </>
                    );
                },
                <></>,
            )}
        </div>
    );
}
