import EditAccessProfileForm from "../../../../../../components/EditAccessProfileForm";

export default async function EditRolePage({
    params: asyncParams,
}: {
    params: Promise<{ id: string }>;
}) {
    const params = await asyncParams;
    const { id } = await Promise.resolve(params);

    return (
        <div>
            <EditAccessProfileForm accessProfileId={id} />
        </div>
    );
}
