import { redirect } from "next/navigation";
import { ROUTES } from "@/routing/constants";

export default function Home() {
  redirect(ROUTES.activities);
}
