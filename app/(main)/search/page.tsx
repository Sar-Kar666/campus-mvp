'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { MockService } from '@/lib/mock-service';
import { User } from '@/types';
import { StudentCard } from '@/components/StudentCard';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // Simple debounce effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                const users = await MockService.searchUsers(query);
                setResults(users);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleConnect = async (userId: string) => {
        const currentUserId = localStorage.getItem('cc_user_id');
        if (!currentUserId) return;
        await MockService.sendConnectionRequest(currentUserId, userId);
        alert('Connection request sent!');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 space-y-4">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search students, colleges, branches..."
                    className="pl-9 bg-white"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {loading && <div className="text-center text-gray-500">Searching...</div>}

            <div className="space-y-4">
                {results.map((user) => (
                    <StudentCard
                        key={user.id}
                        user={user}
                        onConnect={handleConnect}
                        connectionStatus="none" // Simplified for search results, ideally check status
                    />
                ))}
                {!loading && query && results.length === 0 && (
                    <div className="text-center text-gray-500">No results found.</div>
                )}
                {!query && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        Type to search for students across the platform.
                    </div>
                )}
            </div>
        </div>
    );
}
