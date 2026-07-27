import {db} from "@/lib/db"

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({ where: {email}});
        return user;
    } catch {
        return null
    }
}

export const getUserByUsername = async (username: string) => {
try {
const user = await db.user.findUnique({ where: { username } });
return user;
} catch {
return null;
}
};

export const getUserById = async (id: string | undefined) => {
    try {
        const user = await db.user.findUnique({ where: {id}});
        return user;
    } catch {
        return null;
    }
}

export const getUserByEmailOrUsername = async (query: string) => {
  try {
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: query },
          { username: query }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true
      }
    });
    return user;
  } catch {
    return null;
  }
}