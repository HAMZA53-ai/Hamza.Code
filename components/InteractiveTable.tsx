
import React, { useState, useMemo } from 'react';
import type { TableData } from '../types';
import { IconTable } from './Icon';

interface InteractiveTableProps {
    data: TableData;
}

type SortDirection = 'ascending' | 'descending';
interface SortConfig {
    key: number;
    direction: SortDirection;
}

const SortArrow: React.FC<{ direction: SortDirection }> = ({ direction }) => (
    <span className="ml-2 rtl:mr-2">
        {direction === 'ascending' ? '▲' : '▼'}
    </span>
);

export const InteractiveTable: React.FC<InteractiveTableProps> = ({ data }) => {
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const sortedRows = useMemo(() => {
        if (!data.rows) return [];
        let sortableRows = [...data.rows];
        if (sortConfig !== null) {
            sortableRows.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableRows;
    }, [data.rows, sortConfig]);

    const requestSort = (key: number) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    if (!data || !data.headers || !data.rows) {
        return (
             <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-400 bg-gray-800/50 p-8 rounded-xl">
                 <IconTable className="w-16 h-16 mb-4 text-gray-500"/>
                <p>لم يتمكن الذكاء الاصطناعي من إنشاء الجدول. قد تكون البيانات المدخلة غير واضحة.</p>
            </div>
        )
    }

    return (
        <div className="w-full h-full p-4 overflow-auto bg-gray-800/50 rounded-xl">
            <table className="w-full min-w-[600px] text-sm text-left rtl:text-right text-gray-300 border-collapse">
                <thead className="text-xs text-cyan-300 uppercase bg-gray-700/50 sticky top-0">
                    <tr>
                        {data.headers.map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 cursor-pointer select-none"
                                onClick={() => requestSort(index)}
                            >
                                <div className="flex items-center">
                                    {header}
                                    {sortConfig?.key === index && <SortArrow direction={sortConfig.direction} />}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-700/40">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-6 py-4">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
