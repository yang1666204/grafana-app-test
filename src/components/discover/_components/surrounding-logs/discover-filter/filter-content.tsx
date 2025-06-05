import { AutoComplete, Col, Form, Row } from 'antd';
import { t } from 'i18next';
import { useAtom, useAtomValue } from 'jotai';
import { uniq } from 'lodash-es';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import SDSelectShadcn from '@/app/components/sd-select-shadcn';
import { SDSwitch } from '@/app/components/sd-switch';
import { FormStyle } from '@/theme/antd/form.style';
import { Button } from '@/components/ui/button';
import SDMultiSelectShadcn from '@/app/components/sd-multi-select-shadcn';
import { AutoCompletePopupStyle } from '@/theme/antd/auto-complete.style';
import { nanoid } from 'nanoid';
import { OPERATORS } from '../../../_libs/discover.data';
import { DataFilterType, Operator } from '../../../_libs/discover.type';
import { tableFieldsAtom, tableDataAtom, dataFilterAtom } from '../../../_libs/store';
import { FilterContentProps } from '../types';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export function FilterContent(props: FilterContentProps) {
    const { theme } = useTheme();
    const [form] = Form.useForm();
    const { onHide, dataFilterValue, dataFilter, setDataFilter } = props;
    const tableFields = useAtomValue(tableFieldsAtom);
    const [tableData, setTableData] = useAtom(tableDataAtom);
    const [showLabel, setShowLabel] = useState<boolean>(false);
    if (process.env.NODE_ENV !== 'production') {
        dataFilterAtom.debugLabel = 'dataFilter';
    }
    const field = Form.useWatch('field', form);
    const operator = Form.useWatch('operator', form);

    const getOperatorOptions = () => {
        const field = form.getFieldValue('field');

        if (field) {
            const list = tableData.map(e => {
                return e._original[field];
            });
            const options = uniq(list).map(item => ({ label: item, value: item }));
            return options;
        }
        return [];
    };

    const onFinish = ({
        field,
        operator,
        value,
        minValue,
        maxValue,
        label,
    }: {
        field: string;
        operator: Operator;
        value?: (string | number) | (string | number)[];
        minValue?: string;
        maxValue?: string;
        label?: string;
    }) => {
        const currentDataFilter = dataFilter.find(filter => filter.id === dataFilterValue?.id);
        if (value || typeof value === 'number') {
            if (Array.isArray(value)) {
                const newDataFilter = dataFilter.map(filter => {
                    if (filter.id === dataFilterValue?.id) {
                        filter.fieldName = field;
                        filter.operator = operator;
                        filter.label = label;
                        filter.value = value;
                    }
                    return filter;
                });
                if (currentDataFilter) {
                    setDataFilter(newDataFilter);
                } else {
                    setDataFilter([
                        ...dataFilter,
                        {
                            fieldName: field,
                            operator: operator,
                            label: label,
                            value: value,
                            id: nanoid(),
                        },
                    ]);
                }
            } else {
                const newDataFilter = dataFilter.map(filter => {
                    if (filter.id === dataFilterValue?.id) {
                        filter.fieldName = field;
                        filter.operator = operator;
                        filter.label = label;
                        filter.value = [value];
                    }
                    return filter;
                });
                if (currentDataFilter) {
                    setDataFilter(newDataFilter);
                } else {
                    setDataFilter([
                        ...dataFilter,
                        {
                            fieldName: field,
                            operator: operator,
                            label: label,
                            value: [value],
                            id: nanoid(),
                        },
                    ]);
                }
            }
        } else if (minValue && maxValue) {
            const newDataFilter = dataFilter.map(filter => {
                if (filter.id === dataFilterValue?.id) {
                    filter.fieldName = field;
                    filter.operator = operator;
                    filter.label = label;
                    filter.value = [getValue(minValue), getValue(maxValue)];
                }
                return filter;
            });
            if (currentDataFilter) {
                setDataFilter(newDataFilter);
            } else {
                setDataFilter([
                    ...dataFilter,
                    {
                        fieldName: field,
                        operator: operator,
                        label: label,
                        value: [getValue(minValue), getValue(maxValue)],
                        id: nanoid(),
                    },
                ]);
            }
        } else {
            const newDataFilter = dataFilter.map(filter => {
                if (filter.id === dataFilterValue?.id) {
                    filter.fieldName = field;
                    filter.operator = operator;
                    filter.label = label;
                    filter.value = [];
                }
                return filter;
            });
            if (currentDataFilter) {
                setDataFilter(newDataFilter);
            } else {
                setDataFilter([
                    ...dataFilter,
                    {
                        fieldName: field,
                        operator: operator,
                        label: label,
                        value: [],
                        id: nanoid(),
                    },
                ]);
            }
        }
        onHide();
    };

    function getValue(value: string): string | number {
        return isNaN(+value) ? value : +value;
    }

    useEffect(() => {
        if (!dataFilterValue) {
            form.setFieldValue('value', undefined);
            form.setFieldValue('maxValue', undefined);
            form.setFieldValue('minValue', undefined);
            form.setFieldValue('label', undefined);
        }
    }, [field, form, operator, dataFilterValue]);

    useEffect(() => {
        if (dataFilterValue?.label) {
            setShowLabel(true);
        }
    }, [dataFilterValue?.label]);

    return (
        <div className="w-[320px]">
            <Form
                onFinish={onFinish}
                initialValues={{
                    field: dataFilterValue?.fieldName,
                    operator: dataFilterValue?.operator,
                    value: dataFilterValue?.value,
                    minValue: (dataFilterValue?.value as any[])?.length > 1 ? dataFilterValue?.value[0] : '',
                    maxValue: (dataFilterValue?.value as any[])?.length > 1 ? dataFilterValue?.value[1] : '',
                    label: dataFilterValue?.label,
                    customLabel: dataFilterValue?.label ? true : false,
                }}
                className={FormStyle}
                form={form}
                layout="vertical"
                requiredMark={false}
            >
                <Row gutter={8}>
                    <Col span={12}>
                        <Form.Item label={t`Field`} name="field" rules={[{ required: true, message: t`Please.Select` + t`Field` }]}>
                            <SDSelectShadcn options={tableFields.map(field => ({ label: field.Field, value: field.Field }))}></SDSelectShadcn>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={t`Operator`} name="operator" rules={[{ required: true, message: t`Please.Select` + t`Operator` }]}>
                            <SDSelectShadcn
                                onChange={() => {
                                    form.setFieldValue('value', undefined);
                                    form.setFieldValue('maxValue', undefined);
                                    form.setFieldValue('minValue', undefined);
                                }}
                                options={OPERATORS.map(item => ({ label: item, value: item }))}
                            ></SDSelectShadcn>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.field !== currentValues.field || prevValues.operator !== currentValues.operator}>
                    {({ getFieldValue }) => {
                        const currentField = getFieldValue('field');
                        const currentOperator = getFieldValue('operator') as Operator | undefined;
                        return (
                            currentOperator !== 'is null' &&
                            currentOperator !== 'is not null' &&
                            currentField &&
                            currentOperator &&
                            (currentOperator === 'between' || currentOperator === 'not between' ? (
                                <Form.Item label={t`Value`}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item rules={[{ required: true, message: t`Please enter value` }]} name="minValue" noStyle>
                                                <Input placeholder={t`Please.Enter`} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item rules={[{ required: true, message: t`Please enter value` }]} name="maxValue" noStyle>
                                                <Input placeholder={t`Please.Enter`} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            ) : (
                                <Form.Item
                                    label={<span className="text-sm leading-5">{t`Value`}</span>}
                                    name="value"
                                    rules={[{ required: true, message: t`Please.Enter` + t`Value` }]}
                                >
                                    {(currentOperator === '=' ||
                                        currentOperator === '!=' ||
                                        currentOperator === 'like' ||
                                        currentOperator === 'not like' ||
                                        currentOperator === 'match_all' ||
                                        currentOperator === 'match_any' ||
                                        currentOperator === 'match_phrase') && (
                                        // <SDMultiSelectShadcn options={getOperatorOptions()}></SDMultiSelectShadcn>
                                        <AutoComplete
                                            options={getOperatorOptions()}
                                            popupClassName={cn(theme, AutoCompletePopupStyle)}
                                            allowClear={false}
                                            filterOption={(inputValue, option) => {
                                                return (option?.value + '').includes(inputValue.toLowerCase());
                                            }}
                                        >
                                            <Input type="text" placeholder={t`Please.Select`} />
                                        </AutoComplete>
                                    )}
                                    {(currentOperator === 'in' || currentOperator === 'not in') && <SDMultiSelectShadcn options={getOperatorOptions()}></SDMultiSelectShadcn>}
                                </Form.Item>
                            ))
                        );
                    }}
                </Form.Item>
                <div className="flex items-center space-x-2">
                    <SDSwitch id="customLabel" onCheckedChange={checked => setShowLabel(checked)} checked={showLabel} />
                    <Label htmlFor="customLabel">{t`Discover.Custom.Label`}</Label>
                </div>
                {showLabel && (
                    <Form.Item style={{ marginTop: 16, marginBottom: 0 }} rules={[{ required: true, message: t`Discover.Please.Enter.Label.Message` }]} name="label">
                        <Input placeholder={t`Please.Enter`} />
                    </Form.Item>
                )}
                <div className="mt-6 flex items-center justify-end space-x-2">
                    <Button
                        className="h-8 flex-1 rounded bg-n9 text-sm text-n2 hover:bg-n7/80 hover:text-n2/80 dark:bg-n7"
                        onClick={e => {
                            e.preventDefault();
                            onHide();
                        }}
                    >{t`Cancel`}</Button>
                    <Button onClick={() => {}} type="submit" variant="primary" className={`h-8 flex-1 rounded text-sm `}>{t`Confirm`}</Button>
                </div>
            </Form>
        </div>
    );
}
