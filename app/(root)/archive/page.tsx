import { getUserModuleAssets } from "@/actions/user";
import { AssetCards } from "@/components/AssetCards";

export default async function ArchivePage() {
    const assets = await getUserModuleAssets("archive");
    if (!assets) return null;

    return <AssetCards moduleId={assets.moduleId} assets={assets.assets} />;
}
