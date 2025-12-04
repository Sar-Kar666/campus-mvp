export interface User {
    id: string;
    username: string;
    name: string;
    college: string;
    branch: string;
    year: string;
    email?: string;
    bio?: string;
    interests: string[];
    profile_image?: string;
}

export interface Connection {
    id: string;
    requester_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
}

export type College = 'TIT' | 'ICFAI' | 'Techno' | 'JIS' | 'KIIT' | 'VIT' | 'LPU' | string;
export type Branch = 'CSE' | 'ECE' | 'ME' | 'CE' | 'IT' | 'AIML' | 'BBA' | 'MBA' | string;
export type Year = '1st' | '2nd' | '3rd' | '4th';
