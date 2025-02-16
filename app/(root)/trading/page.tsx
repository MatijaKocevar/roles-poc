import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function TradingPage() {
    const assets = await getUserModuleAssets("trading");
    if (!assets) return null;

    return <AssetCards moduleId={assets.moduleId} assets={assets.assets} />;
}
