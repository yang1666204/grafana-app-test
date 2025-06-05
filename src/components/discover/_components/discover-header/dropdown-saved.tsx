import { Button, Divider } from 'antd';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DropdownSavedContent() {
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams as any);
    const pathname = usePathname();
    let query = params.toString();
    query = query ? `?${query}` : query;
    const url = `${pathname}${query}`;

    const [savedQuery, setSavedQuery] = useState<Record<string, string>>(
        JSON.parse(localStorage.getItem('discover-saved-query') || '{}'),
    );

    useEffect(() => {
        localStorage.setItem('discover-saved-query', JSON.stringify(savedQuery));
    }, [savedQuery]);

    return (
        <div style={{ width: '400px' }}>
            <Divider />
            {savedQuery ? (
                Object.entries(savedQuery).map(([key, value], index) => {
                    return <div key={index}>{value}</div>;
                })
            ) : (
                <p>There are no saved queries. Save query text and filters that you want to use again.</p>
            )}
            <Divider />
            <Button
                style={{ left: '200px' }}
                size="large"
                type="primary"
                onClick={() => {
                    setSavedQuery({ ...savedQuery, efg: url });
                }}
            >
                Save Current Query
            </Button>
        </div>
    );
}
