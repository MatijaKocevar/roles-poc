import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function TradingOverviewPage() {
    const assets = await getUserModuleAssets("trading-overview");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
