import { Icons } from '@aether/ui/icons';
import { Button } from '@aether/ui/button';
import { cn } from '@aether/ui/utils';

interface FigmaCardProps {
    nodeName: string;
    nodeId: string;
    previewUrl?: string;
    onGenerateCode?: () => void;
    isGenerating?: boolean;
}

export const FigmaCard = ({
    nodeName,
    nodeId,
    previewUrl,
    onGenerateCode,
    isGenerating,
}: FigmaCardProps) => {
    return (
        <div className="w-full my-2 overflow-hidden border rounded-lg bg-background-secondary border-border-secondary">
            <div className="flex gap-3 p-3">
                {/* Icon / Preview */}
                <div className="flex items-center justify-center w-8 h-8 rounded bg-[#F24E1E]/10 text-[#F24E1E]">
                    <Icons.ComponentInstance className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate text-foreground">{nodeName}</h4>
                    <p className="text-xs text-foreground-secondary truncate">
                        Figma Node: {nodeId}
                    </p>
                </div>
            </div>

            {/* Preview Image (if available) */}
            {previewUrl && (
                <div className="px-3 pb-3">
                    <div className="overflow-hidden rounded border border-border-tertiary bg-white/5 aspect-video">
                        <img
                            src={previewUrl}
                            alt={nodeName}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 p-2 border-t border-border-secondary bg-background-tertiary/30">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-foreground-secondary hover:text-foreground"
                    asChild
                >
                    <a
                        href={`https://www.figma.com/file/${nodeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open in Figma <Icons.ExternalLink className="w-3 h-3 ml-1.5" />
                    </a>
                </Button>

                {onGenerateCode && (
                    <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-xs gap-1.5 bg-[#F24E1E] hover:bg-[#F24E1E]/90 text-white border-none"
                        onClick={onGenerateCode}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <Icons.Reload className="w-3 h-3 animate-spin" />
                                Generating code...
                            </>
                        ) : (
                            <>
                                <Icons.Code className="w-3 h-3" />
                                Generate Code
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};
