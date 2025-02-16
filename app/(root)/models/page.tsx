import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ModelsPage() {
    const assets = await getUserModuleAssets("models");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
