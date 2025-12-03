import { Icons } from '@aether/ui/icons';
import { Button } from '@aether/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@aether/ui/dialog';
import { cn } from '@aether/ui/utils';
import { useState } from 'react';

interface ScreenshotCardProps {
    url?: string;
    base64?: string;
    caption?: string;
    onCritique?: () => void;
}

export const ScreenshotCard = ({ url, base64, caption, onCritique }: ScreenshotCardProps) => {
    const src = url || (base64 ? `data:image/png;base64,${base64}` : '');
    const [isOpen, setIsOpen] = useState(false);

    if (!src) {
        return null;
    }

    return (
        <div className="w-full my-2 overflow-hidden border rounded-lg bg-background-secondary border-border-secondary group">
            {/* Image Preview */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div className="relative cursor-zoom-in overflow-hidden aspect-video bg-black/5">
                        <img
                            src={src}
                            alt="Screenshot"
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                            <div className="px-3 py-1.5 text-xs font-medium text-white bg-black/50 rounded-full backdrop-blur-sm">
                                Click to Expand
                            </div>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <img
                        src={src}
                        alt="Screenshot Full"
                        className="object-contain w-full h-full rounded-lg"
                    />
                </DialogContent>
            </Dialog>

            {/* Footer / Actions */}
            <div className="flex items-center justify-between p-3 bg-background-tertiary/50">
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                    <Icons.Image className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">
                        {caption || 'Screenshot captured'}
                    </span>
                </div>

                {onCritique && (
                    <button
                        onClick={onCritique}
                        className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-foreground-secondary hover:text-foreground bg-background-primary hover:bg-background-secondary border border-border-secondary rounded transition-colors"
                    >
                        <Icons.EyeOpen className="w-3 h-3" />
                        Critique
                    </button>
                )}
            </div>
        </div>
    );
};
