import styled from '@emotion/styled';

export const DiscoverFilterWrapper = styled.div`
    display: flex;
    align-items: center;
    .filter {
        align-self: flex-start;
        margin-top: 3px;
        margin-right: 8px;
        font-weight: 500;
        font-size: 14px;
        font-style: normal;
        line-height: 18px;
    }
    .filter-tag {
        display: flex;
        flex: 1;
        flex-wrap: wrap;
        align-items: center;
        row-gap: 8px;
        .tag {
            display: flex;
            align-items: center;
            max-width: 400px;
            height: 24px;
            padding: 2px 8px;
            font-weight: 400;
            font-size: 12px;
            font-style: normal;
            line-height: 18px;
            border: 0px;
            border-radius: 6px;
            .text {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }
`;
