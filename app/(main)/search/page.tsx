'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { MockService } from '@/lib/mock-service';
import { User, College, Branch, Year } from '@/types';
import { SearchUserItem } from '@/components/SearchUserItem';
import { Select } from "@/components/ui/select";
import { AlertModal } from '@/components/AlertModal';
import { useDebounce } from '@/hooks/use-debounce';

const COLLEGES: College[] = ['TIT', 'ICFAI', 'Techno', 'JIS', 'KIIT', 'VIT', 'LPU'];
const BRANCHES: Branch[] = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'AIML', 'BBA', 'MBA'];
const YEARS: Year[] = ['1st', '2nd', '3rd', '4th'];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [alertOpen, setAlertOpen] = useState(false);
    const [connectionMap, setConnectionMap] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Filters
    const [selectedCollege, setSelectedCollege] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedBranch, setSelectedBranch] = useState<string>('all');

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const userId = localStorage.getItem('cc_user_id');
            setCurrentUserId(userId);

            const [users, connections] = await Promise.all([
                MockService.getAllUsers(),
                userId ? MockService.getConnections(userId) : Promise.resolve([])
            ]);

            // Create connection map
            const map: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
            if (userId) {
                connections.forEach(conn => {
                    const otherId = conn.requester_id === userId ? conn.receiver_id : conn.requester_id;
                    map[otherId] = conn.status;
                });
            }
            setConnectionMap(map);

            setAllUsers(users);
            setFilteredUsers(users);
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        let result = allUsers;

        // 1. Text Search
        if (debouncedQuery.trim()) {
            const lowerQuery = debouncedQuery.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(lowerQuery) ||
                user.username.toLowerCase().includes(lowerQuery) ||
                user.college?.toLowerCase().includes(lowerQuery) ||
                user.branch?.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. College Filter
        if (selectedCollege && selectedCollege !== 'all') {
            result = result.filter(user => user.college === selectedCollege);
        }

        // 3. Year Filter
        if (selectedYear && selectedYear !== 'all') {
            result = result.filter(user => user.year === selectedYear);
        }

        // 4. Branch Filter
        if (selectedBranch && selectedBranch !== 'all') {
            result = result.filter(user => user.branch === selectedBranch);
        }

        setFilteredUsers(result);
    }, [debouncedQuery, allUsers, selectedCollege, selectedYear, selectedBranch]);

    const handleConnect = async (userId: string) => {
        const currentUserId = localStorage.getItem('cc_user_id');
        if (!currentUserId) return;
        await MockService.sendConnectionRequest(currentUserId, userId);
        setAlertOpen(true);
    };

    const clearFilters = () => {
        setQuery('');
        setSelectedCollege('all');
        setSelectedYear('all');
        setSelectedBranch('all');
    };

    const hasActiveFilters = query || selectedCollege !== 'all' || selectedYear !== 'all' || selectedBranch !== 'all';

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Search Header */}
            <div className="sticky top-14 bg-white z-10 p-4 space-y-3 border-b border-gray-200">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, username..."
                        className="pl-9 bg-gray-50 border-none focus-visible:ring-0 rounded-xl h-10 text-gray-900"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 flex-shrink-0">
                        <Filter size={14} className="text-gray-500" />
                    </div>

                    <div className="w-[110px] flex-shrink-0">
                        <Select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                            className="h-8 text-xs rounded-full border-none bg-gray-50 focus:ring-0 text-gray-900"
                        >
                            <option value="all" className="text-gray-900">All Colleges</option>
                            {COLLEGES.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
                        </Select>
                    </div>

                    <div className="w-[90px] flex-shrink-0">
                        <Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-8 text-xs rounded-full border-none bg-gray-50 focus:ring-0 text-gray-900"
                        >
                            <option value="all" className="text-gray-900">All Years</option>
                            {YEARS.map(y => <option key={y} value={y} className="text-gray-900">{y}</option>)}
                        </Select>
                    </div>

                    <div className="w-[100px] flex-shrink-0">
                        <Select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="h-8 text-xs rounded-full border-none bg-gray-50 focus:ring-0 text-gray-900"
                        >
                            <option value="all" className="text-gray-900">All Branches</option>
                            {BRANCHES.map(b => <option key={b} value={b} className="text-gray-900">{b}</option>)}
                        </Select>
                    </div>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full flex-shrink-0"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="px-4 py-2 space-y-2">
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading users...</div>
                ) : filteredUsers.length > 0 ? (
                    <>
                        {filteredUsers.slice(0, 50).map((user) => (
                            <SearchUserItem
                                key={user.id}
                                user={user}
                                onConnect={handleConnect}
                                connectionStatus={connectionMap[user.id] || 'none'}
                                isCurrentUser={currentUserId === user.id}
                            />
                        ))}
                        {filteredUsers.length > 50 && (
                            <div className="text-center py-4 text-sm text-gray-500">
                                Showing top 50 results. Refine your search to see more.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-900 font-medium">No users found</p>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                    </div>
                )}
            </div>

            <AlertModal
                isOpen={alertOpen}
                onClose={() => setAlertOpen(false)}
                title="Request Sent"
                message="Your connection request has been sent successfully!"
                type="alert"
            />
        </div>
    );
}
