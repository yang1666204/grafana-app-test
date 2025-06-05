import SDButton from '@/app/components/sd-button';
import SDRadio from '@/app/components/sd-radio';
import { SDSelect, SDSelectContent, SDSelectItem, SDSelectTrigger, SDSelectValue } from '@/app/components/sd-select-ui';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { IntervalEnum } from '@/shared/data/app.data.server';
import { language_en_US } from '@/utils/utils';
import { useTranslation } from 'react-i18next';
import { interval } from 'rxjs';
import { AGGREGATABLE, AggregatableEnum, FieldTypeEnum, SEARCHABLE, SearchableEnum } from '../../../_libs/discover.data';
import { useAtom } from 'jotai';
import { aggregatableAtom, fieldTypeAtom, searchableAtom } from '../../../_libs/store';
import SDRadioShadcn from '@/app/components/sd-radio-shadcn';
import SDSelectShadcn from '@/app/components/sd-select-shadcn';

export function FilterContent() {
    const { t } = useTranslation();
    const [searchable, setSearchable] = useAtom(searchableAtom);
    const [aggregatable, setAggregatable] = useAtom(aggregatableAtom);
    const [fieldType, setFieldType] = useAtom(fieldTypeAtom);
    return (
        <div className="w-auto divide-y rounded-md dark:divide-gray-700">
            <div className="title dark:text-n2">{t`Discover.Filter.Field`}</div>
            <div className="mt-4 border-none">
                <div className="label mb-2 text-sm dark:text-n2">{t`Aggregatable`}</div>
                <SDRadioShadcn
                    type="button"
                    value={aggregatable}
                    className="space-x-3"
                    itemClassName="w-[100px]"
                    onChange={val => {
                        setAggregatable(val as AggregatableEnum);
                    }}
                    options={AGGREGATABLE}
                />
            </div>
            <div className="mt-4 border-none">
                <div className="label mb-2 text-sm dark:text-n2">{t`Searchable`}</div>
                <SDRadioShadcn
                    type="button"
                    className="space-x-3"
                    itemClassName="w-[100px]"
                    value={searchable}
                    onChange={val => {
                        setSearchable(val as SearchableEnum);
                    }}
                    options={SEARCHABLE}
                />
            </div>
            <div className="mt-4 border-none">
                <div className="label mb-2 dark:text-n2">{t`Type`}</div>
                <SDSelectShadcn
                    value={fieldType}
                    onChange={value => {
                        setFieldType(value as FieldTypeEnum);
                    }}
                    options={[
                        {
                            value: 'ANY',
                            label: 'Any',
                        },
                        {
                            value: 'STRING',
                            label: 'String',
                        },
                        {
                            value: 'NUMBER',
                            label: 'Number',
                        },
                        {
                            value: 'DATE',
                            label: 'Date',
                        },
                    ]}
                />
            </div>
        </div>
    );
}
