import { cn } from "@/lib/utils/tailwind"

export default function IemCard({ iem }: { iem: any }) {
    // Lead Domino: Safety check to prevent crash if data is missing
    if (!iem) return null;

    return (
        <div className="group relative flex flex-col gap-4 p-4 rounded-xl border border-transparent hover:bg-brand-800/20 transition-all">
            <div className="flex flex-col gap-1">
                <span className="text-small font-mono uppercase tracking-widest text-brand-400">
                    {iem?.category}
                </span>
                <h3 className="text-small font-bold text-brand-100 truncate">
                    {iem?.name}
                </h3>
            </div>
        </div>
    )
}
