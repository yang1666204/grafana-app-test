import { css } from '@emotion/css';
import { AutoComplete, InputRef, message } from 'antd';
import { useRef, useState, CSSProperties } from 'react';
import { SQL_OPERATORS } from '../../_libs/discover.data';
import { currentTimeFieldAtom, searchFocusAtom, searchTypeAtom, searchValueAtom, tableFieldsAtom } from '../../_libs/store';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AutoCompletePopupStyle } from '@/theme/antd/auto-complete.style';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

function getWordPosLR(str: string, currentPos: number) {
    let posR = currentPos;
    let posL = currentPos;
    while (posR < str.length && str.charAt(posR) !== ' ') posR++;
    while (posL >= 0 && str.charAt(posL) !== ' ') posL--;

    return [posL, posR];
}

export default function SQLSearch({ style, onQuerying }: { style?: CSSProperties; onQuerying: () => void }) {
    const searchType = useAtomValue(searchTypeAtom);
    const setSearchFocus = useSetAtom(searchFocusAtom);
    const [tableFields, setTableFields] = useAtom(tableFieldsAtom);
    const [searchValue, setSearchValue] = useAtom(searchValueAtom);
    const currentTimeField = useAtomValue(currentTimeFieldAtom);
    const { theme } = useTheme();
    if (process.env.NODE_ENV !== 'production') {
        searchValueAtom.debugLabel = 'searchValue';
    }
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const inputRef = useRef<any>(null);
    const { t } = useTranslation();

    let disableEnter = false;

    return (
        <AutoComplete
            className="h-8"
            popupClassName={cn(theme, AutoCompletePopupStyle)}
            options={
                searchType === 'SQL'
                    ? options.length > 0
                        ? options
                        : [
                              ...tableFields.map(e => {
                                  return { label: e.Field, value: e.Field };
                              }),
                              ...SQL_OPERATORS.map(e => {
                                  return { label: e, value: e };
                              }),
                          ]
                    : []
            }
            onSelect={value => {
                disableEnter = true;
                const pos = inputRef.current?.input?.selectionStart;
                if (pos !== null && pos !== undefined) {
                    const [posL, posR] = getWordPosLR(searchValue, pos - 1);
                    let res = '';
                    if (posL !== -1) res += searchValue.substring(0, posL) + ' ';
                    res += value;
                    if (posR !== searchValue.length) res += ' ' + searchValue.substring(posR + 1);
                    setSearchValue(res);
                } else {
                    setSearchValue(searchValue + value);
                }
            }}
            value={searchValue}
            onChange={e => {
                setSearchValue(e);
            }}
            onKeyDown={e => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && !disableEnter) {
                    if (currentTimeField) {
                        onQuerying();
                    } else {
                        message.warning(t`Discover.SQLSearch.NoTimeField.Tips`);
                    }
                }
            }}
            filterOption={(inputValue, option) => {
                const pos = inputRef.current?.input?.selectionStart;
                if (pos !== null && pos !== undefined) {
                    const [posL, posR] = getWordPosLR(searchValue, pos - 1);
                    const str = inputValue.substring(posL + 1, posR);
                    return option?.value.toUpperCase().indexOf(str.toUpperCase()) !== -1;
                }
                const inputArr = inputValue.split(' ');
                const value = inputArr[inputArr.length - 1];
                return option?.value.toUpperCase().indexOf(value.toUpperCase()) !== -1;
            }}
            style={style}
        >
            <Input
                onBlur={() => setSearchFocus(false)}
                onFocus={() => setSearchFocus(true)}
                // eslint-disable-next-line tailwindcss/enforces-negative-arbitrary-values
                className="-mt-[2px] h-[32px] border-none hover:placeholder:text-n1 focus:placeholder:text-n6"
                ref={inputRef}
                placeholder={searchType === 'SQL' ? "SQL WHERE. e.g.(event_type = 'ForkApplyEvent AND action = 'none')" : 'Keyword'}
            />
        </AutoComplete>
    );
}
