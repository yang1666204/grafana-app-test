import { useRef, useState } from 'react';
import { DiscoverFilterWrapper } from './discover-filter.style';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { SDIcon } from '@/app/components/sd-icons';
import { getFilterSQL } from '@/utils/sql-handler';
import { FilterContent } from './filter-content';
import { SDPopover, SDPopoverContent, SDPopoverTrigger } from '@/app/components/sd-popover';
import SDButtonWithIcon from '@/app/components/sd-button-with-icon';
import { Badge } from '@/components/ui/badge';
import classNames from 'classnames';
import { locationAtom } from '../../../_libs/store';
import { DiscoverFilterProps } from '../types';
import { surroundingDataFilterAtom } from '../store';


export default function SurroundingDiscoverFilter(props: DiscoverFilterProps) {
    // const { dataFilter, setDataFilter } = props;
    const [surroundingDataFilter, setSurroundingDataFilter] = useAtom(surroundingDataFilterAtom);
    const [open, setOpen] = useState<boolean>(false);
    const [dataFilterOpen, setDataFilterOpen] = useState<any>({});
    const discoverFilterRef = useRef(null);
    const { t } = useTranslation();
    const [loc, setLoc] = useAtom(locationAtom);

    return (
        <DiscoverFilterWrapper ref={discoverFilterRef} className="mx-6 mt-px rounded-b-sm py-4 pb-6">
            <div className="text-xs font-medium">{t`Filter`}</div>
            <div className="filter-tag">
                {surroundingDataFilter.map((dataFilterValue, index) => {
                    return (
                        <SDPopover
                            open={dataFilterOpen[dataFilterValue.id]}
                            onOpenChange={() => {
                                setDataFilterOpen({
                                    ...dataFilterOpen,
                                    [dataFilterValue.id]: !dataFilterOpen[dataFilterValue.id],
                                });
                            }}
                        >
                            <SDPopoverTrigger asChild>
                                {/* <button>{dataFilterKey}</button> */}
                                <div>
                                    <Badge variant="outline" className="mx-1 rounded px-2 py-[2px] text-xs leading-[18px] text-n3 first:ml-2 hover:border-b3" key={index}>
                                        {dataFilterValue.label ? <span>{dataFilterValue.label}</span> : <span>{getFilterSQL(dataFilterValue)}</span>}
                                        <div
                                            className="ml-2 cursor-pointer text-n6"
                                            onClick={() => {
                                                const data_filters = surroundingDataFilter.filter(e => e !== dataFilterValue);
                                                setSurroundingDataFilter(data_filters);
                                                setLoc(prev => {
                                                    const searchParams = prev.searchParams;
                                                    searchParams?.set('data_filters', data_filters as any);
                                                    return {
                                                        ...prev,
                                                        searchParams,
                                                    };
                                                });
                                            }}
                                        >
                                            <SDIcon type="icon-close" className="icon-hover-close" />
                                        </div>
                                    </Badge>
                                </div>
                            </SDPopoverTrigger>
                            <SDPopoverContent align="start" className="w-full">
                                <FilterContent
                                    onHide={() => {
                                        setDataFilterOpen({
                                            ...dataFilterOpen,
                                            [dataFilterValue.id]: false,
                                        });
                                    }}
                                    dataFilter={surroundingDataFilter}
                                    setDataFilter={setSurroundingDataFilter}
                                    dataFilterValue={dataFilterValue}
                                />
                            </SDPopoverContent>
                        </SDPopover>
                    );
                })}

                <SDPopover open={open} onOpenChange={setOpen}>
                    <SDPopoverTrigger asChild>
                        <SDButtonWithIcon className={classNames('rounded border p-1 dark:text-n2', surroundingDataFilter.length === 0 ? 'ml-2' : 'ml-1')}>
                            <SDIcon type="icon-add" />
                        </SDButtonWithIcon>
                    </SDPopoverTrigger>
                    <SDPopoverContent align="start" className="w-full">
                        <FilterContent
                            onHide={() => setOpen(false)}
                            dataFilter={surroundingDataFilter}
                            setDataFilter={setSurroundingDataFilter}
                        />
                    </SDPopoverContent>
                </SDPopover>
            </div>
        </DiscoverFilterWrapper>
    );
}
