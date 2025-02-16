import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ContractsOverviewPage() {
    const assets = await getUserModuleAssets("contracts-overview");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
