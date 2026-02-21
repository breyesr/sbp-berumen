import { redirect } from "next/navigation";

export default function RegisterRouteRedirect() {
  redirect("/admin/users");
}
