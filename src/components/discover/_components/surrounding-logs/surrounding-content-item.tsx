import { SDIcon } from '@/app/components/sd-icons';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isComplexType } from '@/shared/data/app.data.client';
import { nanoid } from 'nanoid';
import { surroundingDataFilterAtom } from './store';
import SDButtonWithIcon from '@/app/components/sd-button-with-icon';
interface ContentItemProps {
    fieldName: string;
    fieldValue: string | number;
    fieldType: string;
}

export function SurroundingContentItem({ fieldName, fieldValue, fieldType }: ContentItemProps) {
    const [surroundingDataFilter, setSurroundingDataFilter] = useAtom(surroundingDataFilterAtom);
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
                                            setSurroundingDataFilter([...surroundingDataFilter, { fieldName, operator: '=', value: [fieldValue], id: nanoid() }]);
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
                                            setSurroundingDataFilter([
                                                ...surroundingDataFilter,
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
