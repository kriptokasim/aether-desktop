import { useEditorEngine } from '@/components/Context';
import { SettingsTabValue } from '@/lib/models';

import { Button } from '@aether/ui/button';
import { Icons } from '@aether/ui/icons';
import { observer } from 'mobx-react-lite';

export const ErrorMessage = observer(() => {
    const editorEngine = useEditorEngine();
    const rateLimited = editorEngine.chat.stream.rateLimited;

    if (rateLimited) {
        const requestLimit =
            rateLimited.reason === 'daily'
                ? rateLimited.daily_requests_limit
                : rateLimited.monthly_requests_limit;

        return (
            <div className="flex w-full flex-col items-center justify-center gap-2 text-small px-4 pb-4">
                <p className="text-foreground-secondary text-mini my-1 text-blue-300 select-none">
                    You reached your {rateLimited.reason} {requestLimit} message limit.
                </p>
                <Button
                    className="w-full mx-10 bg-blue-500 text-white border-blue-400 hover:border-blue-200/80 hover:text-white hover:bg-blue-400 shadow-blue-500/50 hover:shadow-blue-500/70 shadow-lg transition-all duration-300"
                    onClick={() => (editorEngine.isPlansOpen = true)}
                >
                    Get unlimited {rateLimited.reason} messages
                </Button>
            </div>
        );
    }

    const errorMessage = editorEngine.chat.stream.errorMessage;
    if (errorMessage) {
        const isConfigError = errorMessage.includes('Anthropic AI is not configured');
        return (
            <div className="flex w-full flex-col items-center justify-center gap-2 p-2 text-small text-red">
                <div className="flex flex-row items-center justify-center gap-2">
                    <Icons.ExclamationTriangle className="w-6" />
                    <p className="w-5/6 text-wrap overflow-auto">{errorMessage}</p>
                </div>
                {isConfigError && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            editorEngine.isSettingsOpen = true;
                            editorEngine.settingsTab = SettingsTabValue.AI;
                        }}
                    >
                        Configure AI
                    </Button>
                )}
            </div>
        );
    }
    return null;
});
