import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ReportsPage() {
    const userAssets = await getUserModuleAssets("reports");
    if (!userAssets) return null;

    return <AssetCards moduleId={userAssets.moduleId} assets={userAssets.assets ?? []} />;
}
