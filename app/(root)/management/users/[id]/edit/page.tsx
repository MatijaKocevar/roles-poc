import { hasViewPermission } from "../../../../../../actions/hasViewPermissions";
import { redirect } from "next/navigation";
import { getUserById } from "../../../../../../actions/user";
import UserInfoDisplay from "../../../../../../components/UserInfoDisplay";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
    params: asyncParams,
}: {
    params: Promise<{ id: string }>;
}) {
    const canView = await hasViewPermission("management-users");
    if (!canView) {
        redirect("/unauthorized");
    }

    const params = await asyncParams;
    const { id } = await Promise.resolve(params);

    const data = await getUserById(Number(id));

    return (
        <div>
            <UserInfoDisplay user={data?.user} />
        </div>
    );
}
