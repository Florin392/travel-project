import { parseTripData } from "~/lib/utils";
import { appwriteConfig, tablesDB } from "./client";

interface Row {
  [key: string]: any;
}

type FilterByDate = (
  items: Row[],
  key: string,
  start: string,
  end?: string
) => number;

export const getUsersAndTripsStats = async (): Promise<DashboardStats> => {
  const currentDate = new Date();
  const startCurrentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).toISOString();
  const startPrevMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    -1
  ).toISOString();
  const endPrevMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).toISOString();

  const [users, trips] = await Promise.all([
    tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.userTableId,
    }),
    tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.tripTableId,
    }),
  ]);

  const filterByDate: FilterByDate = (items, key, start, end) =>
    items.filter((item) => item[key] >= start && (!end || item[key] <= end))
      .length;

  const filterUsersByRole = (role: string) => {
    return users.rows.filter((u: Row) => u.status === role);
  };

  return {
    totalUsers: users.total,
    usersJoined: {
      currentMonth: filterByDate(
        users.rows,
        "joinedAt",
        startCurrentDate,
        undefined
      ),
      lastMonth: filterByDate(
        users.rows,
        "joinedAt",
        startPrevMonth,
        endPrevMonth
      ),
    },
    userRole: {
      total: filterUsersByRole("user").length,
      currentMonth: filterByDate(
        filterUsersByRole("user"),
        "joinedAt",
        startCurrentDate,
        undefined
      ),
      lastMonth: filterByDate(
        filterUsersByRole("user"),
        "joinedAt",
        startPrevMonth,
        endPrevMonth
      ),
    },
    totalTrips: trips.total,
    //   tripsCreatedOverTime
    tripsCreated: {
      currentMonth: filterByDate(
        trips.rows,
        "createdAt",
        startCurrentDate,
        undefined
      ),
      lastMonth: filterByDate(
        filterUsersByRole("user"),
        "joinedAt",
        startPrevMonth,
        endPrevMonth
      ),
    },
  };
};

export const getUserGrowthPerDay = async () => {
  const users = await tablesDB.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.userTableId,
  });

  const userGrowth = users.rows.reduce(
    (acc: { [key: string]: number }, user: Row) => {
      const date = new Date(user.joinedAt);
      const day = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {}
  );

  return Object.entries(userGrowth).map(([day, count]) => ({
    count: Number(count),
    day,
  }));
};

export const getTripsCreatedPerDay = async () => {
  const trips = await tablesDB.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripTableId,
  });

  const trtripsGrowth = trips.rows.reduce(
    (acc: { [key: string]: number }, trip: Row) => {
      const date = new Date(trip.createdAt);
      const day = date.toLocaleDateString("en-Us", {
        month: "short",
        day: "numeric",
      });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {}
  );

  return Object.entries(trtripsGrowth).map(([day, count]) => ({
    count: Number(count),
    day,
  }));
};

export const getTripsByTravelStyle = async () => {
  const trips = await tablesDB.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tripTableId,
  });

  const travelStyleCounts = trips.rows.reduce(
    (acc: { [key: string]: number }, trip: Row) => {
      const tripDetail = parseTripData(trip.tripDetails);

      if (tripDetail && tripDetail.travelStyle) {
        const travelStyle = tripDetail.travelStyle;
        acc[travelStyle] = (acc[travelStyle] || 0) + 1;
      }

      return acc;
    },
    {}
  );

  return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
    count: Number(count),
    travelStyle,
  }));
};
