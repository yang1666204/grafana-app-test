import { SDIcon } from '@/app/components/sd-icons';
import { t } from 'i18next';
import { dataFilterAtom } from '../../_libs/store';
import { useAtom } from 'jotai';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { css } from '@emotion/css';
import { isComplexType } from '@/shared/data/app.data.client';
import { nanoid } from 'nanoid';
import SDButtonWithIcon from '@/app/components/sd-button-with-icon';

interface ContentItemProps {
    fieldName: string;
    fieldValue: string | number;
    fieldType: string;
}

export function ContentItem({ fieldName, fieldValue, fieldType }: ContentItemProps) {
    const [dataFilter, setDataFilter] = useAtom(dataFilterAtom);
    return (
        <div>
            {!isComplexType(fieldType) && (
                <div className="ml-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <SDButtonWithIcon>
                                    <SDIcon
                                        type="icon-add-circle"
                                        className="cursor-pointer"
                                        onClick={e => {
                                            setDataFilter([...dataFilter, { fieldName, operator: '=', value: [fieldValue], id: nanoid() }]);
                                            e.stopPropagation();
                                        }}
                                    />
                                </SDButtonWithIcon>
                            </TooltipTrigger>
                            <TooltipContent>{t`Equivalent filtration`}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger>
                                <SDButtonWithIcon>
                                    <SDIcon
                                        type="icon-minus-circle"
                                        className="cursor-pointer"
                                        onClick={e => {
                                            setDataFilter([
                                                ...dataFilter,
                                                {
                                                    fieldName,
                                                    operator: '!=',
                                                    value: [fieldValue],
                                                    id: nanoid(),
                                                },
                                            ]);
                                            e.stopPropagation();
                                        }}
                                    />
                                </SDButtonWithIcon>
                            </TooltipTrigger>
                            <TooltipContent>{t`Nonequivalent filtration`}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
}
