import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, tablesDB } from "./client";
import { redirect } from "react-router";

export const getExistingUser = async (id: string) => {
  try {
    const response = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [Query.equal("accountId", id)],
    });
    return response.rows.length > 0 ? response.rows[0] : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const storeUserData = async () => {
  try {
    const user = await account.get();
    if (!user?.$id) {
      return null;
    }

    const response = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [Query.equal("accountId", user.$id)],
    });

    if (response.rows.length > 0) {
      return response.rows[0];
    }

    const imageUrl = await getGooglePicture();

    const newUser = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      rowId: ID.unique(),
      data: {
        accountId: user.$id,
        email: user.email,
        name: user.name,
        imageUrl: imageUrl || "",
        joinedAt: new Date().toISOString(),
        status: "user",
      },
    });

    console.log("New user created:", newUser);
    return newUser;
  } catch (e) {
    console.log("storeUserData error:", e);
    return null;
  }
};

export const getGooglePicture = async () => {
  try {
    const session = await account.getSession({
      sessionId: "current",
    });

    const oAuthToken = session.providerAccessToken;

    if (!oAuthToken) {
      return null;
    }

    const response = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=photos",
      {
        headers: {
          Authorization: `Bearer ${oAuthToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.photos?.[0]?.url || null;
  } catch (e) {
    console.log("getGooglePicture", e);
    return null;
  }
};

export const loginWithGoogle = () => {
  console.log("Starting Google OAuth...");
  console.log("Success URL:", `${window.location.origin}/sign-in`);
  console.log("Failure URL:", `${window.location.origin}/sign-in`);

  try {
    account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: `${window.location.origin}/auth/callback`,
      failure: `${window.location.origin}/sign-in`,
    });
    console.log("OAuth session created - should redirect now");
  } catch (e) {
    console.error("OAuth error:", e);
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession({
      sessionId: "current",
    });
    return true;
  } catch (e) {
    console.log("logoutUser", e);
    return false;
  }
};

export const getUser = async () => {
  try {
    const user = await account.get();
    if (!user) return redirect("/sign-in");

    const response = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [
        Query.equal("accountId", user.$id),
        Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
      ],
    });

    return response.rows.length > 0 ? response.rows[0] : redirect("/sign-in");
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const getAllUsers = async (limit: number, offset: number) => {
  try {
    const { rows: users, total } = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
      queries: [Query.limit(limit), Query.offset(offset)],
    });

    if (total === 0) return { users: [], total };

    return { users, total };
  } catch (error) {
    console.log("Error fetching users:", error);
    return { users: [], total: 0 };
  }
};
