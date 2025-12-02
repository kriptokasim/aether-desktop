import type { FileNode } from '@/lib/editor/engine/files';
import { cn } from '@aether/ui/utils';
import { forwardRef } from 'react';
import type { RowRendererProps } from 'react-arborist';

const FileTreeRow = forwardRef<
    HTMLDivElement,
    RowRendererProps<FileNode> & { isHighlighted?: boolean }
>(({ attrs, children, isHighlighted }, ref) => {
    return (
        <div
            ref={ref}
            {...attrs}
            className={cn(
                'outline-none h-6 cursor-pointer w-full rounded',
                'text-foreground-aether/70',
                !attrs['aria-selected'] && [
                    isHighlighted && 'bg-background-aether text-foreground-primary',
                    'hover:text-foreground-primary hover:bg-background-aether',
                ],
                attrs['aria-selected'] && [
                    '!bg-[#FA003C] dark:!bg-[#FA003C]',
                    '!text-primary dark:!text-primary',
                    '![&]:hover:bg-[#FA003C] dark:[&]:hover:bg-[#FA003C]',
                ],
            )}
        >
            {children}
        </div>
    );
});

FileTreeRow.displayName = 'FileTreeRow';
export default FileTreeRow;
