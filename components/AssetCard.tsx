import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetAccess } from "@/types/user";
import { AssetType } from "@prisma/client";

const assetTypeLabels: Record<AssetType, string> = {
    PORTFOLIO: "Portfolio",
    REGULATION_GROUP: "Regulation Group",
    REGULATION_UNIT: "Regulation Unit",
};

export function AssetCard({ asset }: { asset: AssetAccess }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                        <Badge variant="secondary" className="mt-2">
                            {assetTypeLabels[asset.assetType]}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Access Profiles:</h4>
                    <div className="space-y-1">
                        {asset.accessProfiles.map((profile) => (
                            <div
                                key={profile.id}
                                className="flex items-center justify-between text-sm p-2 bg-muted rounded-md"
                            >
                                <span>{profile.name}</span>
                                {profile.source && (
                                    <Badge variant="outline" className="text-xs">
                                        Inherited from {profile.source.name}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
