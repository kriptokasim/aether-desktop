import { useAetherAISettings } from '@/lib/settings/aiSettings';
import { Button } from '@onlook/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@onlook/ui/dropdown-menu';
import { Icons } from '@onlook/ui/icons';
import { Input } from '@onlook/ui/input';
import { observer } from 'mobx-react-lite';

const AISettingsTab = observer(() => {
    const { settings, setAetherAISettings } = useAetherAISettings();

    return (
        <div className="flex flex-col gap-8 p-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">Anthropic Model</p>
                    <p className="text-foreground-onlook text-small">
                        Specify the Anthropic model to use (e.g. claude-3-5-sonnet-20241022)
                    </p>
                </div>
                <div className="min-w-[200px]">
                    <Input
                        value={settings.anthropicModel}
                        onChange={(e) => setAetherAISettings({ anthropicModel: e.target.value })}
                        className="bg-secondary"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">Auto-apply Code</p>
                    <p className="text-foreground-onlook text-small">
                        Automatically apply code suggestions from AI
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="text-smallPlus min-w-[150px]">
                            {settings.autoApplyCode ? 'On' : 'Off'}
                            <Icons.ChevronDown className="ml-auto" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[150px]">
                        <DropdownMenuItem
                            onClick={() => setAetherAISettings({ autoApplyCode: true })}
                        >
                            <span>On</span>
                            {settings.autoApplyCode && <Icons.CheckCircled className="ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setAetherAISettings({ autoApplyCode: false })}
                        >
                            <span>Off</span>
                            {!settings.autoApplyCode && <Icons.CheckCircled className="ml-auto" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
});

export default AISettingsTab;
