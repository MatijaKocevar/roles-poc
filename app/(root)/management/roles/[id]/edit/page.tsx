import EditRoleForm from "../../../../../../components/EditRoleForm";

export default async function EditRolePage({
    params: asyncParams,
}: {
    params: Promise<{ id: string }>;
}) {
    const params = await asyncParams;
    const { id } = await Promise.resolve(params);

    return (
        <div>
            <h1>Edit Role</h1>
            <EditRoleForm roleId={id} />
        </div>
    );
}
