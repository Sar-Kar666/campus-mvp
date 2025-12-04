import { User } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { isGoldenUser } from '@/lib/constants';
import { Crown } from 'lucide-react';

interface SearchUserItemProps {
    user: User;
    onConnect: (userId: string) => void;
    connectionStatus?: 'pending' | 'accepted' | 'rejected' | 'none';
    isCurrentUser?: boolean;
}

export function SearchUserItem({ user, onConnect, connectionStatus = 'none', isCurrentUser = false }: SearchUserItemProps) {
    const isGolden = isGoldenUser(user.username);

    return (
        <div className="flex items-center justify-between py-2">
            <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`relative ${isGolden ? 'p-[2px] rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500' : ''}`}>
                    <img
                        src={user.profile_image || `https://ui-avatars.com/api/?name=${user.name}`}
                        alt={user.username}
                        className={`w-12 h-12 rounded-full object-cover border-2 ${isGolden ? 'border-white' : 'border-gray-100'} flex-shrink-0`}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <h4 className={`font-semibold text-sm truncate ${isGolden ? 'text-amber-600' : 'text-gray-900'}`}>
                            {user.username}
                        </h4>
                        {isGolden && <Crown size={12} className="text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                        {user.name} • {user.college}
                    </p>
                </div>
            </Link>
            {isCurrentUser ? (
                <Link href={`/profile/${user.id}`}>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-4 text-xs font-semibold rounded-lg ml-2 flex-shrink-0 bg-gray-50 text-gray-900 border-none hover:bg-gray-100"
                    >
                        View
                    </Button>
                </Link>
            ) : connectionStatus === 'accepted' ? (
                <span className="text-xs font-medium text-gray-500 ml-2 px-4">Connected</span>
            ) : (
                <Button
                    size="sm"
                    variant={connectionStatus === 'none' ? 'default' : 'outline'}
                    className={`h-8 px-4 text-xs font-semibold rounded-lg ml-2 flex-shrink-0 ${connectionStatus === 'none' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-none'
                        }`}
                    onClick={() => onConnect(user.id)}
                    disabled={connectionStatus !== 'none'}
                >
                    {connectionStatus === 'none' ? 'Connect' : 'Requested'}
                </Button>
            )}
        </div>
    );
}
