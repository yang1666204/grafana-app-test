import { SDIcon } from '@/app/components/sd-icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { TopData } from './top-data/top-data';
import { getFieldIcon } from '@/shared/data/app.data.client';
import { SDHoverCard, SDHoverCardContent, SDHoverCardTrigger } from '@/app/components/sd-hover-card';
import SDButtonWithIcon from '@/app/components/sd-button-with-icon';
import { Tree } from 'antd';
import { TreeStyle } from '@/app/components/data-tree/components/tree/tree.style';
import { DiscoverTreeStyle } from './field-item.styles';

interface FieldItemProps {
    field: any;
    onAdd?: (field: any) => void;
    onRemove?: (field: any) => void;
    type: 'add' | 'remove';
}

export default function FieldItem(props: FieldItemProps) {
    const { field } = props;
    field.key = field.Field;
    const { t } = useTranslation();
    if (field.children) {
        field.icon = <div className="w-4 text-sm leading-8 text-n4">{getFieldIcon(field['Type'])}</div>;
        return (
            <div className="-ml-3 flex">
                <Tree showIcon className={`${TreeStyle} ${DiscoverTreeStyle}`} treeData={[field]} switcherIcon={<SDIcon type="icon-arrow-down" className="dark:text-n6" />} />
            </div>
        );
    }
    return (
        <div className="flex w-full">
            <SDHoverCard openDelay={300}>
                <SDHoverCardTrigger className="relative flex w-full items-center">
                    <Button variant="ghost" className="group flex h-8 w-full justify-between pr-1 text-n4 hover:text-n1">
                        <TooltipProvider>
                            <div className="flex">
                                <div>{getFieldIcon(field['Type'])}</div>
                                <div className="field-name ml-2 max-w-[130px] overflow-hidden text-ellipsis">{field['Field']}</div>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="invisible group-hover:visible">
                                        {props.type === 'add' ? (
                                            <SDButtonWithIcon overlapBg>
                                                <SDIcon
                                                    className="right-0"
                                                    type="icon-add-table"
                                                    onClick={e => {
                                                        props?.onAdd?.(field);
                                                        e.stopPropagation();
                                                    }}
                                                />
                                            </SDButtonWithIcon>
                                        ) : (
                                            <SDButtonWithIcon overlapBg>
                                                <SDIcon
                                                    className="right-0"
                                                    type="icon-delete-table"
                                                    onClick={e => {
                                                        props?.onRemove?.(field);
                                                        e.stopPropagation();
                                                    }}
                                                />
                                            </SDButtonWithIcon>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{props.type === 'add' ? t`Discover.Column.AddTo.Table` : t`Discover.Column.DeleteFrom.Table`}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Button>
                </SDHoverCardTrigger>
                <SDHoverCardContent side="right" align="start">
                    <TopData field={field} />
                </SDHoverCardContent>
            </SDHoverCard>
        </div>
    );
}
