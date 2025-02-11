interface UserHeaderProps {
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
}

export function UserHeader({ firstName, lastName, email, companyName }: UserHeaderProps) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-2">
                <div className="font-bold text-xl text-gray-700">{firstName}</div>
                <div className="font-bold text-xl text-gray-700">{lastName}</div>
            </div>
            <div className="text-gray-700">{email}</div>
            {companyName && <div className="text-gray-700">Company: {companyName}</div>}
        </div>
    );
}
