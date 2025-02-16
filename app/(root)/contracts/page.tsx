import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ContractsPage() {
    const assets = await getUserModuleAssets("contracts");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
