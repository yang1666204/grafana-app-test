import SDButtonShadcn from '@/app/components/sd-button-shadcn';
import { SDIcon } from '@/app/components/sd-icons';
import { Space } from 'antd';
import { useTranslation } from 'react-i18next';

interface SurroundingLogsActionsProps {
    getSurroundingData: (params: { time: string }) => void;
    getSurroundingDataLoading: boolean;
    time: string;
    timeFieldPageSize: number;
    setTimeFieldPageSize: (value: number) => void;
    tips: string;
    count: number;
    type: 'before' | 'after';
}

export function SurroundingLogsActions(props: SurroundingLogsActionsProps) {
    const { getSurroundingData, getSurroundingDataLoading, time, timeFieldPageSize, setTimeFieldPageSize, tips, count, type } = props;
    const { t } = useTranslation();
    return (
        <Space className="mx-6 py-2">
            <SDButtonShadcn
                loading={getSurroundingDataLoading}
                variant="link"
                className="font-normal text-n2 hover:text-b7 hover:no-underline"
                onClick={() => {
                    getSurroundingData({ time: time });
                }}
                type="reset"
            >
                {!getSurroundingDataLoading && (
                    <>
                        {type === 'before' ? (
                            <SDIcon type="icon-arrow-up" className="mr-1 text-xs text-b3 hover:text-b7 hover:opacity-90 dark:hover:text-b3" />
                        ) : (
                            <SDIcon type="icon-arrow-down" className="mr-1 text-xs text-b3 hover:text-b7 hover:opacity-90 dark:hover:text-b3" />
                        )}
                    </>
                )}
                {t`Query.LogAnalysis.Surrounding.Load`} {timeFieldPageSize} {t`Items`}
            </SDButtonShadcn>
            <div className="text-xs text-n5">
                {count} {t`Items`}
                {tips}
            </div>
        </Space>
    );
}
