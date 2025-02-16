import { AssetAccess } from "@/types/user";
import { AssetType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AssetCardsProps {
    moduleId: number | null;
    assets: AssetAccess[];
}

export function AssetCards({ assets, moduleId }: AssetCardsProps) {
    const portfolios = assets?.filter((asset) => asset.assetType === AssetType.PORTFOLIO);
    const regGroups = assets?.filter((asset) => asset.assetType === AssetType.REGULATION_GROUP);
    const regUnits = assets?.filter((asset) => asset.assetType === AssetType.REGULATION_UNIT);

    const hasAccessToPortfolio = (portfolioId?: number) =>
        portfolioId ? portfolios.some((p) => p.id === portfolioId) : false;

    const hasAccessToGroup = (groupId?: number) =>
        groupId ? regGroups.some((g) => g.id === groupId) : false;

    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {portfolios.map((portfolio) => (
                    <Card key={portfolio.id} className="shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{portfolio.name}</span>
                                <Badge>
                                    {portfolio.accessProfiles.map((profile) => {
                                        const modulePermission = profile.modulePermissions.find(
                                            (perm) => perm.moduleId === moduleId
                                        );

                                        return modulePermission?.permission;
                                    })}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {regGroups
                                .filter((group) => group.portfolioId === portfolio.id)
                                .map((group) => (
                                    <Card key={group.id} className="bg-muted">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between text-base">
                                                <span>{group.name}</span>
                                                <Badge variant="outline">
                                                    {group.accessProfiles.map((profile) => {
                                                        const modulePermission =
                                                            profile.modulePermissions.find(
                                                                (perm) => perm.moduleId === moduleId
                                                            );

                                                        return modulePermission?.permission;
                                                    })}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-3">
                                            {regUnits
                                                .filter((unit) => unit.groupId === group.id)
                                                .map((unit) => (
                                                    <Card key={unit.id} className="bg-background">
                                                        <CardHeader className="py-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">
                                                                    {unit.name}
                                                                </span>
                                                                <Badge variant="secondary">
                                                                    {unit.accessProfiles.map(
                                                                        (profile) => {
                                                                            const modulePermission =
                                                                                profile.modulePermissions.find(
                                                                                    (perm) =>
                                                                                        perm.moduleId ===
                                                                                        moduleId
                                                                                );

                                                                            return modulePermission?.permission;
                                                                        }
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                        </CardHeader>
                                                    </Card>
                                                ))}
                                        </CardContent>
                                    </Card>
                                ))}
                        </CardContent>
                    </Card>
                ))}

                {regGroups
                    .filter((group) => !hasAccessToPortfolio(group.portfolioId))
                    .map((group) => (
                        <Card key={group.id} className="shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{group.name}</span>
                                    <Badge>
                                        {group.accessProfiles.map((profile) => {
                                            const modulePermission = profile.modulePermissions.find(
                                                (perm) => perm.moduleId === moduleId
                                            );

                                            return modulePermission?.permission;
                                        })}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {regUnits
                                    .filter((unit) => unit.groupId === group.id)
                                    .map((unit) => (
                                        <Card key={unit.id} className="bg-muted">
                                            <CardHeader className="py-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{unit.name}</span>
                                                    <Badge variant="secondary">
                                                        {unit.accessProfiles.map((profile) => {
                                                            const modulePermission =
                                                                profile.modulePermissions.find(
                                                                    (perm) =>
                                                                        perm.moduleId === moduleId
                                                                );

                                                            return modulePermission?.permission;
                                                        })}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                            </CardContent>
                        </Card>
                    ))}

                {regUnits
                    .filter((unit) => !hasAccessToGroup(unit.groupId))
                    .map((unit) => (
                        <Card key={unit.id} className="shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{unit.name}</span>
                                    <Badge>
                                        {unit.accessProfiles.map((profile) => {
                                            const modulePermission = profile.modulePermissions.find(
                                                (perm) => perm.moduleId === moduleId
                                            );

                                            return modulePermission?.permission;
                                        })}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
            </div>
        </div>
    );
}
