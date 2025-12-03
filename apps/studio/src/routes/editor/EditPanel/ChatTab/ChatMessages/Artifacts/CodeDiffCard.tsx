import { Button } from '@aether/ui/button';
import { Icons } from '@aether/ui/icons';
import { cn } from '@aether/ui/utils';
import { useState } from 'react';
import { CodeBlock } from '../../CodeChangeDisplay/CodeBlock';

interface CodeDiffCardProps {
    path: string;
    originalContent: string;
    newContent: string;
    onApply?: () => void;
    onReject?: () => void;
    isApplied?: boolean;
}

export const CodeDiffCard = ({
    path,
    originalContent,
    newContent,
    onApply,
    onReject,
    isApplied = false,
}: CodeDiffCardProps) => {
    const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

    return (
        <div className="w-full my-2 overflow-hidden border rounded-lg bg-background-secondary border-border-secondary">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-background-tertiary/50 border-b border-border-secondary">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Icons.File className="w-3.5 h-3.5 text-foreground-tertiary" />
                    <span className="truncate max-w-[200px]">{path}</span>
                </div>
                <div className="flex items-center gap-1 bg-background-primary rounded-md p-0.5 border border-border-primary">
                    <button
                        onClick={() => setViewMode('unified')}
                        className={cn(
                            'px-2 py-0.5 text-[10px] rounded-sm transition-colors',
                            viewMode === 'unified'
                                ? 'bg-background-tertiary text-foreground'
                                : 'text-foreground-tertiary hover:text-foreground-secondary',
                        )}
                    >
                        Unified
                    </button>
                    <button
                        onClick={() => setViewMode('split')}
                        className={cn(
                            'px-2 py-0.5 text-[10px] rounded-sm transition-colors',
                            viewMode === 'split'
                                ? 'bg-background-tertiary text-foreground'
                                : 'text-foreground-tertiary hover:text-foreground-secondary',
                        )}
                    >
                        Split
                    </button>
                </div>
            </div>

            {/* Diff Content */}
            <div className="relative max-h-[300px] overflow-auto">
                {viewMode === 'unified' ? (
                    <div className="grid grid-cols-1">
                        <CodeBlock
                            code={originalContent}
                            variant="minimal"
                            className="opacity-50 grayscale"
                        />
                        <div className="border-t border-border-secondary my-1" />
                        <CodeBlock code={newContent} variant="minimal" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-px bg-border-secondary">
                        <div className="bg-background-primary overflow-auto">
                            <CodeBlock code={originalContent} variant="minimal" />
                        </div>
                        <div className="bg-background-primary overflow-auto">
                            <CodeBlock code={newContent} variant="minimal" />
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {!isApplied && (
                <div className="flex items-center justify-end gap-2 p-2 border-t border-border-secondary bg-background-tertiary/30">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/20 border-red-900/20"
                        onClick={onReject}
                    >
                        <Icons.Cross className="w-3 h-3" />
                        Reject
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-500 text-white border-none"
                        onClick={onApply}
                    >
                        <Icons.Check className="w-3 h-3" />
                        Apply
                    </Button>
                </div>
            )}
            {isApplied && (
                <div className="flex items-center justify-center p-2 border-t border-border-secondary bg-green-950/10 text-green-400 text-xs font-medium">
                    <Icons.Check className="w-3 h-3 mr-1.5" />
                    Changes Applied
                </div>
            )}
        </div>
    );
};
