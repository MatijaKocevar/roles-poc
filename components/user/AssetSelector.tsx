import { Button } from "../ui/button";
import { AssetType } from "@prisma/client";

interface AssetSelectorProps {
    newAsset: {
        assetId: number;
        assetType: AssetType | "";
        accessProfileId: number;
    };
    portfolios: Array<{ id: number; name: string }>;
    regulationGroups: Array<{ id: number; name: string }>;
    regulationUnits: Array<{ id: number; name: string }>;
    accessProfiles: Array<{ id: number; name: string }>;
    onAssetChange: (e: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
    onAccessProfileChange: (accessProfileId: number) => void;
    onAddAsset: () => Promise<void>;
}

export function AssetSelector({
    newAsset,
    portfolios,
    regulationGroups,
    regulationUnits,
    accessProfiles,
    onAssetChange,
    onAccessProfileChange,
    onAddAsset,
}: AssetSelectorProps) {
    return (
        <div className="flex gap-2">
            <select
                value={newAsset.assetId === 0 ? "" : newAsset.assetId}
                onChange={onAssetChange}
                className="h-10 rounded-md border border-input px-3"
            >
                <option value="">Select Asset</option>
                {portfolios.map((portfolio) => (
                    <option key={portfolio.id} value={portfolio.id}>
                        {portfolio.name} (Portfolio)
                    </option>
                ))}
                {regulationGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                        {group.name} (Regulation Group)
                    </option>
                ))}
                {regulationUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                        {unit.name} (Regulation Unit)
                    </option>
                ))}
            </select>
            <select
                value={newAsset.accessProfileId === 0 ? "" : newAsset.accessProfileId}
                onChange={(e) => onAccessProfileChange(parseInt(e.target.value))}
                className="h-10 rounded-md border border-input px-3"
            >
                <option value="">Select Access Profile</option>
                {accessProfiles.map((accessProfile) => (
                    <option key={accessProfile.id} value={accessProfile.id}>
                        {accessProfile.name}
                    </option>
                ))}
            </select>
            <Button onClick={onAddAsset}>Add Asset</Button>
        </div>
    );
}
