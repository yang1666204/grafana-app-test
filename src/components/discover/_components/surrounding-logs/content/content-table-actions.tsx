import { SDIcon } from '@/app/components/sd-icons';
import { Tooltip } from 'antd';
import { t } from 'i18next';
import { useAtom, useAtomValue } from 'jotai';
import { isComplexType } from '@/shared/data/app.data.client';
import { nanoid } from 'nanoid';
import { tableFieldsAtom } from '../../../_libs/store';
import { surroundingDataFilterAtom, surroundingSelectedFieldsAtom } from '../store';

export function SurroundingContentTableActions({ fieldName, fieldValue }: any) {
    const [selectedSurroundingFields, setSelectedSurroundingFields] = useAtom(surroundingSelectedFieldsAtom);
    const [surroundingDataFilter, setSurroundingDataFilter] = useAtom(surroundingDataFilterAtom);
    const tableFields = useAtomValue(tableFieldsAtom);
    const fieldType = tableFields.find(field => field.Field === fieldName).Type;
    const hasField = selectedSurroundingFields.some((item: any) => item.Field === fieldName);
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
                                    setSurroundingDataFilter([...surroundingDataFilter, { fieldName: fieldName, operator: '=', value: [filterValue], id: nanoid() }]);
                                }}
                            />
                        </Tooltip>
                        <Tooltip title={t`Nonequivalent filtration`}>
                            <SDIcon
                                className="mr-2 text-sm"
                                type="icon-minus-circle"
                                onClick={() => {
                                    setSurroundingDataFilter([...surroundingDataFilter, { fieldName: fieldName, operator: '!=', value: [filterValue], id: nanoid() }]);
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
                                const index = selectedSurroundingFields.findIndex((item: any) => item.Field === fieldName);
                                selectedSurroundingFields.splice(index, 1);
                                setSelectedSurroundingFields([...selectedSurroundingFields]);
                            } else {
                                setSelectedSurroundingFields([...selectedSurroundingFields, field]);
                            }
                        }}
                    />
                </Tooltip>
            </div>
        </>
    );
}
