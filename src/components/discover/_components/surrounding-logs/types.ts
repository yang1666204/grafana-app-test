import { SetStateAction } from "react";
import { DataFilterType } from "../../_libs/discover.type";
type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export interface DiscoverFilterProps {
    dataFilter: DataFilterType[];
    setDataFilter:  SetAtom<[SetStateAction<DataFilterType[]>], void>;
}

export interface FilterContentProps {
    dataFilter: DataFilterType[];
    setDataFilter:  SetAtom<[SetStateAction<DataFilterType[]>], void>;
    onHide: () => void;
    dataFilterValue?: DataFilterType;
}
