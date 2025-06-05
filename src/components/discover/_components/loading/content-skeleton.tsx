import { Skeleton } from '@/components/ui/skeleton';

export function ContentSkeleton() {
    return (
        <div className={`flex h-[342px] flex-col space-y-3 px-4`}>
            <Skeleton className="h-full w-full rounded-xl bg-n2/10" />
        </div>
    );
}
