import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DataFilterType } from '../discover.type';
import { ParamsKeyEnum } from '../discover.data';
import { useAtom } from 'jotai';
import { dataFilterAtom } from '../store';

function ParamsToDataFilter(dataFilterParams: string | null): DataFilterType[] {
    if (!dataFilterParams) return [];
    return JSON.parse(dataFilterParams);
}

function DataFilterToParams(dataFilter: DataFilterType[]): string {
    if (dataFilter.length === 0) return '';
    return JSON.stringify(dataFilter);
}

export function useDataFilter(): [DataFilterType[], (dataFilter: DataFilterType[]) => void] {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [dataFilter, setDataFilter] = useAtom(dataFilterAtom);

    // useEffect(() => {

    // }, [])

    // const [dataFilter, setDataFilter] = useState<DataFilterType[]>(
    //     ParamsToDataFilter(searchParams.get(ParamsKeyEnum.dataFilter)),
    // );
    const setDataFilterRouter = (currentDataFilter: DataFilterType[]) => {
        const params = new URLSearchParams(searchParams as any);
        const lastQuery = params.toString();

        params.set(ParamsKeyEnum.dataFilter, DataFilterToParams(currentDataFilter));
        let query = params.toString();
        if (query !== lastQuery) {
            query = query ? `?${query}` : query;
            router.push(`${pathname}${query}`);
        }
    };

    useEffect(() => {
        const params = searchParams.get(ParamsKeyEnum.dataFilter);

        if (DataFilterToParams(dataFilter) !== (params ? params : ''))
            setDataFilter(ParamsToDataFilter(searchParams.get(ParamsKeyEnum.dataFilter)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get(ParamsKeyEnum.dataFilter)]);

    return [dataFilter, setDataFilterRouter];
}
