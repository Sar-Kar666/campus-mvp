'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface FeedPostProps {
    post: {
        id: string;
        url: string;
        created_at: string;
        users: {
            id: string;
            name: string;
            profile_image: string;
            college: string;
        };
    };
}

export function FeedPost({ post }: FeedPostProps) {
    const user = post.users;

    return (
        <div className="bg-white border-b border-gray-100 pb-4 mb-4">
            {/* Header */}
            <div className="flex items-center p-3">
                <Link href={`/profile/${user.id}`} className="flex items-center space-x-3">
                    <img
                        src={user.profile_image || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-500">{user.college}</p>
                    </div>
                </Link>
            </div>

            {/* Image */}
            <div className="aspect-square w-full bg-gray-100">
                <img
                    src={post.url}
                    alt={`Post by ${user.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Footer / Actions (Simplified for now) */}
            <div className="px-3 pt-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}
