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
    onAssetChange: (assetId: number, assetType: AssetType) => void;
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
                value={newAsset.assetId ? `${newAsset.assetType}-${newAsset.assetId}` : ""}
                onChange={(e) => {
                    if (!e.target.value) return;
                    const [type, id] = e.target.value.split("-");
                    onAssetChange(Number(id), type as AssetType);
                }}
                className="h-10 rounded-md border border-input px-3"
            >
                <option value="">Select Asset</option>
                {portfolios.length > 0 && (
                    <optgroup label="Portfolios">
                        {portfolios.map((portfolio) => (
                            <option
                                key={`PORTFOLIO-${portfolio.id}`}
                                value={`PORTFOLIO-${portfolio.id}`}
                            >
                                {portfolio.name}
                            </option>
                        ))}
                    </optgroup>
                )}
                {regulationGroups.length > 0 && (
                    <optgroup label="Regulation Groups">
                        {regulationGroups.map((group) => (
                            <option
                                key={`REGULATION_GROUP-${group.id}`}
                                value={`REGULATION_GROUP-${group.id}`}
                            >
                                {group.name}
                            </option>
                        ))}
                    </optgroup>
                )}
                {regulationUnits.length > 0 && (
                    <optgroup label="Regulation Units">
                        {regulationUnits.map((unit) => (
                            <option
                                key={`REGULATION_UNIT-${unit.id}`}
                                value={`REGULATION_UNIT-${unit.id}`}
                            >
                                {unit.name}
                            </option>
                        ))}
                    </optgroup>
                )}
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
