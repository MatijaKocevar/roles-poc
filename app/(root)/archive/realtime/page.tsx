import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ArchiveRealtimePage() {
    const assets = await getUserModuleAssets("archive-realtime");
    if (!assets) return null;

    return <AssetCards assets={assets} />;
}
