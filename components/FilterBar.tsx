import { Select } from '@/components/ui/select';
import { College, Branch, Year } from '@/types';

interface FilterBarProps {
    filters: {
        college: string;
        branch: string;
        year: string;
    };
    onFilterChange: (key: string, value: string) => void;
}

const COLLEGES: College[] = ['TIT', 'ICFAI', 'Techno', 'JIS', 'KIIT', 'VIT', 'LPU'];
const BRANCHES: Branch[] = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'AIML', 'BBA', 'MBA'];
const YEARS: Year[] = ['1st', '2nd', '3rd', '4th'];

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
    return (
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 space-y-2 border-b">
            <div className="grid grid-cols-3 gap-2">
                <Select
                    value={filters.college}
                    onChange={(e) => onFilterChange('college', e.target.value)}
                    className="text-xs h-8 px-2"
                >
                    <option value="">All Colleges</option>
                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select
                    value={filters.branch}
                    onChange={(e) => onFilterChange('branch', e.target.value)}
                    className="text-xs h-8 px-2"
                >
                    <option value="">All Branches</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </Select>
                <Select
                    value={filters.year}
                    onChange={(e) => onFilterChange('year', e.target.value)}
                    className="text-xs h-8 px-2"
                >
                    <option value="">All Years</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
            </div>
        </div>
    );
}
