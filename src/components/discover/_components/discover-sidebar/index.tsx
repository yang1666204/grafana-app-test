import SDCollapse from '@/app/components/sd-collapse';
import { SDIcon } from '@/app/components/sd-icons';
import { Input } from '@/components/ui/input';
import { t } from 'i18next';
import { useAtom, useAtomValue } from 'jotai';
import { aggregatableAtom, fieldTypeAtom, indexesAtom, searchableAtom, selectedFieldsAtom, tableFieldsAtom } from '../../_libs/store';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import FieldItem from './field-item/field-item';
import { FilterContent } from './filter-content/filter-content';
import { AggregatableEnum, FieldTypeEnum, SearchableEnum } from '../../_libs/discover.data';
import { SDPopover, SDPopoverContent, SDPopoverTrigger } from '@/app/components/sd-popover';
import { getFieldType, getFieldIcon } from '@/shared/data/app.data.client';
import SDButtonWithIcon from '@/app/components/sd-button-with-icon';

export default function DiscoverSidebar() {
    const [selectedFields, setSelectedFields] = useAtom(selectedFieldsAtom);
    const tableFields = useAtomValue(tableFieldsAtom);
    const [searchable, setSearchable] = useAtom(searchableAtom);
    const [aggregatable, setAggregatable] = useAtom(aggregatableAtom);
    const [fieldType, setFieldType] = useAtom(fieldTypeAtom);
    const [searchValue, setSearchValue] = useState('');
    const indexes = useAtomValue(indexesAtom);
    const filteredFields = tableFields
        .filter(field => {
            if (aggregatable === AggregatableEnum.ANY) {
                return true;
            }
            if (aggregatable === AggregatableEnum.YES) {
                return getFieldType(field.Type) === 'NUMBER';
            }
            if (aggregatable === AggregatableEnum.NO) {
                return getFieldType(field.Type) !== 'NUMBER';
            }
        })
        .filter(field => {
            if (searchable === SearchableEnum.ANY) {
                return true;
            }
            if (searchable === SearchableEnum.YES) {
                return indexes.some(index => field.Field === index.Field);
            }
            if (searchable === SearchableEnum.NO) {
                return !indexes.some(index => field.Field === index.Field);
            }
        })
        .filter(field => {
            if (fieldType === FieldTypeEnum.ANY) {
                return true;
            }
            return getFieldType(field.Type) === fieldType;
        });
    const hasSelectedFields = selectedFields.length > 0;
    const availableFields = filteredFields.filter(filed => {
        if (selectedFields.find(item => filed['Field'] === item['Field'])) {
            return false;
        }
        return true;
    });

    function handleAdd(field: any) {
        setSelectedFields([...selectedFields, field] as any);
    }

    function handleRemove(field: any) {
        const index = selectedFields.findIndex((item: any) => item.Field === field.Field);
        selectedFields.splice(index, 1);
        setSelectedFields([...selectedFields]);
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center rounded-t-sm bg-n8 p-2 px-4">
                <SDIcon type="icon-search" style={{ fontSize: '16px', paddingRight: '2px' }} />
                <Input placeholder={t`Search`} className="border-none placeholder:text-muted-foreground" value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                <SDPopover>
                    <SDPopoverTrigger>
                        <SDButtonWithIcon>
                            <SDIcon type="icon-filter" />
                        </SDButtonWithIcon>
                    </SDPopoverTrigger>
                    <SDPopoverContent className="w-auto">
                        <FilterContent />
                    </SDPopoverContent>
                </SDPopover>
            </div>
            <div className="mt-px flex-1 overflow-auto rounded-b-sm bg-n8 p-2 px-4">
                <SDCollapse title={t`Selected fields`}>
                    <div className="w-full">
                        {hasSelectedFields ? (
                            <div className="w-full">
                                {selectedFields
                                    .filter((field: any) => {
                                        return field['Field'].includes(searchValue);
                                    })
                                    .map((field: any, index) => (
                                        <FieldItem type="remove" key={index} field={field} onRemove={field => handleRemove(field)} />
                                    ))}
                            </div>
                        ) : (
                            <Button variant="ghost" className="h-8 w-full justify-start text-n4 hover:text-n1">
                                <div>{getFieldIcon('JSONB')}</div>
                                <div className="field-name ml-2">_source</div>
                            </Button>
                        )}
                    </div>
                </SDCollapse>
                <SDCollapse title={t`Available fields`}>
                    <div className="w-full">
                        {availableFields
                            .filter((field: any) => {
                                return field['Field'].includes(searchValue);
                            })
                            .map((field: any, index) => (
                                <FieldItem type="add" field={field} key={index} onAdd={field => handleAdd(field)} />
                            ))}
                    </div>
                </SDCollapse>
            </div>
        </div>
    );
}
