import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="container mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
            <p className="text-lg mb-4">You do not have permission to view this page.</p>
            <Link
                href="/"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Return Home
            </Link>
        </div>
    );
}
