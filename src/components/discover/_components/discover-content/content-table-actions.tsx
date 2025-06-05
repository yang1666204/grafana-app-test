import { SDIcon } from '@/app/components/sd-icons';
import { Tooltip } from 'antd';
import { t } from 'i18next';
import { useAtom, useAtomValue } from 'jotai';
import { selectedFieldsAtom, dataFilterAtom, tableFieldsAtom } from '../../_libs/store';
import { isComplexType } from '@/shared/data/app.data.client';
import { nanoid } from 'nanoid';

export function ContentTableActions({ fieldName, fieldValue }: any) {
    const [selectedFields, setSelectedFields] = useAtom(selectedFieldsAtom);
    const [dataFilter, setDataFilter] = useAtom(dataFilterAtom);
    const tableFields = useAtomValue(tableFieldsAtom);
    console.log(tableFields);
    const fieldType = tableFields.find(field => field.Field === fieldName)?.Type;
    const hasField = selectedFields.some((item: any) => item.Field === fieldName);
    const filterValue = typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : fieldValue;
    return (
        <>
            <div className="icons" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {!isComplexType(fieldType) && (
                    <>
                        <Tooltip title={t`Equivalent filtration`}>
                            <SDIcon
                                className="mr-2 text-sm"
                                type="icon-add-circle"
                                onClick={() => {
                                    setDataFilter([...dataFilter, { fieldName: fieldName, operator: '=', value: [filterValue], id: nanoid() }]);
                                }}
                            />
                        </Tooltip>
                        <Tooltip title={t`Nonequivalent filtration`}>
                            <SDIcon
                                className="mr-2 text-sm"
                                type="icon-minus-circle"
                                onClick={() => {
                                    setDataFilter([...dataFilter, { fieldName: fieldName, operator: '!=', value: [filterValue], id: nanoid() }]);
                                }}
                            />
                        </Tooltip>
                    </>
                )}
                <Tooltip title={hasField ? t`Discover.Column.DeleteFrom.Table` : t`Discover.Column.AddTo.Table`}>
                    <SDIcon
                        className="text-sm"
                        type={hasField ? 'icon-delete-table' : 'icon-add-table'}
                        onClick={() => {
                            const field = tableFields.find(field => field.Field === fieldName);
                            if (hasField) {
                                const index = selectedFields.findIndex((item: any) => item.Field === fieldName);
                                selectedFields.splice(index, 1);
                                setSelectedFields([...selectedFields]);
                            } else {
                                setSelectedFields([...selectedFields, field]);
                            }
                        }}
                    />
                </Tooltip>
            </div>
        </>
    );
}
