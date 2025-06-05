import SDRadio from '@/app/components/sd-radio';
import SDSelect from '@/app/components/sd-select';
import { css } from '@emotion/css';
import { useTranslation } from 'react-i18next';
import { SDIcon } from '@/app/components/sd-icons';
import { useAtom } from 'jotai';
import { currentIndexAtom, indexesAtom, searchTypeAtom, searchValueAtom, selectedIndexesAtom } from '../../_libs/store';
import { useState } from 'react';
import SDRadioShadcn from '@/app/components/sd-radio-shadcn';
import SDMultiSelectShadcn from '@/app/components/sd-multi-select-shadcn';
import { SDPopover, SDPopoverContent, SDPopoverTrigger } from '@/app/components/sd-popover';
import { Tooltip } from 'antd';

export default function SearchType() {
    const { t } = useTranslation();
    const [searchType, setSearchType] = useAtom(searchTypeAtom);
    const [searchValue, setSearchValue] = useAtom(searchValueAtom);
    const [indexes, setIndexes] = useAtom(indexesAtom);
    const [selectedIndexes, setSelectedIndexes] = useAtom(selectedIndexesAtom);
    const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);
    const [open, setOpen] = useState<boolean>(false);
    const searchMode = searchType === 'Search';
    function DropdownQueryType() {
        return (
            <div className="w-[232px]">
                <SDRadioShadcn
                    className="space-x-2"
                    value={searchType}
                    onChange={val => {
                        setSearchType(val as 'Search' | 'SQL');
                        setSearchValue('');
                    }}
                    type="button"
                    options={[
                        { label: t`Search`, value: 'Search', disabled: indexes.length === 0, tips: t`Discover.SearchType.Search.DisabledText` },
                        { label: 'SQL', value: 'SQL' },
                    ]}
                />
                {indexes && searchMode ? (
                    <div className="mt-4">
                        <SDMultiSelectShadcn
                            disabled={indexes.length === 0}
                            value={currentIndex}
                            placeholder={indexes.length > 0 ? '请选择带索引的字段' : '暂无可选带索引的字段'}
                            options={indexes
                                .filter(item => item.Index_type === 'INVERTED')
                                .map(e => {
                                    return { label: e.Key_name, value: e.Key_name };
                                })}
                            onChange={(value: string[]) => {
                                const selectedIndexes: any[] = [];
                                value.forEach(selectedValue => {
                                    indexes.forEach(item => {
                                        if (item.Key_name === selectedValue) {
                                            selectedIndexes.push(item);
                                        }
                                    });
                                });
                                setSelectedIndexes(selectedIndexes);
                                setCurrentIndex(value as any);
                            }}
                        />
                    </div>
                ) : (
                    <></>
                )}
            </div>
        );
    }
    return (
        <>
            <SDPopover open={open} onOpenChange={setOpen}>
                <SDPopoverTrigger asChild>
                    <div className="item-center flex w-[75px] cursor-pointer justify-between pl-4">
                        <span className="text-sm leading-6 text-n2">{!searchMode ? searchType : t`Search`}</span>
                        <span className="text-n6">
                            <SDIcon className="drop-down-icon text-base text-n6" type="icon-arrow-down" />
                        </span>
                    </div>
                </SDPopoverTrigger>
                <SDPopoverContent align="start" className="w-full">
                    <DropdownQueryType />
                </SDPopoverContent>
            </SDPopover>
        </>
    );
}
