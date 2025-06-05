import { Skeleton } from '@/components/ui/skeleton';

export function HistogramSkeleton() {
    return (
        <div className={`flex h-[342px] flex-col space-y-3`}>
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-4 w-1/4 bg-n2/10" />
                <Skeleton className="h-4 w-1/4 bg-n2/10" />
                <Skeleton className="h-4 w-1/4 bg-n2/10" />
            </div>
            <Skeleton className="h-full w-full rounded-xl bg-n2/10" />
        </div>
    );
}
