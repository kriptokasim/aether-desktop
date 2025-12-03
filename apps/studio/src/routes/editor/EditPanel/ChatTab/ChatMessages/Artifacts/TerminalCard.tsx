import { Icons } from '@aether/ui/icons';
import { cn } from '@aether/ui/utils';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface TerminalCardProps {
    command: string;
    output: string;
    exitCode?: number;
    isRunning: boolean;
}

export const TerminalCard = ({ command, output, exitCode, isRunning }: TerminalCardProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    // Auto-scroll to bottom while running
    useEffect(() => {
        if (isRunning && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output, isRunning]);

    const getStatusColor = () => {
        if (isRunning) {
            return 'text-blue-400';
        }
        if (exitCode === 0) {
            return 'text-green-400';
        }
        return 'text-red-400';
    };

    const getStatusIcon = () => {
        if (isRunning) {
            return <Icons.Reload className="w-3 h-3 animate-spin" />;
        }
        if (exitCode === 0) {
            return <Icons.Check className="w-3 h-3" />;
        }
        return <Icons.CrossS className="w-3 h-3" />;
    };

    return (
        <div className="w-full max-w-full my-2 overflow-hidden border rounded-lg bg-gray-950 border-white/10 font-mono text-xs">
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-2 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div
                        className={cn(
                            'flex items-center justify-center w-5 h-5 rounded bg-white/10',
                            getStatusColor(),
                        )}
                    >
                        {getStatusIcon()}
                    </div>
                    <span className="text-gray-400 truncate font-medium">$ {command}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-[10px]">
                        {isRunning
                            ? 'Running...'
                            : exitCode === 0
                              ? 'Success'
                              : `Failed (${exitCode})`}
                    </span>
                    <Icons.ChevronDown
                        className={cn(
                            'w-4 h-4 text-gray-500 transition-transform',
                            isExpanded ? 'rotate-180' : '',
                        )}
                    />
                </div>
            </div>

            {/* Terminal Body */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div
                            ref={scrollRef}
                            className="p-3 overflow-x-auto overflow-y-auto max-h-[300px] text-gray-300 whitespace-pre-wrap break-all"
                        >
                            {output || <span className="text-gray-600 italic">No output...</span>}
                            {isRunning && (
                                <span className="inline-block w-2 h-4 ml-1 align-middle bg-gray-500 animate-pulse" />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
