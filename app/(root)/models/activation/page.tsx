import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ModelsActivationPage() {
    const assets = await getUserModuleAssets("models-activation");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
