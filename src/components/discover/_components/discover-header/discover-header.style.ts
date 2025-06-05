import { language_en_US } from '@/utils/utils';
import { css } from '@emotion/css';
import styled from '@emotion/styled';

export const DiscoverHeaderSearch = styled.div`
    flex: 2;
    display: flex;
    border-radius: 6px;
    align-items: center;
    margin-right: 8px;
    .ant-select-open {
        .ant-select-arrow {
            .anticon {
                transform: rotate(-180deg);
            }
        }
    }
    .select-database {
        width: 160px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .ant-select-single {
        height: 30px;
    }
`;

export const DiscoverHeaderTimeSelect = styled.div`
    flex: 1;
    display: flex;
    border-radius: 6px;
    align-items: center;
    margin-right: 8px;

    div.trp-time-label {
        border: 0px;
    }
`;

export const CascaderStyle = css`
    width: ${language_en_US() ? '220px' : '184px'};
    .ant-select-selector {
        padding: ${language_en_US() ? '0 16px 0 60px !important' : '0 16px 0 40px !important'};
    }
    .ant-select-selection-placeholder,
    .ant-select-selection-item {
        margin-top: 2px;
    }
`;
