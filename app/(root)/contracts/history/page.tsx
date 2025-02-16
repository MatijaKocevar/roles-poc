import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ContractsHistoryPage() {
    const assets = await getUserModuleAssets("contracts-history");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
