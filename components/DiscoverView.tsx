'use client';

import { useState, useEffect } from 'react';
import { MockService } from '@/lib/mock-service';
import { User, Connection } from '@/types';
import { StudentCard } from '@/components/StudentCard';
import { FilterBar } from '@/components/FilterBar';

interface DiscoverViewProps {
    initialUsers: User[];
}

export function DiscoverView({ initialUsers }: DiscoverViewProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [filters, setFilters] = useState({
        college: '',
        branch: '',
        year: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            const user = await MockService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
                // Default filters to user's own details
                setFilters({
                    college: user.college,
                    branch: user.branch,
                    year: user.year,
                });

                const userConnections = await MockService.getConnections(user.id);
                setConnections(userConnections);
            }
        };
        fetchData();
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleConnect = async (userId: string) => {
        if (!currentUser) return;
        await MockService.sendConnectionRequest(currentUser.id, userId);
        // Refresh connections
        const updatedConnections = await MockService.getConnections(currentUser.id);
        setConnections(updatedConnections);
    };

    const getConnectionStatus = (userId: string) => {
        const connection = connections.find(c =>
            (c.requester_id === currentUser?.id && c.receiver_id === userId) ||
            (c.receiver_id === currentUser?.id && c.requester_id === userId)
        );
        return connection ? connection.status : 'none';
    };

    const filteredUsers = users.filter(user => {
        if (user.id === currentUser?.id) return false; // Don't show self
        if (filters.college && user.college !== filters.college) return false;
        if (filters.branch && user.branch !== filters.branch) return false;
        if (filters.year && user.year !== filters.year) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            <div className="p-4 space-y-4">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No students found matching these filters.
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <StudentCard
                            key={user.id}
                            user={user}
                            onConnect={handleConnect}
                            connectionStatus={getConnectionStatus(user.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
