export default function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
    );
}

export function SkeletonRow({ cols = 4 }) {
    return (
        <tr className="border-b">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="py-4 px-2">
                    <Skeleton className="h-4 w-3/4" />
                </td>
            ))}
        </tr>
    );
}
