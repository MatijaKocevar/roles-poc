import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ModelsOptimizationPage() {
    const assets = await getUserModuleAssets("models-optimization");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
