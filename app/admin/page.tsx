import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";
import { clerkClient } from "@clerk/nextjs/server";
import { setRole, removeRole } from "./_actions";
import { SearchUsers } from "./SearchUsers";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  // RBAC: enforce admin only
  if (!(await checkRole("admin"))) {
    redirect("/");
  }

  const query = searchParams?.search;
  const client = await clerkClient();

  const users = query ? (await client.users.getUserList({ query })).data : [];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Kullanıcı rollerini yönetin ve arama yapın.
        </p>
      </div>

      {/* Search Component */}
      <SearchUsers />
      <Separator />

      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.length === 0 && (
          <p className="text-muted-foreground">Kullanıcı bulunamadı.</p>
        )}

        {users.map((user) => {
          const primaryEmail = user.emailAddresses.find(
            (email) => email.id === user.primaryEmailAddressId
          )?.emailAddress;

          const role = (user.publicMetadata.role as string) || "none";

          return (
            <Card key={user.id} className="shadow-sm border">
              <CardHeader>
                <CardTitle>
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription>{primaryEmail}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Role:</span>
                  <Badge
                    variant={role === "admin" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {role}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                {/* Make Admin */}
                <form action={setRole} className="w-full">
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="role" value="admin" />

                  <Button
                    type="submit"
                    className="w-full"
                    variant={role === "admin" ? "secondary" : "default"}
                  >
                    Make Admin
                  </Button>
                </form>

                {/* Make Moderator */}
                <form action={setRole} className="w-full">
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="role" value="moderator" />

                  <Button
                    type="submit"
                    className="w-full"
                    variant={role === "moderator" ? "secondary" : "outline"}
                  >
                    Make Moderator
                  </Button>
                </form>

                {/* Remove Role */}
                <form action={removeRole} className="w-full">
                  <input type="hidden" name="id" value={user.id} />
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                  >
                    Remove Role
                  </Button>
                </form>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
