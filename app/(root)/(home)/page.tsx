import UserInfoDisplay from "./UserInfoDisplay";
import { getActiveUser } from "../../../actions/active-user";

export default async function HomePage() {
    const data = await getActiveUser();

    return (
        <div>
            <UserInfoDisplay user={data?.activeUser} />
        </div>
    );
}
