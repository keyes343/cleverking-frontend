

export type User = {
    googleId: string;
    roomBooked: number;
};
export type room = {
    name: number;
    availability: boolean;
    userEmail?: string // doc ids of users
};
