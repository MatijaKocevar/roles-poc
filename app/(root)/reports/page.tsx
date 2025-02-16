import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ReportsPage() {
    const assets = await getUserModuleAssets("reports");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
