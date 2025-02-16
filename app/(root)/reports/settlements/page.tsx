import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ReportsSettlementsPage() {
    const assets = await getUserModuleAssets("reports-settlements");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
