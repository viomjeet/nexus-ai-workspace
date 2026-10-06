export const NavItemList = [
    {
        id: "audio",
        label: "Voiceover Studio",
        icon: "🎙️",
        iconSize: "text-sm",
        badge: {
            text: "PRO",
            className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40",
        },
    },
    {
        id: "video",
        label: "AI Video Studio",
        icon: "🎬",
        iconSize: "text-sm",
        badge: {
            text: "MOTION",
            className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40",
        },
    },
    {
        id: "history",
        label: "Project Exports",
        icon: "📦",
        iconSize: "text-sm",
        badge: {
            text: "RECENT",
            className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40",
        },
    },
    {
        type: "separator",
        label: "Data & Performance", // optional divider label
    },
    {
        id: "large-data",
        label: "Large Data Feed",
        icon: "⚡",
        iconSize: "text-sm",
        badge: {
            text: "TANSTACK",
            className: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
        },
    },
];