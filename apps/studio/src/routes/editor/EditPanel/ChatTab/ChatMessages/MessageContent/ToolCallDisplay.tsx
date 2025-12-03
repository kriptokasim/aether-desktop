import { useEditorEngine, useUserManager } from '@/components/Context';
import { ChatMessageRole } from '@aether/models/chat';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@aether/ui/collapsible';
import { Icons } from '@aether/ui/icons';
import { cn } from '@aether/ui/utils';
import type { ToolCallPart } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { CodeBlock } from '../../CodeChangeDisplay/CodeBlock';
import { FigmaCard } from '../Artifacts/FigmaCard';
import { ScreenshotCard } from '../Artifacts/ScreenshotCard';
import { TerminalCard } from '../Artifacts/TerminalCard';

export const ToolCallDisplay = observer(
    ({ toolCall, isStream }: { toolCall: ToolCallPart; isStream: boolean }) => {
        const userManager = useUserManager();
        const editorEngine = useEditorEngine();
        const [isOpen, setIsOpen] = useState(false);

        const getAnimation = () => {
            if (isStream && userManager.settings.settings?.chat?.expandCodeBlocks) {
                return { height: 'auto', opacity: 1 };
            }
            return isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 };
        };

        // Find the result for this tool call
        const toolResult = editorEngine.chat.conversation.current?.messages
            .filter((m) => m.role === ChatMessageRole.TOOL)
            .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
            .find((c: any) => c.toolCallId === toolCall.toolCallId) as any;

        // Render specific cards based on tool name
        if (toolCall.toolName === 'run_terminal_command_safe') {
            const args = (toolCall as any).args as { command: string };
            const result = toolResult?.result as { output: string; exitCode?: number } | string;
            const output = typeof result === 'string' ? result : result?.output || '';
            const exitCode = typeof result === 'object' ? result?.exitCode : undefined;

            return (
                <TerminalCard
                    command={args?.command || ''}
                    output={output}
                    exitCode={exitCode}
                    isRunning={!toolResult && isStream}
                />
            );
        }

        if (toolCall.toolName === 'take_screenshot') {
            const args = (toolCall as any).args as { url?: string };
            const result = toolResult?.result as string; // Assuming base64 or URL is returned directly

            return (
                <ScreenshotCard
                    url={args?.url}
                    base64={result}
                    caption={args?.url ? `Screenshot of ${args.url}` : 'Screenshot'}
                />
            );
        }

        if (toolCall.toolName === 'read_figma_node') {
            const args = (toolCall as any).args as { nodeId: string };
            const result = toolResult?.result as { name: string; imageUrl?: string };

            return (
                <FigmaCard
                    nodeId={args?.nodeId || ''}
                    nodeName={result?.name || args?.nodeId || ''}
                    previewUrl={result?.imageUrl}
                    isGenerating={!toolResult && isStream}
                />
            );
        }

        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div
                    className={cn(
                        'border rounded-lg bg-background-primary relative',
                        !isOpen && 'group-hover:bg-background-secondary',
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center justify-between text-foreground-secondary transition-colors',
                            !isOpen && 'group-hover:text-foreground-primary',
                        )}
                    >
                        <CollapsibleTrigger asChild>
                            <div className="flex-1 flex items-center gap-2 cursor-pointer pl-3 py-2">
                                <Icons.ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform duration-200',
                                        isOpen && 'rotate-180',
                                    )}
                                />
                                <span
                                    className={cn(
                                        'text-small pointer-events-none select-none',
                                        isStream && 'text-shimmer',
                                    )}
                                >
                                    Used tool
                                </span>
                            </div>
                        </CollapsibleTrigger>

                        <div className="flex items-center mr-2 px-2 py-0 border rounded-md bg-background-secondary">
                            {toolCall.toolName}
                        </div>
                    </div>

                    <CollapsibleContent forceMount>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="content"
                                initial={getAnimation()}
                                animate={getAnimation()}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div className="border-t">
                                    <CodeBlock
                                        code={JSON.stringify((toolCall as any).args, null, 2)}
                                        variant="minimal"
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        );
    },
);
