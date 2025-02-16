import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function TradingHistoryPage() {
    const assets = await getUserModuleAssets("trading-history");
    if (!assets) return null;

    return <AssetCards moduleId={assets.moduleId} assets={assets.assets} />;
}
