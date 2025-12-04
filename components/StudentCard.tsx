import { User } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';

interface StudentCardProps {
    user: User;
    onConnect: (userId: string) => void;
    connectionStatus?: 'pending' | 'accepted' | 'rejected' | 'none';
}

export function StudentCard({ user, onConnect, connectionStatus = 'none' }: StudentCardProps) {
    return (
        <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <CardContent className="pt-0 pb-4 relative">
                <div className="flex justify-between items-start">
                    <div className="-mt-12 mb-3">
                        <img
                            src={user.profile_image || `https://ui-avatars.com/api/?name=${user.name}`}
                            alt={user.name}
                            className="w-24 h-24 rounded-full border-4 border-white bg-white object-cover"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">
                        {user.college === 'Unknown' ? 'College N/A' : user.college} • {user.branch === 'Unknown' ? 'Branch N/A' : user.branch} • {user.year}
                    </p>
                    {user.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{user.bio}</p>
                    )}
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                    {user.interests.slice(0, 3).map((interest, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                            {interest}
                        </Badge>
                    ))}
                    {user.interests.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{user.interests.length - 3}</Badge>
                    )}
                </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-3">
                <Button
                    className="w-full"
                    size="sm"
                    onClick={() => onConnect(user.id)}
                    disabled={connectionStatus !== 'none'}
                    variant={connectionStatus === 'none' ? 'default' : 'outline'}
                >
                    {connectionStatus === 'none' && <><UserPlus className="w-4 h-4 mr-2" /> Connect</>}
                    {connectionStatus === 'pending' && 'Request Sent'}
                    {connectionStatus === 'accepted' && 'Connected'}
                    {connectionStatus === 'rejected' && 'Rejected'}
                </Button>
            </CardFooter>
        </Card>
    );
}
