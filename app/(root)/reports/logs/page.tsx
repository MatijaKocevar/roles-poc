import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ReportsLogsPage() {
    const assets = await getUserModuleAssets("reports-logs");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
