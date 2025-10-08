import { Outlet, redirect } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "components";
import { account } from "~/appwrite/client";
import { getExistingUser, storeUserData } from "~/appwrite/auth";

export async function clientLoader() {
  try {
    const user = await account.get();

    if (!user.$id) throw redirect("/sign-in");

    const existingUser = await getExistingUser(user.$id);

    // If user doesn't exist yet, create them
    if (!existingUser?.$id) {
      const newUser = await storeUserData();
      // New users are created with status "user", so redirect them away
      if (newUser?.status !== "admin") {
        throw redirect("/");
      }
      return newUser;
    }

    // If existing user is not admin, redirect them away
    if (existingUser.status !== "admin") {
      throw redirect("/");
    }

    return existingUser;
  } catch (e) {
    if (e instanceof Response) throw e;
    console.log("Error in clientLoader", e);
    throw redirect("/sign-in");
  }
}

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <MobileSidebar />

      <aside className="w-full max-w-[270px] hidden lg:block">
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>
      <aside className="children">
        <Outlet />
      </aside>
    </div>
  );
};

export default AdminLayout;
