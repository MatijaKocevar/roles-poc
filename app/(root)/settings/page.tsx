import { redirect } from "next/navigation";

export default async function SystemPage() {
    redirect("/settings/general");
}
