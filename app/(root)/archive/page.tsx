import GenericPage from "@/components/GenericPage";
import { hasViewPermission } from "../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";

export default async function ArchivePage() {
    const canView = await hasViewPermission("archive");

    if (!canView) {
        redirect("/unauthorized");
    }

    return <GenericPage pageName="archive" />;
}
