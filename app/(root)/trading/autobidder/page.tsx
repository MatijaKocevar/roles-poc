import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function TradingAutobidderPage() {
    const assets = await getUserModuleAssets("trading-autobidder");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
