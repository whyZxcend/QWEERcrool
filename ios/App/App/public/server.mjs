var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accounts: () => accounts,
  adminLogs: () => adminLogs,
  adminPermissions: () => adminPermissions,
  chats: () => chats,
  comments: () => comments,
  inviteLinks: () => inviteLinks,
  messageStatuses: () => messageStatuses,
  messages: () => messages,
  otpCodes: () => otpCodes,
  pinnedMessages: () => pinnedMessages,
  pushSubscriptions: () => pushSubscriptions,
  reports: () => reports,
  sessions: () => sessions,
  sharedThemes: () => sharedThemes,
  stickerPacks: () => stickerPacks,
  stickers: () => stickers,
  userBlocks: () => userBlocks,
  userContacts: () => userContacts,
  userMusicFavorites: () => userMusicFavorites,
  userMusicHistory: () => userMusicHistory,
  userMusicStatus: () => userMusicStatus,
  userReports: () => userReports,
  users: () => users
});
import { pgTable, text, timestamp, integer, jsonb, bigserial, bigint, index, boolean } from "drizzle-orm/pg-core";
var users, otpCodes, userContacts, chats, messages, comments, pinnedMessages, pushSubscriptions, stickerPacks, stickers, reports, sharedThemes, userBlocks, userReports, messageStatuses, accounts, sessions, adminPermissions, inviteLinks, adminLogs, userMusicStatus, userMusicFavorites, userMusicHistory;
var init_schema = __esm({
  "src/db/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      uid: text("uid").unique().notNull(),
      email: text("email").notNull(),
      passwordHash: text("password_hash"),
      displayName: text("display_name"),
      photoURL: text("photo_url"),
      status: text("status").default("offline"),
      lastSeen: timestamp("last_seen").defaultNow(),
      bio: text("bio"),
      username: text("username").unique(),
      phoneNumber: text("phone_number"),
      privacySettings: jsonb("privacy_settings").default({
        online_status: "everyone",
        bio: "everyone",
        avatar: "everyone",
        username: "everyone",
        messages: "everyone"
      }),
      role: text("role").default("user"),
      // 'user' | 'admin' | 'banned'
      recoveryEmail: text("recovery_email"),
      // почта для восстановления пароля
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    otpCodes = pgTable("otp_codes", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      userUid: text("user_uid").notNull(),
      email: text("email").notNull(),
      code: text("code").notNull(),
      // 6-значный код
      purpose: text("purpose").notNull(),
      // 'recovery' | 'verify'
      attempts: integer("attempts").default(0),
      expiresAt: timestamp("expires_at").notNull(),
      used: boolean("used").default(false),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("otp_codes_user_uid_idx").on(table.userUid),
      index("otp_codes_email_idx").on(table.email)
    ]);
    userContacts = pgTable("user_contacts", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      ownerUid: text("owner_uid").notNull(),
      contactUid: text("contact_uid").notNull(),
      alias: text("alias"),
      createdAt: timestamp("created_at").defaultNow()
    });
    chats = pgTable("chats", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      chatUid: text("chat_uid").unique(),
      type: text("type").notNull(),
      // 'private' | 'group' | 'channel'
      name: text("name"),
      description: text("description"),
      avatar: text("avatar"),
      creatorId: bigint("creator_id", { mode: "number" }),
      members: jsonb("members").default([]),
      // array of user uids
      participants: jsonb("participants").default([]),
      // array of user uids
      linkedChatId: bigint("linked_chat_id", { mode: "number" }),
      mutedBy: jsonb("muted_by").default([]),
      // array of user uids
      typing: jsonb("typing").default({}),
      // map of uid -> boolean
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      lastMessage: jsonb("last_message"),
      slowMode: integer("slow_mode").default(0),
      // { text, senderId, senderName, timestamp }
      bannedUsers: jsonb("banned_users").default([]),
      // array of user uids
      admins: jsonb("admins").default([]),
      adminPerms: jsonb("admin_perms").default({}),
      // array of user uids
      pinnedMessageUid: text("pinned_message_uid"),
      username: text("username"),
      activeCall: jsonb("active_call")
    });
    messages = pgTable("messages", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      msgUid: text("msg_uid").unique(),
      chatId: bigint("chat_id", { mode: "number" }).references(() => chats.id, { onDelete: "cascade" }).notNull(),
      senderId: bigint("sender_id", { mode: "number" }).notNull(),
      senderName: text("sender_name"),
      senderAvatar: text("sender_avatar"),
      text: text("text"),
      createdAt: timestamp("created_at").defaultNow(),
      fileUrl: text("file_url"),
      fileName: text("file_name"),
      fileType: text("file_type"),
      type: text("type").default("text"),
      // 'text' | 'voice' | 'file' | 'image' | 'video'
      duration: integer("duration"),
      replyTo: text("reply_to"),
      readBy: jsonb("read_by").default([]),
      flagged: text("flagged"),
      // null | 'reported' - помечено модератором
      reactions: jsonb("reactions").default({}),
      // map of user_uid -> emoji
      editedAt: timestamp("edited_at"),
      viewedBy: jsonb("viewed_by").default([])
      // время последнего редактирования
    });
    comments = pgTable("comments", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      commentUid: text("comment_uid").unique(),
      messageId: bigint("message_id", { mode: "number" }).references(() => messages.id, { onDelete: "cascade" }).notNull(),
      chatId: bigint("chat_id", { mode: "number" }).notNull(),
      userId: bigint("user_id", { mode: "number" }).notNull(),
      userName: text("user_name"),
      userAvatar: text("user_avatar"),
      text: text("text").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    pinnedMessages = pgTable("pinned_messages", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      chatId: bigint("chat_id", { mode: "number" }).references(() => chats.id, { onDelete: "cascade" }).notNull(),
      messageUid: text("message_uid").notNull(),
      // msgUid из таблицы messages
      pinnedBy: text("pinned_by").notNull(),
      // uid пользователя, который закрепил
      pinnedByName: text("pinned_by_name"),
      // displayName для быстрого отображения
      pinnedAt: timestamp("pinned_at").defaultNow().notNull(),
      sortOrder: integer("sort_order").default(0)
      // для ручной сортировки
    }, (table) => [
      index("pinned_messages_chat_id_idx").on(table.chatId),
      index("pinned_messages_message_uid_idx").on(table.messageUid)
    ]);
    pushSubscriptions = pgTable("push_subscriptions", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      userId: bigint("user_id", { mode: "number" }).references(() => users.id, { onDelete: "cascade" }).notNull(),
      endpoint: text("endpoint").notNull(),
      subscription: jsonb("subscription").notNull(),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    });
    stickerPacks = pgTable("sticker_packs", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      name: text("name").unique().notNull(),
      title: text("title").notNull(),
      authorId: bigint("author_id", { mode: "number" }).references(() => users.id, { onDelete: "set null" }),
      isDefault: text("is_default").default("false"),
      // 'true' для встроенных наборов
      thumbnail: text("thumbnail"),
      createdAt: timestamp("created_at").defaultNow()
    });
    stickers = pgTable("stickers", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      packId: bigint("pack_id", { mode: "number" }).references(() => stickerPacks.id, { onDelete: "cascade" }).notNull(),
      imageUrl: text("image_url").notNull(),
      emoji: text("emoji").default("\u{1F60A}"),
      width: integer("width"),
      height: integer("height"),
      createdAt: timestamp("created_at").defaultNow()
    });
    reports = pgTable("reports", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      messageId: bigint("message_id", { mode: "number" }).references(() => messages.id, { onDelete: "cascade" }).notNull(),
      reporterId: bigint("reporter_id", { mode: "number" }).references(() => users.id, { onDelete: "cascade" }).notNull(),
      reason: text("reason").notNull(),
      // причина жалобы
      createdAt: timestamp("created_at").defaultNow(),
      resolved: text("resolved").default("false")
      // 'true' если обработана
    });
    sharedThemes = pgTable("shared_themes", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      shareId: text("share_id").unique().notNull(),
      // короткий ID для ссылки
      themeData: jsonb("theme_data").notNull(),
      // полный объект ThemeConfig
      creatorUid: text("creator_uid"),
      // uid создателя (если авторизован)
      creatorUsername: text("creator_username"),
      // username создателя
      createdAt: timestamp("created_at").defaultNow()
    });
    userBlocks = pgTable("user_blocks", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      blockerUid: text("blocker_uid").notNull(),
      // кто заблокировал
      blockedUid: text("blocked_uid").notNull(),
      // кого заблокировали
      createdAt: timestamp("created_at").defaultNow()
    });
    userReports = pgTable("user_reports", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      targetUid: text("target_uid").notNull(),
      // на кого жалуются
      reporterUid: text("reporter_uid").notNull(),
      // кто жалуется
      reason: text("reason").notNull(),
      // причина жалобы
      description: text("description"),
      // дополнительное описание
      status: text("status").default("pending"),
      // 'pending' | 'resolved' | 'dismissed'
      adminNote: text("admin_note"),
      // заметка админа
      createdAt: timestamp("created_at").defaultNow(),
      resolvedAt: timestamp("resolved_at")
    });
    messageStatuses = pgTable("message_statuses", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      messageId: bigint("message_id", { mode: "number" }).references(() => messages.id, { onDelete: "cascade" }).notNull(),
      userId: bigint("user_id", { mode: "number" }).references(() => users.id, { onDelete: "cascade" }).notNull(),
      status: text("status").notNull(),
      // 'pending' | 'sent' | 'delivered' | 'opened' | 'read'
      pushSentAt: timestamp("push_sent_at"),
      pushDeliveredAt: timestamp("push_delivered_at"),
      openedAt: timestamp("opened_at"),
      readAt: timestamp("read_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    accounts = pgTable("accounts", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      ownerUid: text("owner_uid").notNull(),
      // uid основного (первичного) аккаунта
      userUid: text("user_uid").notNull().unique(),
      // uid привязанного аккаунта
      displayName: text("display_name"),
      email: text("email"),
      phoneNumber: text("phone_number"),
      photoUrl: text("photo_url"),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("accounts_owner_uid_idx").on(table.ownerUid)
    ]);
    sessions = pgTable("sessions", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      sessionUid: text("session_uid").unique().notNull(),
      userUid: text("user_uid").notNull(),
      browser: text("browser"),
      os: text("os"),
      deviceType: text("device_type").default("desktop"),
      ipAddress: text("ip_address"),
      location: text("location"),
      lastActive: timestamp("last_active").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      revoked: boolean("revoked").default(false)
    }, (table) => [
      index("sessions_user_uid_idx").on(table.userUid)
    ]);
    adminPermissions = pgTable("admin_permissions", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      chatId: bigint("chat_id", { mode: "number" }).references(() => chats.id, { onDelete: "cascade" }).notNull(),
      userUid: text("user_uid").notNull(),
      canEditInfo: boolean("can_edit_info").default(false),
      canEditAvatar: boolean("can_edit_avatar").default(false),
      canDeleteMessages: boolean("can_delete_messages").default(false),
      canRemoveMembers: boolean("can_remove_members").default(false),
      canInviteMembers: boolean("can_invite_members").default(false),
      canManageAdmins: boolean("can_manage_admins").default(false),
      canEditUsername: boolean("can_edit_username").default(false),
      canManageInvites: boolean("can_manage_invites").default(false),
      canPinMessages: boolean("can_pin_messages").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => [
      index("admin_permissions_chat_id_idx").on(table.chatId),
      index("admin_permissions_user_uid_idx").on(table.userUid)
    ]);
    inviteLinks = pgTable("invite_links", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      chatId: bigint("chat_id", { mode: "number" }).references(() => chats.id, { onDelete: "cascade" }).notNull(),
      token: text("token").unique().notNull(),
      createdBy: text("created_by").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      clickCount: integer("click_count").default(0),
      joinCount: integer("join_count").default(0),
      revoked: boolean("revoked").default(false),
      revokedAt: timestamp("revoked_at")
    }, (table) => [
      index("invite_links_chat_id_idx").on(table.chatId),
      index("invite_links_token_idx").on(table.token)
    ]);
    adminLogs = pgTable("admin_logs", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      chatId: bigint("chat_id", { mode: "number" }).references(() => chats.id, { onDelete: "set null" }),
      actorUid: text("actor_uid").notNull(),
      action: text("action").notNull(),
      targetUid: text("target_uid"),
      details: jsonb("details"),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("admin_logs_chat_id_idx").on(table.chatId)
    ]);
    userMusicStatus = pgTable("user_music_status", {
      userUid: text("user_uid").primaryKey(),
      isPlaying: boolean("is_playing").default(false),
      currentTrack: jsonb("current_track"),
      playbackPosition: integer("playback_position").default(0),
      staticTrack: jsonb("static_track"),
      broadcastEnabled: boolean("broadcast_enabled").default(true),
      privacy: text("privacy").default("everyone"),
      // 'everyone' | 'contacts' | 'nobody'
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userMusicFavorites = pgTable("user_music_favorites", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      userUid: text("user_uid").notNull(),
      trackId: text("track_id").notNull(),
      trackData: jsonb("track_data").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("user_music_favorites_user_uid_idx").on(table.userUid),
      index("user_music_favorites_track_id_idx").on(table.trackId)
    ]);
    userMusicHistory = pgTable("user_music_history", {
      id: bigserial("id", { mode: "number" }).primaryKey(),
      userUid: text("user_uid").notNull(),
      trackId: text("track_id").notNull(),
      trackData: jsonb("track_data").notNull(),
      playedAt: timestamp("played_at").defaultNow()
    }, (table) => [
      index("user_music_history_user_uid_idx").on(table.userUid)
    ]);
  }
});

// src/db/index.ts
var db_exports = {};
__export(db_exports, {
  createPool: () => createPool,
  db: () => db,
  ensureDbReady: () => ensureDbReady
});
import { drizzle as nodePgDrizzle } from "drizzle-orm/node-postgres";
import { drizzle as pgliteDrizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
async function ensureDbReady() {
  if (pgliteClient) {
    await pgliteClient.waitReady;
    try {
      await pgliteClient.exec(`
        CREATE TABLE IF NOT EXISTS pinned_messages (
          id BIGSERIAL PRIMARY KEY,
          chat_id BIGINT NOT NULL,
          message_uid TEXT NOT NULL,
          pinned_by TEXT NOT NULL,
          pinned_by_name TEXT,
          pinned_at TIMESTAMP DEFAULT NOW(),
          sort_order INTEGER DEFAULT 0
        )
      `);
      try {
        await pgliteClient.exec(`ALTER TABLE pinned_messages ALTER COLUMN pinned_by TYPE TEXT`);
      } catch (_ignore) {
      }
      const columnAlters = [
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS active_call JSONB",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS slow_mode INTEGER DEFAULT 0",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS linked_chat_id BIGINT",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS admin_perms JSONB DEFAULT '{}'::jsonb",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS username TEXT",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS pinned_message_uid TEXT",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS banned_users JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS admins JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS typing JSONB DEFAULT '{}'::jsonb",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS muted_by JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE chats ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE messages ADD COLUMN IF NOT EXISTS viewed_by JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb",
        "ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP",
        "ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_by JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE messages ADD COLUMN IF NOT EXISTS flagged TEXT",
        "ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to TEXT",
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"online_status":"everyone","bio":"everyone","avatar":"everyone","username":"everyone","messages":"everyone"}'::jsonb`,
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_email TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'"
      ];
      for (const alter of columnAlters) {
        try {
          await pgliteClient.exec(alter);
        } catch (_e) {
        }
      }
      await pgliteClient.exec(`CREATE INDEX IF NOT EXISTS pinned_messages_chat_id_idx ON pinned_messages(chat_id)`);
      await pgliteClient.exec(`CREATE INDEX IF NOT EXISTS pinned_messages_message_uid_idx ON pinned_messages(message_uid)`);
    } catch (e) {
      console.warn("\u26A0\uFE0F [DB] Failed to ensure tables/columns:", e);
    }
    try {
      await pgliteClient.exec(`
        CREATE TABLE IF NOT EXISTS accounts (
          id BIGSERIAL PRIMARY KEY,
          owner_uid TEXT NOT NULL,
          user_uid TEXT NOT NULL UNIQUE,
          display_name TEXT,
          email TEXT,
          phone_number TEXT,
          photo_url TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await pgliteClient.exec(`CREATE INDEX IF NOT EXISTS accounts_owner_uid_idx ON accounts(owner_uid)`);
    } catch (e) {
      console.warn("\u26A0\uFE0F [DB] Failed to ensure accounts table:", e);
    }
  }
}
function getPgliteDb() {
  if (pgliteDbInstance) {
    return pgliteDbInstance;
  }
  const pgdataDir = path.join(process.cwd(), "uploads", "pgdata");
  if (!fs.existsSync(pgdataDir)) {
    fs.mkdirSync(pgdataDir, { recursive: true });
  }
  pgliteClient = new PGlite(pgdataDir);
  console.log("\u{1F7E2} [DB] Connected to embedded PGlite instance at", pgdataDir);
  pgliteDbInstance = pgliteDrizzle({ client: pgliteClient, schema: schema_exports });
  return pgliteDbInstance;
}
var Pool, pgliteClient, pgliteDbInstance, dbInstance, createPool, host, isLocalhost, db;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    init_schema();
    ({ Pool } = pkg);
    dotenv.config({ path: process.env.NODE_ENV === "test" ? void 0 : ".env" });
    pgliteClient = null;
    pgliteDbInstance = null;
    dbInstance = null;
    createPool = () => {
      const host2 = process.env.SQL_HOST || "localhost";
      const user = process.env.SQL_USER || "postgres";
      const password = process.env.SQL_PASSWORD || "";
      const database = process.env.SQL_DB_NAME || "qwercrool";
      const port = process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432;
      return new Pool({
        host: host2,
        port,
        user,
        password,
        database,
        ssl: false,
        connectionTimeoutMillis: 2e3,
        max: parseInt(process.env.DB_POOL_MAX || "20", 10),
        idleTimeoutMillis: 1e4
      });
    };
    host = process.env.SQL_HOST;
    isLocalhost = host === "localhost" || host === "127.0.0.1" || !host;
    if (!isLocalhost && process.env.SQL_USER && process.env.SQL_DB_NAME) {
      try {
        const pool = createPool();
        pool.on("error", (err) => {
          console.error("\u{1F4A5} [DB] Postgres pool error:", err.message);
        });
        dbInstance = nodePgDrizzle(pool, { schema: schema_exports });
        console.log(`\u{1F7E2} [DB] Connected to external PostgreSQL pool at ${host}:${process.env.SQL_PORT || 5432}`);
      } catch (err) {
        console.warn("\u26A0\uFE0F [DB] Failed to connect to external Postgres, falling back to PGlite:", err.message);
        dbInstance = getPgliteDb();
      }
    } else {
      console.log("\u2139\uFE0F [DB] Using embedded PGlite database (localhost/default environment)");
      dbInstance = getPgliteDb();
    }
    db = dbInstance;
  }
});

// src/lib/auth.ts
import jwt from "jsonwebtoken";
function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    console.error("[FATAL] JWT_SECRET environment variable is not set. Refusing to start with insecure default.");
    throw new Error("JWT_SECRET environment variable is required");
  }
  return process.env.JWT_SECRET;
}
function getRefreshSecret() {
  if (!process.env.JWT_REFRESH_SECRET) {
    console.error("[FATAL] JWT_REFRESH_SECRET environment variable is not set.");
    throw new Error("JWT_REFRESH_SECRET environment variable is required");
  }
  return process.env.JWT_REFRESH_SECRET;
}
function signJwt(user, sessionUid) {
  const payload = { uid: user.uid, email: user.email };
  if (sessionUid) payload.sessionUid = sessionUid;
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN
  });
}
function verifyJwt(token, expectedSessionUid) {
  const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
  if (expectedSessionUid && decoded.sessionUid && decoded.sessionUid !== expectedSessionUid) {
    throw new Error("Session UID mismatch: token was issued for a different session");
  }
  return decoded;
}
function signRefreshJwt(user, sessionUid) {
  const payload = { uid: user.uid, email: user.email, type: "refresh" };
  if (sessionUid) payload.sessionUid = sessionUid;
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: REFRESH_EXPIRES_IN
  });
}
function verifyRefreshJwt(token, expectedSessionUid) {
  const decoded = jwt.verify(token, getRefreshSecret(), { algorithms: ["HS256"] });
  if (expectedSessionUid && decoded.sessionUid && decoded.sessionUid !== expectedSessionUid) {
    throw new Error("Session UID mismatch: refresh token was issued for a different session");
  }
  return decoded;
}
var JWT_EXPIRES_IN, REFRESH_EXPIRES_IN;
var init_auth = __esm({
  "src/lib/auth.ts"() {
    "use strict";
    JWT_EXPIRES_IN = "1h";
    REFRESH_EXPIRES_IN = "3d";
  }
});

// src/db/sessions.ts
var sessions_exports = {};
__export(sessions_exports, {
  cleanupOldSessions: () => cleanupOldSessions,
  createSession: () => createSession,
  getUserSessions: () => getUserSessions,
  isSessionActive: () => isSessionActive,
  revokeAllOtherSessions: () => revokeAllOtherSessions,
  revokeSession: () => revokeSession,
  touchSession: () => touchSession
});
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
function parseUserAgent(ua) {
  if (!ua) return { browser: "Unknown", os: "Unknown", deviceType: "desktop" };
  let browser = "Unknown";
  if (ua.includes("Firefox/") && !ua.includes("Seamonkey")) {
    browser = "Firefox";
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
  } else if (ua.includes("OPR/") || ua.includes("Opera")) {
    browser = "Opera";
  } else if (ua.includes("SamsungBrowser")) {
    browser = "Samsung Browser";
  } else if (ua.includes("UCBrowser") || ua.includes("UC Browser")) {
    browser = "UC Browser";
  } else if (ua.includes("Vivaldi")) {
    browser = "Vivaldi";
  } else if (ua.includes("Brave")) {
    browser = "Brave";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
  } else if (ua.includes("Chrome") && !ua.includes("Edg/")) {
    browser = "Chrome";
  }
  let os = "Unknown";
  if (ua.includes("Windows NT 10")) {
    os = "Windows 10/11";
  } else if (ua.includes("Windows NT 6.3")) {
    os = "Windows 8.1";
  } else if (ua.includes("Windows NT 6.1")) {
    os = "Windows 7";
  } else if (ua.includes("Windows")) {
    os = "Windows";
  } else if (ua.includes("Mac OS X")) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace("_", ".")}` : "macOS";
  } else if (ua.includes("Android")) {
    const match = ua.match(/Android (\d+[\.\d]*)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    const match = ua.match(/OS (\d+_\d+)/);
    os = match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  }
  let deviceType = "desktop";
  if (ua.includes("Mobile") || ua.includes("Android") && !ua.includes("Tablet") || ua.includes("iPhone")) {
    deviceType = "phone";
  } else if (ua.includes("iPad") || ua.includes("Tablet") || ua.includes("Android") && ua.includes("Tablet")) {
    deviceType = "tablet";
  }
  return { browser, os, deviceType };
}
async function createSession(params) {
  const { browser, os, deviceType } = parseUserAgent(params.userAgent);
  const sessionUid = randomUUID();
  await db.insert(sessions).values({
    sessionUid,
    userUid: params.userUid,
    browser,
    os,
    deviceType,
    ipAddress: params.ipAddress || null,
    lastActive: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date(),
    revoked: false
  });
  return { sessionUid };
}
async function touchSession(sessionUid) {
  try {
    await db.update(sessions).set({ lastActive: /* @__PURE__ */ new Date() }).where(and(
      eq(sessions.sessionUid, sessionUid),
      eq(sessions.revoked, false)
    ));
  } catch {
  }
}
async function isSessionActive(sessionUid) {
  const result = await db.select({ revoked: sessions.revoked }).from(sessions).where(eq(sessions.sessionUid, sessionUid)).limit(1);
  if (result.length === 0) return true;
  return result[0].revoked === false;
}
async function getUserSessions(userUid) {
  return db.select({
    sessionUid: sessions.sessionUid,
    browser: sessions.browser,
    os: sessions.os,
    deviceType: sessions.deviceType,
    ipAddress: sessions.ipAddress,
    location: sessions.location,
    lastActive: sessions.lastActive,
    createdAt: sessions.createdAt,
    revoked: sessions.revoked
  }).from(sessions).where(eq(sessions.userUid, userUid)).orderBy(desc(sessions.lastActive));
}
async function revokeSession(sessionUid, userUid) {
  const result = await db.update(sessions).set({ revoked: true }).where(and(
    eq(sessions.sessionUid, sessionUid),
    eq(sessions.userUid, userUid),
    eq(sessions.revoked, false)
  )).returning();
  return result.length > 0;
}
async function revokeAllOtherSessions(currentSessionUid, userUid) {
  await db.update(sessions).set({ revoked: true }).where(and(
    eq(sessions.userUid, userUid),
    eq(sessions.revoked, false)
  ));
  await db.update(sessions).set({ revoked: false }).where(eq(sessions.sessionUid, currentSessionUid));
  const allSessions = await db.select({ revoked: sessions.revoked }).from(sessions).where(eq(sessions.userUid, userUid));
  return allSessions.filter((s) => s.revoked === true).length;
}
async function cleanupOldSessions() {
  await db.delete(sessions).where(eq(sessions.revoked, true));
}
var init_sessions = __esm({
  "src/db/sessions.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// src/middleware/jwtAuth.ts
var authenticateToken, requireAuth;
var init_jwtAuth = __esm({
  "src/middleware/jwtAuth.ts"() {
    "use strict";
    init_auth();
    init_sessions();
    authenticateToken = async (req, res, next) => {
      if (req.user?.uid) return next();
      let token = "";
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split("Bearer ")[1];
      } else if (req.query && typeof req.query.token === "string") {
        const requestPath = req.path || "";
        if (/^\/(api\/download|uploads)\//.test(requestPath)) {
          token = req.query.token;
        }
      }
      if (!token) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
      }
      try {
        const decoded = verifyJwt(token);
        req.user = { uid: decoded.uid, email: decoded.email, sessionUid: decoded.sessionUid };
        if (decoded.sessionUid) {
          const active = await isSessionActive(decoded.sessionUid);
          if (!active) {
            return res.status(401).json({ error: "Unauthorized: Session revoked" });
          }
          touchSession(decoded.sessionUid).catch(() => {
          });
        }
        next();
      } catch (error) {
        console.error("Error verifying JWT token:", error);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
    };
    requireAuth = async (req, res, next) => {
      if (req.user?.uid) return next();
      authenticateToken(req, res, next);
    };
  }
});

// server/services/logger.ts
import pino from "pino";
import { AsyncLocalStorage } from "async_hooks";
function ctx(req) {
  const store = asyncLocalStorage.getStore() || {};
  const extra = {};
  if (req?.requestId) extra.requestId = req.requestId;
  if (req?.user?.uid) extra.userId = req.user.uid;
  return logger.child(extra);
}
var asyncLocalStorage, isDev, logger, logger_default;
var init_logger = __esm({
  "server/services/logger.ts"() {
    "use strict";
    asyncLocalStorage = new AsyncLocalStorage();
    isDev = process.env.NODE_ENV !== "production";
    logger = pino({
      level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
      // В dev — человекочитаемый формат с цветами
      ...isDev ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname"
          }
        }
      } : {},
      base: { service: "qwcrool-server" },
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err
      }
    });
    logger_default = logger;
  }
});

// server/config.ts
import dotenv2 from "dotenv";
import path2 from "path";
function getMaxSizeForMime(mimeType) {
  const category = mimeType.split("/")[0];
  return FILE_SIZE_LIMITS[category] || DEFAULT_MAX_SIZE;
}
function validateMagicBytes(mimeType, header) {
  if (header.length < 4) return false;
  const sig = MAGIC_SIGNATURES.find((s) => s.mime === mimeType);
  if (!sig) return true;
  return sig.match(header);
}
var JWT_SECRET, JWT_REFRESH_SECRET, SESSION_SECRET, CSRF_SECRET, MEDIA_SECRET, PORT, ALLOWED_ORIGINS, UPLOADS_DIR, QR_TOKEN_TTL, MEDIA_SIGNED_URL_TTL, FILE_SIZE_LIMITS, DEFAULT_MAX_SIZE, ALLOWED_MIMETYPES, MAGIC_SIGNATURES;
var init_config = __esm({
  "server/config.ts"() {
    "use strict";
    init_logger();
    dotenv2.config({ path: path2.resolve(".env") });
    JWT_SECRET = process.env.JWT_SECRET;
    JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    SESSION_SECRET = process.env.SESSION_SECRET;
    CSRF_SECRET = process.env.CSRF_SECRET;
    MEDIA_SECRET = process.env.MEDIA_SECRET || CSRF_SECRET;
    if (!JWT_SECRET || !JWT_REFRESH_SECRET || !SESSION_SECRET || !CSRF_SECRET) {
      logger_default.error("[FATAL] One or more required secrets are not set in environment variables");
      if (!JWT_SECRET) logger_default.error("  - JWT_SECRET is missing");
      if (!JWT_REFRESH_SECRET) logger_default.error("  - JWT_REFRESH_SECRET is missing");
      if (!SESSION_SECRET) logger_default.error("  - SESSION_SECRET is missing");
      if (!CSRF_SECRET) logger_default.error("  - CSRF_SECRET is missing");
      logger_default.error(`[FATAL] Generate secrets with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`);
      process.exit(1);
    }
    PORT = Number(process.env.PORT) || 3e3;
    ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
    UPLOADS_DIR = path2.join(process.cwd(), "uploads");
    QR_TOKEN_TTL = 6e4;
    MEDIA_SIGNED_URL_TTL = 60 * 60 * 1e3;
    FILE_SIZE_LIMITS = {
      image: 10 * 1024 * 1024,
      // 10 MB
      video: 100 * 1024 * 1024,
      // 100 MB
      audio: 20 * 1024 * 1024
      // 20 MB
    };
    DEFAULT_MAX_SIZE = 50 * 1024 * 1024;
    ALLOWED_MIMETYPES = /* @__PURE__ */ new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/webm",
      "audio/ogg",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/flac",
      "audio/aac",
      "audio/m4a",
      "audio/x-m4a",
      "application/pdf"
    ]);
    MAGIC_SIGNATURES = [
      { mime: "image/jpeg", match: (b) => b[0] === 255 && b[1] === 216 && b[2] === 255 },
      { mime: "image/png", match: (b) => b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71 },
      { mime: "image/gif", match: (b) => b[0] === 71 && b[1] === 73 && b[2] === 70 && (b[3] === 55 || b[3] === 57) },
      { mime: "image/webp", match: (b) => b.length >= 12 && b[0] === 82 && b[1] === 73 && b[2] === 70 && b[3] === 70 && b[8] === 87 && b[9] === 69 && b[10] === 66 && b[11] === 80 },
      { mime: "video/mp4", match: (b) => b.length >= 8 && b[4] === 102 && b[5] === 116 && b[6] === 121 && b[7] === 112 },
      { mime: "video/webm", match: (b) => b[0] === 26 && b[1] === 69 && b[2] === 223 && b[3] === 163 },
      { mime: "audio/webm", match: (b) => b[0] === 26 && b[1] === 69 && b[2] === 223 && b[3] === 163 },
      { mime: "audio/ogg", match: (b) => b[0] === 79 && b[1] === 103 && b[2] === 103 && b[3] === 83 },
      { mime: "audio/mpeg", match: (b) => b[0] === 73 && b[1] === 68 && b[2] === 51 || b[0] === 255 && (b[1] & 224) === 224 },
      { mime: "audio/mp3", match: (b) => b[0] === 73 && b[1] === 68 && b[2] === 51 || b[0] === 255 && (b[1] & 224) === 224 },
      { mime: "audio/wav", match: (b) => b.length >= 12 && b[0] === 82 && b[1] === 73 && b[2] === 70 && b[3] === 70 && b[8] === 87 && b[9] === 65 && b[10] === 86 && b[11] === 69 },
      { mime: "audio/x-wav", match: (b) => b.length >= 12 && b[0] === 82 && b[1] === 73 && b[2] === 70 && b[3] === 70 && b[8] === 87 && b[9] === 65 && b[10] === 86 && b[11] === 69 },
      { mime: "audio/flac", match: (b) => b[0] === 102 && b[1] === 76 && b[2] === 97 && b[3] === 67 },
      { mime: "audio/aac", match: (b) => b[0] === 255 && (b[1] & 240) === 240 },
      { mime: "audio/m4a", match: (b) => b.length >= 8 && b[4] === 102 && b[5] === 116 && b[6] === 121 && b[7] === 112 },
      { mime: "audio/x-m4a", match: (b) => b.length >= 8 && b[4] === 102 && b[5] === 116 && b[6] === 121 && b[7] === 112 },
      { mime: "application/pdf", match: (b) => b[0] === 37 && b[1] === 80 && b[2] === 68 && b[3] === 70 }
    ];
  }
});

// src/db/auth.ts
var auth_exports = {};
__export(auth_exports, {
  createUserWithPassword: () => createUserWithPassword,
  getUserByEmail: () => getUserByEmail,
  getUserByUid: () => getUserByUid,
  getUserByUsername: () => getUserByUsername,
  verifyUserPassword: () => verifyUserPassword
});
import bcrypt from "bcryptjs";
import { eq as eq2 } from "drizzle-orm";
async function getUserByEmail(email) {
  const result = await db.select().from(users).where(eq2(users.email, email)).limit(1);
  return result[0] || null;
}
async function getUserByUsername(username) {
  const result = await db.select().from(users).where(eq2(users.username, username)).limit(1);
  return result[0] || null;
}
async function getUserByUid(uid) {
  const result = await db.select().from(users).where(eq2(users.uid, uid)).limit(1);
  if (!result[0]) return null;
  const { passwordHash, ...user } = result[0];
  return user;
}
async function createUserWithPassword(data) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const idCandidate = Math.floor(Math.random() * 2147483647);
  const inserted = await db.insert(users).values({
    id: idCandidate,
    uid: data.uid,
    email: data.email,
    username: data.username || null,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    status: data.status || "online",
    lastSeen: /* @__PURE__ */ new Date(),
    passwordHash
  }).returning();
  const { passwordHash: _, ...user } = inserted[0];
  return user;
}
async function verifyUserPassword(email, password) {
  const result = await db.select().from(users).where(eq2(users.email, email)).limit(1);
  const row2 = result[0];
  if (!row2 || !row2.passwordHash) return null;
  const isValid = await bcrypt.compare(password, row2.passwordHash);
  if (!isValid) return null;
  const { passwordHash, ...user } = row2;
  return user;
}
var init_auth2 = __esm({
  "src/db/auth.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/services/crypto.ts
var crypto_exports = {};
__export(crypto_exports, {
  generateCsrfToken: () => generateCsrfToken,
  getContentHash: () => getContentHash,
  signCsrfToken: () => signCsrfToken,
  signMediaUrl: () => signMediaUrl,
  verifyMediaSignature: () => verifyMediaSignature
});
import { createHmac, createHash, randomBytes, timingSafeEqual } from "crypto";
function signMediaUrl(filename) {
  const exp = Date.now() + 60 * 60 * 1e3;
  const sig = createHmac("sha256", MEDIA_SECRET).update(`${filename}:${exp}`).digest("hex");
  return { sig, exp };
}
function verifyMediaSignature(filename, sig, exp) {
  if (Date.now() > exp) return false;
  const expected = createHmac("sha256", MEDIA_SECRET).update(`${filename}:${exp}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
function generateCsrfToken() {
  return randomBytes(32).toString("hex");
}
function signCsrfToken(token) {
  return createHmac("sha256", CSRF_SECRET).update(token).digest("hex");
}
var getContentHash;
var init_crypto = __esm({
  "server/services/crypto.ts"() {
    "use strict";
    init_config();
    getContentHash = (buffer) => {
      return createHash("sha256").update(buffer).digest("hex");
    };
  }
});

// server/middleware/csrf.ts
var csrf_exports = {};
__export(csrf_exports, {
  doubleCsrfProtection: () => doubleCsrfProtection,
  setCsrfCookie: () => setCsrfCookie
});
function setCsrfCookie(res) {
  const token = generateCsrfToken();
  const signed = signCsrfToken(token);
  res.cookie("csrf-token", `${token}.${signed}`, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return token;
}
function doubleCsrfProtection(req, res, next) {
  const headerToken = req.headers["x-csrf-token"];
  const cookieRaw = req.cookies?.["csrf-token"];
  if (!headerToken || !cookieRaw) {
    logger.error("[CSRF] Missing token \u2014 header:", !!headerToken, "cookie:", !!cookieRaw);
    return res.status(403).json({ error: "CSRF token missing" });
  }
  const dotIdx = cookieRaw.lastIndexOf(".");
  if (dotIdx === -1) {
    logger.error("[CSRF] Invalid cookie format");
    return res.status(403).json({ error: "CSRF token invalid format" });
  }
  const cookieToken = cookieRaw.substring(0, dotIdx);
  const cookieSigned = cookieRaw.substring(dotIdx + 1);
  const expectedSigned = signCsrfToken(cookieToken);
  if (cookieSigned !== expectedSigned) {
    logger.error("[CSRF] Cookie signature mismatch");
    return res.status(403).json({ error: "CSRF token signature invalid" });
  }
  if (headerToken !== cookieToken) {
    logger.error("[CSRF] Header token does not match cookie token");
    return res.status(403).json({ error: "CSRF token mismatch" });
  }
  next();
}
var init_csrf = __esm({
  "server/middleware/csrf.ts"() {
    "use strict";
    init_crypto();
    init_logger();
  }
});

// src/lib/starterStickers.ts
var starterStickers_exports = {};
__export(starterStickers_exports, {
  CAT_STICKERS: () => CAT_STICKERS,
  STARTER_PACK: () => STARTER_PACK
});
var CAT_EMOJIS, CAT_STICKERS, STARTER_PACK;
var init_starterStickers = __esm({
  "src/lib/starterStickers.ts"() {
    "use strict";
    CAT_EMOJIS = [
      "\u{1F44B}",
      "\u{1F64C}",
      "\u2764\uFE0F",
      "\u{1F609}",
      "\u{1F496}",
      "\u{1F62D}",
      "\u{1F62E}",
      "\u{1F621}",
      "\u{1F622}",
      "\u{1F970}",
      "\u{1F926}\u200D\u2642\uFE0F",
      "\u{1F914}",
      "\u{1F634}",
      "\u{1F60E}",
      "\u{1F97A}",
      "\u{1F389}",
      "\u{1F633}",
      "\u{1F60D}",
      "\u{1F604}",
      "\u{1F632}",
      "\u{1F44C}",
      "\u274C",
      "\u270C\uFE0F",
      "\u{1F92D}",
      "\u{1F606}",
      "\u{1F4BB}",
      "\u{1F648}",
      "\u2615",
      "\u{1F6A9}",
      "\u{1F431}"
    ];
    CAT_STICKERS = Array.from({ length: 30 }, (_, i) => {
      const num = String(i + 1).padStart(2, "0");
      return {
        id: i + 1,
        packId: 1,
        imageUrl: `/stickers/starter/sticker_${num}.webp`,
        emoji: CAT_EMOJIS[i] || "\u{1F431}",
        width: 512,
        height: 512
      };
    });
    STARTER_PACK = {
      id: 1,
      name: "black_cat_starters",
      title: "Black Cat Stickers \u{1F431}",
      isDefault: "true",
      thumbnail: "/stickers/starter/sticker_01.webp",
      stickers: CAT_STICKERS
    };
  }
});

// src/db/helpers.ts
var helpers_exports = {};
__export(helpers_exports, {
  addSticker: () => addSticker,
  createChat: () => createChat,
  createComment: () => createComment,
  createMessage: () => createMessage,
  createStickerPack: () => createStickerPack,
  deleteChatCompletely: () => deleteChatCompletely,
  deleteMessage: () => deleteMessage,
  deleteUserCompletely: () => deleteUserCompletely,
  editMessage: () => editMessage,
  getChat: () => getChat,
  getChatByUsername: () => getChatByUsername,
  getChatsForUser: () => getChatsForUser,
  getChatsListForUser: () => getChatsListForUser,
  getCommentsForMessage: () => getCommentsForMessage,
  getMediaForChat: () => getMediaForChat,
  getMessagesCount: () => getMessagesCount,
  getMessagesForChat: () => getMessagesForChat,
  getStickerPacks: () => getStickerPacks,
  getStickersByPack: () => getStickersByPack,
  getUser: () => getUser,
  getUsers: () => getUsers,
  isChatUsernameTaken: () => isChatUsernameTaken,
  logAdminAction: () => logAdminAction,
  searchMessages: () => searchMessages,
  syncUser: () => syncUser,
  toggleMessageReaction: () => toggleMessageReaction,
  updateChat: () => updateChat
});
import { eq as eq3, or, sql, and as and2, ilike, inArray, desc as desc2 } from "drizzle-orm";
async function syncUser(uid, data) {
  try {
    const existing = await db.select().from(users).where(eq3(users.uid, uid)).limit(1);
    const updatePayload = {
      email: data.email,
      lastSeen: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (data.displayName !== void 0) updatePayload.displayName = data.displayName;
    if (data.photoURL !== void 0) updatePayload.photoURL = data.photoURL;
    if (data.status !== void 0) updatePayload.status = data.status;
    if (data.bio !== void 0) updatePayload.bio = data.bio;
    if (data.username !== void 0) updatePayload.username = data.username;
    if (data.phoneNumber !== void 0) updatePayload.phoneNumber = data.phoneNumber;
    let userData;
    if (existing.length > 0) {
      const result = await db.update(users).set(updatePayload).where(eq3(users.uid, uid)).returning();
      userData = result[0];
    } else {
      const result = await db.insert(users).values({
        uid,
        email: data.email,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        status: data.status || "online",
        bio: data.bio || null,
        username: data.username || null,
        phoneNumber: data.phoneNumber || null
      }).returning();
      userData = result[0];
    }
    const { passwordHash, ...safeUser } = userData;
    return safeUser;
  } catch (error) {
    console.error("Error in syncUser:", error);
    throw new Error("Failed to sync user in database", { cause: error });
  }
}
async function getUsers() {
  try {
    const allUsers = await db.select().from(users);
    return allUsers.map((user) => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw new Error("Failed to fetch users", { cause: error });
  }
}
async function getUser(uid) {
  try {
    const result = await db.select().from(users).where(eq3(users.uid, uid)).limit(1);
    if (!result[0]) return null;
    const { passwordHash, ...safeUser } = result[0];
    return safeUser;
  } catch (error) {
    console.error("Error in getUser:", error);
    throw new Error("Failed to fetch user", { cause: error });
  }
}
async function getChat(chatId) {
  try {
    let result;
    if (typeof chatId === "string") {
      result = await db.select().from(chats).where(eq3(chats.chatUid, chatId)).limit(1);
      if (!result[0]) {
        const numericId = parseInt(chatId);
        if (!isNaN(numericId)) {
          result = await db.select().from(chats).where(eq3(chats.id, numericId)).limit(1);
        }
      }
    } else {
      result = await db.select().from(chats).where(eq3(chats.id, chatId)).limit(1);
    }
    return result[0] || null;
  } catch (error) {
    console.error("Error in getChat:", error);
    throw new Error("Failed to fetch chat", { cause: error });
  }
}
async function getChatsListForUser(uid, all = false) {
  try {
    const allChats = await db.select({
      id: chats.id,
      chatUid: chats.chatUid,
      name: chats.name,
      type: chats.type,
      avatar: chats.avatar,
      updatedAt: chats.updatedAt
    }).from(chats);
    return allChats;
  } catch (error) {
    console.error("Error in getChatsListForUser:", error);
    throw new Error("Failed to fetch chats list", { cause: error });
  }
}
async function getChatsForUser(uid, all = false) {
  try {
    const allChats = await db.select().from(chats);
    const filteredChats = allChats.filter((chat) => {
      if (chat.chatUid === "global_chat") return true;
      const pts = chat.participants || [];
      const mbs = chat.members || [];
      const isMember = pts.includes(uid) || mbs.includes(uid);
      if (all) {
        if (chat.type === "channel" || chat.type === "group") {
          return isMember || !!chat.username;
        }
        return isMember;
      } else {
        return isMember;
      }
    });
    return filteredChats.map((chat) => ({
      ...chat,
      id: chat.chatUid || String(chat.id),
      // фронтенд ожидает id как строку, fallback на numeric
      idNumeric: chat.id
      // сохраняем numeric ID на всякий случай
    }));
  } catch (error) {
    console.error("Error in getChatsForUser:", error);
    throw new Error("Failed to fetch chats", { cause: error });
  }
}
async function createChat(chatData) {
  try {
    const existing = await db.select().from(chats).where(eq3(chats.chatUid, chatData.chatUid)).limit(1);
    if (existing.length > 0) {
      console.log(`Chat ${chatData.chatUid} already exists, returning existing chat`);
      return existing[0];
    }
    const rawMembers = chatData.members || [];
    const rawParticipants = chatData.participants || chatData.members || [];
    const uniqueMembers = Array.from(new Set(rawMembers));
    const uniqueParticipants = Array.from(new Set(rawParticipants));
    let admins = chatData.admins || [];
    const idCandidate = Math.floor(Math.random() * 2147483647);
    const result = await db.insert(chats).values({
      id: idCandidate,
      chatUid: chatData.chatUid,
      type: chatData.type,
      name: chatData.name || null,
      description: chatData.description || null,
      avatar: chatData.avatar || null,
      creatorId: chatData.creatorId || null,
      members: uniqueMembers,
      participants: uniqueParticipants,
      linkedChatId: chatData.linkedChatId || null,
      mutedBy: chatData.mutedBy || [],
      typing: chatData.typing || {},
      bannedUsers: chatData.bannedUsers || [],
      admins,
      pinnedMessageUid: chatData.pinnedMessageUid || null,
      lastMessage: chatData.lastMessage || null,
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Error in createChat:", error);
    throw new Error("Failed to create chat", { cause: error });
  }
}
async function updateChat(chatId, updateData) {
  try {
    console.log(`[updateChat] chatId: ${chatId}, type: ${typeof chatId}`);
    const payload = {};
    if (updateData.name !== void 0) payload.name = updateData.name;
    if (updateData.description !== void 0) payload.description = updateData.description;
    if (updateData.avatar !== void 0) payload.avatar = updateData.avatar;
    if (updateData.members !== void 0) {
      const uniqueM = Array.from(new Set(updateData.members));
      payload.members = uniqueM;
      payload.participants = uniqueM;
    }
    if (updateData.participants !== void 0) {
      const uniqueP = Array.from(new Set(updateData.participants));
      payload.participants = uniqueP;
      payload.members = uniqueP;
    }
    if (updateData.mutedBy !== void 0) payload.mutedBy = updateData.mutedBy;
    if (updateData.typing !== void 0) payload.typing = updateData.typing;
    if (updateData.bannedUsers !== void 0) payload.bannedUsers = updateData.bannedUsers;
    if (updateData.admins !== void 0) payload.admins = updateData.admins;
    if (updateData.lastMessage !== void 0) payload.lastMessage = updateData.lastMessage;
    if (updateData.pinnedMessageUid !== void 0) payload.pinnedMessageUid = updateData.pinnedMessageUid;
    if (updateData.username !== void 0) payload.username = updateData.username;
    if (updateData.linkedChatId !== void 0) payload.linkedChatId = updateData.linkedChatId ? Number(updateData.linkedChatId) : null;
    if (updateData.slowMode !== void 0) payload.slowMode = updateData.slowMode;
    if (updateData.adminPerms !== void 0) payload.adminPerms = updateData.adminPerms;
    payload.updatedAt = /* @__PURE__ */ new Date();
    let result;
    if (typeof chatId === "string") {
      console.log(`[updateChat] Trying chatUid first: ${chatId}`);
      result = await db.update(chats).set(payload).where(eq3(chats.chatUid, chatId)).returning();
      if (result[0]) {
        return await getChat(chatId);
      }
    }
    const numericId = typeof chatId === "number" ? chatId : parseInt(String(chatId));
    if (!isNaN(numericId)) {
      console.log(`[updateChat] Trying numeric id: ${numericId}`);
      result = await db.update(chats).set(payload).where(eq3(chats.id, numericId)).returning();
      if (result[0]) {
        return result[0];
      }
    }
    return null;
  } catch (error) {
    console.error("Error in updateChat:", error);
    throw new Error("Failed to update chat", { cause: error });
  }
}
function escapeLikePattern(value) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
async function getChatByUsername(username) {
  try {
    const result = await db.select().from(chats).where(eq3(chats.username, username)).limit(1);
    if (!result[0]) return null;
    return { ...result[0], id: result[0].chatUid || String(result[0].id), idNumeric: result[0].id };
  } catch (error) {
    console.error("Error in getChatByUsername:", error);
    throw new Error("Failed to fetch chat by username", { cause: error });
  }
}
async function isChatUsernameTaken(username, excludeChatId) {
  try {
    const conditions = [eq3(chats.username, username)];
    if (excludeChatId) {
      const { not, eq: eqFn } = await import("drizzle-orm");
      const result2 = await db.select({ id: chats.id }).from(chats).where(
        eqFn(chats.username, username)
      ).limit(5);
      return result2.some((r) => r.id !== excludeChatId);
    }
    const result = await db.select({ id: chats.id }).from(chats).where(
      eq3(chats.username, username)
    ).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error("Error in isChatUsernameTaken:", error);
    return false;
  }
}
async function logAdminAction(data) {
  try {
    const { adminLogs: adminLogs2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.insert(adminLogs2).values({
      chatId: data.chatId || null,
      actorUid: data.actorUid,
      action: data.action,
      targetUid: data.targetUid || null,
      details: data.details || null
    });
  } catch (error) {
    console.error("Error in logAdminAction:", error);
  }
}
async function getMessagesForChat(chatId, limit = 50, offset = 0) {
  try {
    let chatNumericId;
    if (typeof chatId === "string") {
      let chatResult = await db.select({ id: chats.id }).from(chats).where(eq3(chats.chatUid, chatId)).limit(1);
      if (!chatResult[0]) {
        const numericId = parseInt(chatId);
        if (!isNaN(numericId)) {
          chatResult = await db.select({ id: chats.id }).from(chats).where(eq3(chats.id, numericId)).limit(1);
        }
      }
      if (!chatResult[0]) {
        return [];
      }
      chatNumericId = chatResult[0].id;
    } else {
      chatNumericId = chatId;
    }
    const msgs = await db.select({
      id: messages.msgUid,
      // возвращаем msgUid как id для фронтенда
      msgUid: messages.msgUid,
      idNumeric: messages.id,
      // добавляем numeric ID для reports
      chatId: messages.chatId,
      senderId: users.uid,
      // возвращаем UID пользователя вместо numeric ID
      senderNumericId: messages.senderId,
      // на всякий случай
      senderName: messages.senderName,
      senderAvatar: messages.senderAvatar,
      text: messages.text,
      fileUrl: messages.fileUrl,
      fileName: messages.fileName,
      fileType: messages.fileType,
      type: messages.type,
      duration: messages.duration,
      replyTo: messages.replyTo,
      timestamp: messages.createdAt,
      // фронтенд ожидает timestamp
      createdAt: messages.createdAt,
      reactions: messages.reactions,
      editedAt: messages.editedAt
    }).from(messages).leftJoin(users, eq3(messages.senderId, users.id)).where(eq3(messages.chatId, chatNumericId)).orderBy(messages.createdAt).limit(limit).offset(offset);
    const msgNumericIds = msgs.map((m) => m.idNumeric).filter(Boolean);
    const commentCountsMap = /* @__PURE__ */ new Map();
    if (msgNumericIds.length > 0) {
      try {
        const { inArray: inArray3, sql: drizzleSql } = await import("drizzle-orm");
        const cResult = await db.select({
          messageId: comments.messageId,
          count: drizzleSql`count(*)::int`
        }).from(comments).where(inArray3(comments.messageId, msgNumericIds)).groupBy(comments.messageId);
        for (const row2 of cResult) {
          commentCountsMap.set(row2.messageId, Number(row2.count) || 0);
        }
      } catch (cErr) {
      }
    }
    return msgs.map((m) => ({
      ...m,
      senderId: m.type === "channel_post" ? `channel_${m.chatId}` : m.senderId,
      isChannelPost: m.type === "channel_post",
      commentCount: commentCountsMap.get(m.idNumeric) || 0
    }));
  } catch (error) {
    console.error("Error in getMessagesForChat:", error);
    throw new Error("Failed to fetch messages", { cause: error });
  }
}
async function getMessagesCount(chatId) {
  try {
    let chatNumericId;
    if (typeof chatId === "string") {
      const chatResult = await db.select({ id: chats.id }).from(chats).where(eq3(chats.chatUid, chatId)).limit(1);
      if (!chatResult[0]) return 0;
      chatNumericId = chatResult[0].id;
    } else {
      chatNumericId = chatId;
    }
    const result = await db.select({ count: sql`count(*)` }).from(messages).where(eq3(messages.chatId, chatNumericId));
    return result[0]?.count || 0;
  } catch (error) {
    console.error("Error in getMessagesCount:", error);
    return 0;
  }
}
async function createMessage(msg) {
  try {
    let chatNumericId;
    if (typeof msg.chatId === "string") {
      let chatResult = await db.select({ id: chats.id }).from(chats).where(eq3(chats.chatUid, msg.chatId)).limit(1);
      if (!chatResult[0]) {
        const maybeNumeric = parseInt(msg.chatId);
        if (!isNaN(maybeNumeric)) {
          chatResult = await db.select({ id: chats.id }).from(chats).where(eq3(chats.id, maybeNumeric)).limit(1);
        }
      }
      if (!chatResult[0]) {
        let chatType = "private";
        let participants = [];
        if (msg.chatId === "global_chat") {
          chatType = "public";
        } else if (msg.chatId.startsWith("private_")) {
          const parts = msg.chatId.split("_");
          participants = parts.slice(1);
        } else {
          participants = [msg.senderId.toString()];
        }
        const chatIdCandidate = Math.floor(Math.random() * 2147483647);
        const newChat = await db.insert(chats).values({
          id: chatIdCandidate,
          chatUid: msg.chatId,
          type: chatType,
          name: msg.chatId === "global_chat" ? "\u041E\u0431\u0449\u0438\u0439 \u0427\u0430\u0442" : null,
          participants,
          members: participants,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        chatNumericId = newChat[0].id;
      } else {
        chatNumericId = chatResult[0].id;
      }
    } else {
      chatNumericId = msg.chatId;
    }
    const messageNumericId = Math.floor(Math.random() * 2147483647);
    const result = await db.insert(messages).values({
      id: messageNumericId,
      msgUid: msg.msgUid,
      chatId: chatNumericId,
      senderId: msg.senderId,
      senderName: msg.senderName || null,
      senderAvatar: msg.senderAvatar || null,
      text: msg.text || null,
      fileUrl: msg.fileUrl || null,
      fileName: msg.fileName || null,
      fileType: msg.fileType || null,
      type: msg.type || "text",
      duration: msg.duration || null,
      replyTo: msg.replyTo || null
    }).returning();
    const messageSnapshot = result[0];
    await db.update(chats).set({
      lastMessage: {
        text: messageSnapshot.text || (messageSnapshot.type === "voice" ? "\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435" : "\u0412\u043B\u043E\u0436\u0435\u043D\u0438\u0435"),
        senderId: messageSnapshot.senderId,
        senderName: messageSnapshot.senderName,
        timestamp: messageSnapshot.createdAt ? messageSnapshot.createdAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      },
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(chats.id, chatNumericId));
    return messageSnapshot;
  } catch (error) {
    console.error("Error in createMessage:", error);
    throw new Error("Failed to create message", { cause: error });
  }
}
async function deleteMessage(msgId) {
  try {
    if (typeof msgId === "string") {
      return await db.delete(messages).where(eq3(messages.msgUid, msgId)).returning();
    } else {
      return await db.delete(messages).where(eq3(messages.id, msgId)).returning();
    }
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    throw new Error("Failed to delete message", { cause: error });
  }
}
async function editMessage(msgUid, senderUid, newText) {
  try {
    const existing = await db.select({
      id: messages.id,
      msgUid: messages.msgUid,
      senderId: messages.senderId
    }).from(messages).where(eq3(messages.msgUid, msgUid)).limit(1);
    if (!existing[0]) {
      throw new Error("Message not found");
    }
    const sender = await db.select({ id: users.id, role: users.role }).from(users).where(eq3(users.uid, senderUid)).limit(1);
    if (!sender[0]) {
      throw new Error("User not found");
    }
    const isAdmin2 = sender[0].role === "admin";
    const isOwner = existing[0].senderId === sender[0].id;
    if (!isOwner && !isAdmin2) {
      throw new Error("You can only edit your own messages");
    }
    const result = await db.update(messages).set({
      text: newText,
      editedAt: /* @__PURE__ */ new Date()
    }).where(eq3(messages.msgUid, msgUid)).returning();
    return result[0];
  } catch (error) {
    console.error("Error in editMessage:", error);
    throw new Error("Failed to edit message", { cause: error });
  }
}
async function getCommentsForMessage(msgId) {
  try {
    let numericId;
    if (typeof msgId === "string") {
      const parsed = parseInt(msgId);
      if (!isNaN(parsed) && String(parsed) === msgId) {
        numericId = parsed;
      } else {
        const found = await db.select({ id: messages.id }).from(messages).where(eq3(messages.msgUid, msgId)).limit(1);
        if (!found[0]) return [];
        numericId = found[0].id;
      }
    } else {
      numericId = msgId;
    }
    const cmts = await db.select({
      id: comments.commentUid,
      commentUid: comments.commentUid,
      idNumeric: comments.id,
      messageId: comments.messageId,
      chatId: comments.chatId,
      userId: users.uid,
      userNumericId: comments.userId,
      userName: users.displayName,
      username: users.username,
      userAvatar: users.photoURL,
      senderName: users.displayName,
      senderAvatar: users.photoURL,
      text: comments.text,
      createdAt: comments.createdAt,
      timestamp: comments.createdAt
    }).from(comments).leftJoin(users, eq3(comments.userId, users.id)).where(eq3(comments.messageId, numericId)).orderBy(comments.createdAt);
    return cmts.map((c) => ({
      ...c,
      id: c.commentUid || String(c.idNumeric),
      userId: c.userId || String(c.userNumericId),
      userName: c.userName || c.username || "user",
      senderName: c.senderName || c.username || "user",
      username: c.username || "",
      userAvatar: c.userAvatar || c.senderAvatar || "",
      senderAvatar: c.senderAvatar || c.userAvatar || ""
    }));
  } catch (error) {
    console.error("Error in getCommentsForMessage:", error);
    throw new Error("Failed to fetch comments", { cause: error });
  }
}
async function createComment(cmt) {
  try {
    const result = await db.insert(comments).values({
      commentUid: cmt.commentUid,
      messageId: cmt.messageId,
      chatId: cmt.chatId,
      userId: cmt.userId,
      userName: cmt.userName || null,
      userAvatar: cmt.userAvatar || null,
      text: cmt.text
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Error in createComment:", error);
    throw new Error("Failed to create comment", { cause: error });
  }
}
async function getStickerPacks() {
  try {
    const { stickerPacks: stickerPacks2, stickers: stickers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { eq: eq11 } = await import("drizzle-orm");
    const { STARTER_PACK: STARTER_PACK2 } = await Promise.resolve().then(() => (init_starterStickers(), starterStickers_exports));
    let packs = await db2.select().from(stickerPacks2).orderBy(stickerPacks2.createdAt);
    let starterInDb = packs.find((p) => p.name === STARTER_PACK2.name);
    if (!starterInDb) {
      try {
        const [insertedPack] = await db2.insert(stickerPacks2).values({
          name: STARTER_PACK2.name,
          title: STARTER_PACK2.title,
          isDefault: "true",
          thumbnail: STARTER_PACK2.thumbnail
        }).returning();
        if (insertedPack) {
          starterInDb = insertedPack;
          const stickerRows = STARTER_PACK2.stickers.map((s) => ({
            packId: insertedPack.id,
            imageUrl: s.imageUrl,
            emoji: s.emoji,
            width: s.width,
            height: s.height
          }));
          await db2.insert(stickers2).values(stickerRows);
          packs = [insertedPack, ...packs];
        }
      } catch (seedErr) {
        console.warn("Failed to seed starter sticker pack into DB:", seedErr);
      }
    } else {
      const existingStickers = await db2.select().from(stickers2).where(eq11(stickers2.packId, starterInDb.id));
      if (existingStickers.length < STARTER_PACK2.stickers.length) {
        try {
          await db2.delete(stickers2).where(eq11(stickers2.packId, starterInDb.id));
          const stickerRows = STARTER_PACK2.stickers.map((s) => ({
            packId: starterInDb.id,
            imageUrl: s.imageUrl,
            emoji: s.emoji,
            width: s.width,
            height: s.height
          }));
          await db2.insert(stickers2).values(stickerRows);
        } catch (reseedErr) {
          console.warn("Failed to re-seed stickers into DB:", reseedErr);
        }
      }
    }
    return packs;
  } catch (error) {
    console.error("Error in getStickerPacks:", error);
    throw new Error("Failed to fetch sticker packs", { cause: error });
  }
}
async function createStickerPack(data) {
  try {
    const { stickerPacks: stickerPacks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const result = await db2.insert(stickerPacks2).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Error in createStickerPack:", error);
    throw new Error("Failed to create sticker pack", { cause: error });
  }
}
async function getStickersByPack(packId) {
  try {
    const { stickers: stickers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    return await db2.select().from(stickers2).where(eq3(stickers2.packId, packId)).orderBy(stickers2.createdAt);
  } catch (error) {
    console.error("Error in getStickersByPack:", error);
    throw new Error("Failed to fetch stickers", { cause: error });
  }
}
async function addSticker(data) {
  try {
    const { stickers: stickers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const result = await db2.insert(stickers2).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Error in addSticker:", error);
    throw new Error("Failed to add sticker", { cause: error });
  }
}
async function searchMessages(uid, query) {
  try {
    if (!query || query.trim() === "") {
      return [];
    }
    const userChats = await getChatsForUser(uid, true);
    const chatIds = userChats.map((c) => c.idNumeric);
    if (chatIds.length === 0) {
      return [];
    }
    const results = await db.select().from(messages).where(
      and2(
        inArray(messages.chatId, chatIds),
        ilike(messages.text, `%${escapeLikePattern(query)}%`)
      )
    ).orderBy(desc2(messages.createdAt)).limit(50);
    return results;
  } catch (error) {
    console.error("Error in searchMessages:", error);
    throw new Error("Failed to search messages", { cause: error });
  }
}
async function deleteUserCompletely(uid) {
  try {
    const userResult = await db.select({ id: users.id }).from(users).where(eq3(users.uid, uid)).limit(1);
    if (!userResult[0]) {
      throw new Error("User not found");
    }
    const userNumericId = userResult[0].id;
    await db.delete(messages).where(eq3(messages.senderId, userNumericId));
    await db.delete(comments).where(eq3(comments.userId, userNumericId));
    const userChats = await db.select().from(chats).where(sql`${chats.participants}::jsonb @> ${JSON.stringify([uid])}::jsonb`);
    for (const chat of userChats) {
      const newParticipants = Array.isArray(chat.participants) ? chat.participants.filter((p) => p !== uid) : [];
      const newMembers = Array.isArray(chat.members) ? chat.members.filter((m) => m !== uid) : [];
      const newAdmins = Array.isArray(chat.admins) ? chat.admins.filter((a) => a !== uid) : [];
      if (chat.type === "private" && newParticipants.length <= 1) {
        await db.delete(chats).where(eq3(chats.id, chat.id));
      } else {
        await db.update(chats).set({
          participants: newParticipants,
          members: newMembers,
          admins: newAdmins,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(chats.id, chat.id));
      }
    }
    await db.delete(users).where(eq3(users.uid, uid));
    return { success: true, message: "User and all their data deleted completely" };
  } catch (error) {
    console.error("Error in deleteUserCompletely:", error);
    throw new Error("Failed to delete user completely", { cause: error });
  }
}
async function deleteChatCompletely(chatId) {
  try {
    let chatNumericId;
    if (typeof chatId === "string") {
      const chatResult = await db.select({ id: chats.id }).from(chats).where(eq3(chats.chatUid, chatId)).limit(1);
      if (!chatResult[0]) {
        throw new Error("Chat not found");
      }
      chatNumericId = chatResult[0].id;
    } else {
      chatNumericId = chatId;
    }
    await db.delete(messages).where(eq3(messages.chatId, chatNumericId));
    await db.delete(comments).where(eq3(comments.chatId, chatNumericId));
    await db.delete(chats).where(eq3(chats.id, chatNumericId));
    return { success: true, message: "Chat and all its data deleted completely" };
  } catch (error) {
    console.error("Error in deleteChatCompletely:", error);
    throw new Error("Failed to delete chat completely", { cause: error });
  }
}
async function getMediaForChat(chatId, opts) {
  let chatNumericId;
  if (typeof chatId === "string") {
    const chatResult = await db.select({ id: chats.id }).from(chats).where(eq3(chats.chatUid, chatId)).limit(1);
    if (!chatResult[0]) return { items: [], total: 0 };
    chatNumericId = chatResult[0].id;
  } else {
    chatNumericId = chatId;
  }
  const conditions = [eq3(messages.chatId, chatNumericId)];
  if (opts.type === "image") {
    conditions.push(eq3(messages.type, "image"));
  } else if (opts.type === "video") {
    conditions.push(or(eq3(messages.type, "video"), eq3(messages.type, "video_note")));
  } else if (opts.type === "voice") {
    conditions.push(eq3(messages.type, "voice"));
  } else if (opts.type === "file") {
    conditions.push(eq3(messages.type, "file"));
  } else if (opts.type === "link") {
    conditions.push(eq3(messages.type, "text"));
    conditions.push(ilike(messages.text, "%http%"));
  }
  if (opts.search) {
    const searchPattern = `%${escapeLikePattern(opts.search)}%`;
    conditions.push(
      or(
        ilike(messages.fileName, searchPattern),
        ilike(messages.text, searchPattern),
        ilike(messages.fileType, searchPattern)
      )
    );
  }
  const whereClause = and2(...conditions);
  const countResult = await db.select({ count: sql`count(*)` }).from(messages).where(whereClause);
  const total = countResult[0]?.count || 0;
  let orderByClause;
  if (opts.sort === "oldest") {
    orderByClause = messages.createdAt;
  } else if (opts.sort === "name") {
    orderByClause = messages.fileName;
  } else {
    orderByClause = desc2(messages.createdAt);
  }
  const items = await db.select({
    id: messages.msgUid,
    idNumeric: messages.id,
    chatId: messages.chatId,
    senderId: users.uid,
    senderName: messages.senderName,
    senderAvatar: messages.senderAvatar,
    text: messages.text,
    fileUrl: messages.fileUrl,
    fileName: messages.fileName,
    fileType: messages.fileType,
    type: messages.type,
    duration: messages.duration,
    timestamp: messages.createdAt,
    createdAt: messages.createdAt
  }).from(messages).leftJoin(users, eq3(messages.senderId, users.id)).where(whereClause).orderBy(orderByClause).limit(opts.limit).offset(opts.offset);
  let resultItems = items;
  if (opts.sort === "size" && items.length > 0) {
    const fs6 = await import("fs");
    const path7 = await import("path");
    const UPLOADS_DIR2 = path7.join(process.cwd(), "uploads");
    resultItems = items.map((item) => {
      let size = 0;
      if (item.fileUrl) {
        const filename = item.fileUrl.replace("/api/download/", "").replace("/uploads/", "");
        const filePath = path7.join(UPLOADS_DIR2, filename);
        const resolvedPath = path7.resolve(filePath);
        if (!resolvedPath.startsWith(path7.resolve(UPLOADS_DIR2))) {
          size = 0;
        } else {
          try {
            if (fs6.existsSync(resolvedPath)) {
              size = fs6.statSync(resolvedPath).size;
            }
          } catch {
          }
        }
      }
      return { ...item, fileSize: size };
    }).sort((a, b) => b.fileSize - a.fileSize);
  }
  return { items: resultItems, total };
}
async function toggleMessageReaction(msgUid, userUid, emoji) {
  try {
    const messageResult = await db.select({ reactions: messages.reactions }).from(messages).where(eq3(messages.msgUid, msgUid)).limit(1);
    if (!messageResult[0]) {
      throw new Error("Message not found");
    }
    const currentReactions = messageResult[0].reactions || {};
    if (currentReactions[userUid] === emoji) {
      delete currentReactions[userUid];
    } else {
      currentReactions[userUid] = emoji;
    }
    const updated = await db.update(messages).set({ reactions: currentReactions }).where(eq3(messages.msgUid, msgUid)).returning();
    return updated[0]?.reactions || {};
  } catch (error) {
    console.error("Error in toggleMessageReaction:", error);
    throw new Error("Failed to toggle message reaction", { cause: error });
  }
}
var init_helpers = __esm({
  "src/db/helpers.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// src/db/admin.ts
var admin_exports = {};
__export(admin_exports, {
  blockUser: () => blockUser,
  broadcastMessage: () => broadcastMessage,
  createAuditLog: () => createAuditLog,
  createReport: () => createReport,
  createUserReport: () => createUserReport,
  deleteAllChatMessages: () => deleteAllChatMessages,
  deleteMessageAdmin: () => deleteMessageAdmin,
  deleteStickerPack: () => deleteStickerPack,
  dismissUserReport: () => dismissUserReport,
  findUserByUsernameOrUid: () => findUserByUsernameOrUid,
  flagMessage: () => flagMessage,
  getAllChats: () => getAllChats,
  getAllSessions: () => getAllSessions,
  getAllUsers: () => getAllUsers,
  getAuditLogs: () => getAuditLogs,
  getAuditLogsCount: () => getAuditLogsCount,
  getBlockDirection: () => getBlockDirection,
  getBlockedUsers: () => getBlockedUsers,
  getDetailedStats: () => getDetailedStats,
  getRecentMessages: () => getRecentMessages,
  getReports: () => getReports,
  getStats: () => getStats,
  getStickerPacks: () => getStickerPacks2,
  getUserReports: () => getUserReports,
  isUserBlockedBy: () => isUserBlockedBy,
  resolveReport: () => resolveReport,
  resolveReportWithNotification: () => resolveReportWithNotification,
  resolveUserReport: () => resolveUserReport,
  resolveUserReportWithNotification: () => resolveUserReportWithNotification,
  revokeAllUserSessions: () => revokeAllUserSessions,
  revokeUserSession: () => revokeUserSession,
  searchMessages: () => searchMessages2,
  searchUsers: () => searchUsers,
  sendAdminMessageToUser: () => sendAdminMessageToUser,
  setUserRole: () => setUserRole,
  unblockUser: () => unblockUser
});
import { eq as eq4, sql as sql2, desc as desc3 } from "drizzle-orm";
async function getStats() {
  try {
    const [userCount] = await db.select({ count: sql2`count(*)::int` }).from(users);
    const [messageCount] = await db.select({ count: sql2`count(*)::int` }).from(messages);
    const [chatCount] = await db.select({ count: sql2`count(*)::int` }).from(chats);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const [activeToday] = await db.select({ count: sql2`count(*)::int` }).from(users).where(sql2`last_seen >= ${today.toISOString()}`);
    const [bannedCount] = await db.select({ count: sql2`count(*)::int` }).from(users).where(eq4(users.role, "banned"));
    const [reportedMessages] = await db.select({ count: sql2`count(*)::int` }).from(messages).where(sql2`flagged IS NOT NULL`);
    const [reportsCount] = await db.select({ count: sql2`count(*)::int` }).from(reports).where(eq4(reports.resolved, "false"));
    let pendingUserReports = 0;
    try {
      const [urCount] = await db.select({ count: sql2`count(*)::int` }).from(userReports).where(eq4(userReports.status, "pending"));
      pendingUserReports = urCount?.count || 0;
    } catch (_) {
    }
    return {
      totalUsers: userCount?.count || 0,
      totalMessages: messageCount?.count || 0,
      totalChats: chatCount?.count || 0,
      activeToday: activeToday?.count || 0,
      bannedUsers: bannedCount?.count || 0,
      reportedMessages: reportedMessages?.count || 0,
      pendingReports: reportsCount?.count || 0,
      pendingUserReports
    };
  } catch (error) {
    console.error("Error in getStats:", error);
    throw new Error("Failed to fetch stats");
  }
}
async function getAllUsers() {
  try {
    const allUsers = await db.select({
      id: users.id,
      uid: users.uid,
      email: users.email,
      displayName: users.displayName,
      username: users.username,
      photoURL: users.photoURL,
      status: users.status,
      role: users.role,
      lastSeen: users.lastSeen,
      createdAt: users.createdAt
    }).from(users).orderBy(desc3(users.createdAt));
    return allUsers;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw new Error("Failed to fetch users");
  }
}
async function setUserRole(uid, role) {
  try {
    const result = await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(users.uid, uid)).returning();
    if (!result[0]) {
      throw new Error("User not found");
    }
    const { passwordHash, ...safeUser } = result[0];
    return safeUser;
  } catch (error) {
    console.error("Error in setUserRole:", error);
    throw new Error("Failed to update user role");
  }
}
async function getRecentMessages(limit = 50, offset = 0) {
  try {
    const msgs = await db.select({
      id: messages.id,
      msgUid: messages.msgUid,
      chatId: messages.chatId,
      senderId: messages.senderId,
      senderName: messages.senderName,
      text: messages.text,
      type: messages.type,
      fileUrl: messages.fileUrl,
      fileName: messages.fileName,
      createdAt: messages.createdAt,
      flagged: messages.flagged
    }).from(messages).orderBy(desc3(messages.createdAt)).limit(limit).offset(offset);
    return msgs;
  } catch (error) {
    console.error("Error in getRecentMessages:", error);
    throw new Error("Failed to fetch messages");
  }
}
function getMessageCondition(msgId) {
  if (typeof msgId === "number" || typeof msgId === "string" && /^\d+$/.test(msgId)) {
    return eq4(messages.id, Number(msgId));
  }
  return eq4(messages.msgUid, msgId);
}
async function flagMessage(msgId, flag) {
  try {
    const condition = getMessageCondition(msgId);
    const result = await db.update(messages).set({ flagged: flag }).where(condition).returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error in flagMessage:", error);
    throw new Error("Failed to flag message");
  }
}
async function deleteMessageAdmin(msgId) {
  try {
    const condition = getMessageCondition(msgId);
    const result = await db.delete(messages).where(condition).returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error in deleteMessageAdmin:", error);
    throw new Error("Failed to delete message");
  }
}
async function getAllChats() {
  try {
    return await db.select().from(chats).orderBy(desc3(chats.updatedAt));
  } catch (error) {
    console.error("Error in getAllChats:", error);
    throw new Error("Failed to fetch chats");
  }
}
async function createReport(messageId, reporterId, reason, msgUid) {
  try {
    const existingMessage = await db.select().from(messages).where(eq4(messages.id, messageId)).limit(1);
    let resolvedMessageId = messageId;
    if (!existingMessage.length && msgUid) {
      const byUid = await db.select({ id: messages.id }).from(messages).where(sql2`${messages.msgUid} = ${msgUid}`).limit(1);
      if (byUid.length > 0) resolvedMessageId = byUid[0].id;
    }
    const reportId = Math.floor(Math.random() * 2147483647);
    const pgliteClient2 = db.$client;
    if (pgliteClient2) {
      const result = await pgliteClient2.query(
        "INSERT INTO reports (id, message_id, reporter_id, reason) VALUES ($1, $2, $3, $4) RETURNING *",
        [reportId, resolvedMessageId, reporterId, reason]
      );
      return result.rows?.[0] || result[0];
    } else {
      const result = await db.execute(
        sql2`INSERT INTO reports (id, message_id, reporter_id, reason) VALUES (${reportId}, ${messageId}, ${reporterId}, ${reason}) RETURNING *`
      );
      return result.rows?.[0] || result[0];
    }
  } catch (error) {
    console.error("Error in createReport:", error);
    throw error;
    throw new Error("Failed to create report");
  }
}
async function getReports() {
  try {
    const result = await db.select({
      id: reports.id,
      messageId: reports.messageId,
      reporterId: reports.reporterId,
      reason: reports.reason,
      createdAt: reports.createdAt,
      resolved: reports.resolved,
      messageText: messages.text,
      messageSenderId: messages.senderId,
      messageSenderName: messages.senderName,
      messageChatId: messages.chatId,
      messageCreatedAt: messages.createdAt,
      reporterName: users.displayName,
      reporterUid: users.uid
    }).from(reports).leftJoin(messages, eq4(reports.messageId, messages.id)).leftJoin(users, eq4(reports.reporterId, users.id)).orderBy(desc3(reports.createdAt));
    return result;
  } catch (error) {
    console.error("Error in getReports:", error);
    throw new Error("Failed to fetch reports");
  }
}
async function resolveReport(reportId) {
  try {
    const result = await db.update(reports).set({ resolved: "true" }).where(eq4(reports.id, reportId)).returning();
    return result[0];
  } catch (error) {
    console.error("Error in resolveReport:", error);
    throw new Error("Failed to resolve report");
  }
}
async function blockUser(blockerUid, blockedUid) {
  const pgliteClient2 = db.$client;
  const checkResult = await pgliteClient2.query(
    "SELECT * FROM user_blocks WHERE blocker_uid = $1 AND blocked_uid = $2 LIMIT 1",
    [blockerUid, blockedUid]
  );
  if (checkResult.rows && checkResult.rows.length > 0) return checkResult.rows[0];
  const id = Math.floor(Math.random() * 2147483647);
  const result = await pgliteClient2.query(
    "INSERT INTO user_blocks (id, blocker_uid, blocked_uid) VALUES ($1, $2, $3) RETURNING *",
    [id, blockerUid, blockedUid]
  );
  return result.rows?.[0] || result[0];
}
async function unblockUser(blockerUid, blockedUid) {
  const pgliteClient2 = db.$client;
  const result = await pgliteClient2.query(
    "DELETE FROM user_blocks WHERE blocker_uid = $1 AND blocked_uid = $2 RETURNING *",
    [blockerUid, blockedUid]
  );
  return result.rows?.[0] || result[0];
}
async function getBlockedUsers(uid) {
  const pgliteClient2 = db.$client;
  const result = await pgliteClient2.query(
    "SELECT blocked_uid FROM user_blocks WHERE blocker_uid = $1",
    [uid]
  );
  return (result.rows || []).map((r) => r.blocked_uid);
}
async function isUserBlockedBy(blockerUid, blockedUid) {
  const pgliteClient2 = db.$client;
  const result = await pgliteClient2.query(
    "SELECT 1 FROM user_blocks WHERE blocker_uid = $1 AND blocked_uid = $2 LIMIT 1",
    [blockerUid, blockedUid]
  );
  return (result.rows || []).length > 0;
}
async function getBlockDirection(uid1, uid2) {
  const a = await isUserBlockedBy(uid1, uid2);
  const b = await isUserBlockedBy(uid2, uid1);
  if (a && b) return "both";
  if (a) return "by_me";
  if (b) return "by_them";
  return "none";
}
async function createUserReport(targetUid, reporterUid, reason, description) {
  const pgliteClient2 = db.$client;
  const id = Math.floor(Math.random() * 2147483647);
  const result = await pgliteClient2.query(
    "INSERT INTO user_reports (id, target_uid, reporter_uid, reason, description) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [id, targetUid, reporterUid, reason, description || null]
  );
  return result.rows?.[0] || result[0];
}
async function getUserReports() {
  try {
    const pgliteClient2 = db.$client;
    const result = await pgliteClient2.query(
      "SELECT * FROM user_reports ORDER BY created_at DESC"
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error in getUserReports:", error);
    throw new Error("Failed to fetch user reports");
  }
}
async function resolveUserReport(reportId, adminNote) {
  try {
    const pgliteClient2 = db.$client;
    const result = await pgliteClient2.query(
      "UPDATE user_reports SET status = $1, admin_note = $2, resolved_at = NOW() WHERE id = $3 RETURNING *",
      ["resolved", adminNote || null, reportId]
    );
    return result.rows?.[0] || null;
  } catch (error) {
    console.error("Error in resolveUserReport:", error);
    throw new Error("Failed to resolve user report");
  }
}
async function dismissUserReport(reportId) {
  try {
    const pgliteClient2 = db.$client;
    const result = await pgliteClient2.query(
      "UPDATE user_reports SET status = $1, resolved_at = NOW() WHERE id = $2 RETURNING *",
      ["dismissed", reportId]
    );
    return result.rows?.[0] || null;
  } catch (error) {
    console.error("Error in dismissUserReport:", error);
    throw new Error("Failed to dismiss user report");
  }
}
async function createAuditLog(action, adminUid, details, targetUid) {
  try {
    const pgliteClient2 = db.$client;
    const id = Math.floor(Math.random() * 2147483647);
    const detailsJson = details ? JSON.stringify({ message: details }) : null;
    await pgliteClient2.query(
      "INSERT INTO audit_logs (id, action, user_id, target_id, details) VALUES ($1, $2, $3, $4, $5)",
      [id, action, adminUid, targetUid || null, detailsJson]
    );
  } catch (error) {
    console.error("Error in createAuditLog:", error);
  }
}
async function getAuditLogs(limit = 100, offset = 0) {
  try {
    const pgliteClient2 = db.$client;
    const result = await pgliteClient2.query(
      "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error in getAuditLogs:", error);
    return [];
  }
}
async function getAuditLogsCount() {
  try {
    const pgliteClient2 = db.$client;
    const result = await pgliteClient2.query("SELECT COUNT(*)::int as count FROM audit_logs");
    return result.rows?.[0]?.count || 0;
  } catch (error) {
    return 0;
  }
}
async function broadcastMessage(text3, senderUid) {
  try {
    const allUsers = await db.select({ id: users.id, uid: users.uid }).from(users);
    let sender = await db.select({ displayName: users.displayName, id: users.id }).from(users).where(eq4(users.uid, senderUid)).limit(1);
    let senderName = sender[0]?.displayName || "Admin";
    let senderId = sender[0]?.id;
    if (!senderId) {
      const adminUser = await db.select({ id: users.id, displayName: users.displayName }).from(users).where(eq4(users.role, "admin")).limit(1);
      if (adminUser.length > 0) {
        senderId = adminUser[0].id;
        senderName = adminUser[0].displayName || "Admin";
      } else {
        const anyUser = await db.select({ id: users.id, displayName: users.displayName }).from(users).limit(1);
        if (anyUser.length > 0) {
          senderId = anyUser[0].id;
          senderName = anyUser[0].displayName || "Admin";
        } else {
          throw new Error("No users found to broadcast from");
        }
      }
    }
    const allChats = await db.select({ id: chats.id, chatUid: chats.chatUid, type: chats.type, participants: chats.participants, creatorId: chats.creatorId }).from(chats).where(eq4(chats.type, "private"));
    let count2 = 0;
    for (const user of allUsers) {
      if (user.uid === senderUid) continue;
      const existingChat = allChats.find((c) => {
        const p = c.participants;
        return Array.isArray(p) && p.includes(user.uid);
      });
      let chatId;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        const chatUid = `broadcast_${Date.now()}_${user.uid}`;
        const result = await db.insert(chats).values({
          chatUid,
          type: "private",
          name: "Broadcast",
          participants: [senderUid, user.uid],
          members: [senderUid, user.uid],
          creatorId: senderId
        }).returning();
        chatId = result[0].id;
      }
      const msgUid = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(messages).values({
        msgUid,
        chatId,
        senderId,
        senderName: "\u{1F6E1}\uFE0F " + senderName,
        text: text3,
        type: "admin_broadcast"
      });
      count2++;
    }
    return { sent: count2 };
  } catch (error) {
    console.error("Error in broadcastMessage:", error);
    throw new Error("Failed to broadcast message");
  }
}
async function searchUsers(query) {
  try {
    const allUsers = await db.select({
      id: users.id,
      uid: users.uid,
      email: users.email,
      displayName: users.displayName,
      username: users.username,
      photoURL: users.photoURL,
      status: users.status,
      role: users.role,
      lastSeen: users.lastSeen,
      createdAt: users.createdAt
    }).from(users).where(sql2`LOWER(${users.displayName}) LIKE LOWER(${"%" + query + "%"}) OR LOWER(${users.username}) LIKE LOWER(${"%" + query + "%"}) OR LOWER(${users.email}) LIKE LOWER(${"%" + query + "%"})`).orderBy(desc3(users.createdAt));
    return allUsers;
  } catch (error) {
    console.error("Error in searchUsers:", error);
    return [];
  }
}
async function getAllSessions() {
  try {
    const pgliteClient2 = db.$client;
    const result = await pgliteClient2.query(
      `SELECT s.*, u.display_name, u.email, u.uid as user_uid 
       FROM sessions s 
       LEFT JOIN users u ON s.user_uid = u.uid 
       ORDER BY s.last_active DESC 
       LIMIT 200`
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error in getAllSessions:", error);
    return [];
  }
}
async function revokeUserSession(sessionUid) {
  try {
    const pgliteClient2 = db.$client;
    await pgliteClient2.query("DELETE FROM sessions WHERE session_uid = $1", [sessionUid]);
    return true;
  } catch (error) {
    console.error("Error in revokeUserSession:", error);
    return false;
  }
}
async function revokeAllUserSessions(userId) {
  try {
    const pgliteClient2 = db.$client;
    const userResult = await pgliteClient2.query("SELECT uid FROM users WHERE id = $1", [userId]);
    if (userResult.rows && userResult.rows.length > 0) {
      const userUid = userResult.rows[0].uid;
      await pgliteClient2.query("DELETE FROM sessions WHERE user_uid = $1", [userUid]);
    }
    return true;
  } catch (error) {
    console.error("Error in revokeAllUserSessions:", error);
    return false;
  }
}
async function getDetailedStats() {
  try {
    const baseStats = await getStats();
    const pgliteClient2 = db.$client;
    let dailyMessages = [];
    let dailyUsers = [];
    let chatTypes = [];
    let messageTypes = [];
    let topChatters = [];
    try {
      const dm = await pgliteClient2.query(
        `SELECT DATE(created_at) as day, COUNT(*)::int as count 
         FROM messages 
         WHERE created_at >= NOW() - INTERVAL '7 days' 
         GROUP BY DATE(created_at) ORDER BY day`
      );
      dailyMessages = dm.rows || [];
    } catch (_) {
    }
    try {
      const du = await pgliteClient2.query(
        `SELECT DATE(created_at) as day, COUNT(*)::int as count 
         FROM users 
         WHERE created_at >= NOW() - INTERVAL '7 days' 
         GROUP BY DATE(created_at) ORDER BY day`
      );
      dailyUsers = du.rows || [];
    } catch (_) {
    }
    try {
      const ct = await pgliteClient2.query(
        `SELECT type, COUNT(*)::int as count FROM chats GROUP BY type`
      );
      chatTypes = ct.rows || [];
    } catch (_) {
    }
    try {
      const mt = await pgliteClient2.query(
        `SELECT COALESCE(type, 'text') as type, COUNT(*)::int as count FROM messages GROUP BY type`
      );
      messageTypes = mt.rows || [];
    } catch (_) {
    }
    try {
      const tc = await pgliteClient2.query(
        `SELECT sender_name, COUNT(*)::int as count 
         FROM messages 
         WHERE sender_name IS NOT NULL 
         GROUP BY sender_name 
         ORDER BY count DESC 
         LIMIT 10`
      );
      topChatters = tc.rows || [];
    } catch (_) {
    }
    let dbSize = "0 MB";
    try {
      const sz = await pgliteClient2.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
      dbSize = sz.rows?.[0]?.size || "0 MB";
    } catch (_) {
    }
    return {
      ...baseStats,
      dailyMessages,
      dailyUsers,
      chatTypes,
      messageTypes,
      topChatters,
      dbSize
    };
  } catch (error) {
    console.error("Error in getDetailedStats:", error);
    throw new Error("Failed to fetch detailed stats");
  }
}
async function getStickerPacks2() {
  try {
    const pgliteClient2 = db.$client;
    const result = await pgliteClient2.query(
      "SELECT sp.*, COUNT(s.id)::int as sticker_count FROM sticker_packs sp LEFT JOIN stickers s ON s.pack_id = sp.id GROUP BY sp.id ORDER BY sp.created_at DESC"
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error in getStickerPacks:", error);
    return [];
  }
}
async function deleteStickerPack(packId) {
  try {
    const pgliteClient2 = db.$client;
    await pgliteClient2.query("DELETE FROM stickers WHERE pack_id = $1", [packId]);
    await pgliteClient2.query("DELETE FROM sticker_packs WHERE id = $1", [packId]);
    return true;
  } catch (error) {
    console.error("Error in deleteStickerPack:", error);
    return false;
  }
}
async function deleteAllChatMessages(chatId) {
  try {
    const result = await db.delete(messages).where(eq4(messages.chatId, chatId)).returning();
    return result.length;
  } catch (error) {
    console.error("Error in deleteAllChatMessages:", error);
    return 0;
  }
}
async function searchMessages2(query, limit = 50) {
  try {
    const msgs = await db.select({
      id: messages.id,
      msgUid: messages.msgUid,
      chatId: messages.chatId,
      senderId: messages.senderId,
      senderName: messages.senderName,
      text: messages.text,
      type: messages.type,
      fileUrl: messages.fileUrl,
      fileName: messages.fileName,
      createdAt: messages.createdAt,
      flagged: messages.flagged
    }).from(messages).where(sql2`LOWER(${messages.text}) LIKE LOWER(${"%" + query + "%"})`).orderBy(desc3(messages.createdAt)).limit(limit);
    return msgs;
  } catch (error) {
    console.error("Error in searchMessages:", error);
    return [];
  }
}
async function findUserByUsernameOrUid(identifier) {
  try {
    const pgliteClient2 = db.$client;
    let result = await pgliteClient2.query(
      "SELECT id, uid, display_name, username, photo_url, role FROM users WHERE uid = $1 LIMIT 1",
      [identifier]
    );
    if (result.rows && result.rows.length > 0) return result.rows[0];
    const clean = identifier.startsWith("@") ? identifier.slice(1) : identifier;
    result = await pgliteClient2.query(
      "SELECT id, uid, display_name, username, photo_url, role FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1",
      [clean]
    );
    if (result.rows && result.rows.length > 0) return result.rows[0];
    result = await pgliteClient2.query(
      "SELECT id, uid, display_name, username, photo_url, role FROM users WHERE LOWER(username) LIKE LOWER($1) LIMIT 5",
      ["%" + clean + "%"]
    );
    return result.rows?.[0] || null;
  } catch (error) {
    console.error("Error in findUserByUsernameOrUid:", error);
    return null;
  }
}
async function findOrCreatePrivateChat(uid1, uid2, creatorDbId) {
  const existingChats = await db.select({ id: chats.id, participants: chats.participants }).from(chats).where(eq4(chats.type, "private"));
  for (const c of existingChats) {
    const p = c.participants;
    if (Array.isArray(p) && p.includes(uid1) && p.includes(uid2)) {
      return c.id;
    }
  }
  const chatUid = `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const result = await db.insert(chats).values({
    chatUid,
    type: "private",
    name: "Direct",
    participants: [uid1, uid2],
    members: [uid1, uid2],
    creatorId: creatorDbId
  }).returning();
  return result[0].id;
}
async function sendAdminMessageToUser(targetIdentifier, text3, senderUid) {
  try {
    const target = await findUserByUsernameOrUid(targetIdentifier);
    if (!target) {
      throw new Error(`\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C "${targetIdentifier}" \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u0423\u043A\u0430\u0436\u0438\u0442\u0435 UID \u0438\u043B\u0438 @username.`);
    }
    let sender = null;
    if (senderUid) {
      const rows = await db.select({ id: users.id, displayName: users.displayName }).from(users).where(eq4(users.uid, senderUid)).limit(1);
      sender = rows[0] || null;
    }
    if (!sender) {
      const adminUser = await db.select({ id: users.id, uid: users.uid, displayName: users.displayName }).from(users).where(eq4(users.role, "admin")).limit(1);
      sender = adminUser[0] || null;
    }
    if (!sender) {
      throw new Error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u0435\u043B\u044F-\u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430");
    }
    const chatId = await findOrCreatePrivateChat(sender.uid, target.uid, sender.id);
    const msgUid = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await db.insert(messages).values({
      msgUid,
      chatId,
      senderId: sender.id,
      senderName: "\u{1F6E1}\uFE0F " + (sender.displayName || "Admin"),
      text: text3,
      type: "admin_broadcast"
    }).returning();
    return {
      success: true,
      message: result[0],
      targetUser: { uid: target.uid, displayName: target.display_name, username: target.username }
    };
  } catch (error) {
    console.error("Error in sendAdminMessageToUser:", error);
    throw error;
  }
}
async function notifyUserAboutReportResolution(reporterUid, reportType, reportReason, adminNote) {
  try {
    const adminUser = await db.select({ id: users.id, uid: users.uid, displayName: users.displayName }).from(users).where(eq4(users.role, "admin")).limit(1);
    if (!adminUser.length) return;
    const admin = adminUser[0];
    const reporter = await db.select({ id: users.id, uid: users.uid }).from(users).where(eq4(users.uid, reporterUid)).limit(1);
    if (!reporter.length) return;
    const chatId = await findOrCreatePrivateChat(admin.uid, reporterUid, admin.id);
    const typeLabel = reportType === "message" ? "\u0436\u0430\u043B\u043E\u0431\u0430 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435" : "\u0436\u0430\u043B\u043E\u0431\u0430 \u043D\u0430 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F";
    let text3 = `\u{1F6E1}\uFE0F \u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043B\u0430 \u0432\u0430\u0448\u0443 ${typeLabel} \u043F\u043E \u043F\u0440\u0438\u0447\u0438\u043D\u0435: \xAB${reportReason}\xBB.

\u0420\u0435\u0448\u0435\u043D\u0438\u0435: \u0436\u0430\u043B\u043E\u0431\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u0430.`;
    if (adminNote) {
      text3 += `

\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430: ${adminNote}`;
    }
    const msgUid = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(messages).values({
      msgUid,
      chatId,
      senderId: admin.id,
      senderName: "\u{1F6E1}\uFE0F " + (admin.displayName || "Admin"),
      text: text3,
      type: "admin_broadcast"
    });
  } catch (error) {
    console.error("Error notifying user about report resolution:", error);
  }
}
async function resolveReportWithNotification(reportId) {
  try {
    const reportData = await db.select({
      id: reports.id,
      reporterId: reports.reporterId,
      reason: reports.reason
    }).from(reports).where(eq4(reports.id, reportId)).limit(1);
    const result = await db.update(reports).set({ resolved: "true" }).where(eq4(reports.id, reportId)).returning();
    if (result[0] && reportData.length > 0) {
      const reporter = await db.select({ uid: users.uid }).from(users).where(eq4(users.id, reportData[0].reporterId)).limit(1);
      if (reporter.length > 0) {
        await notifyUserAboutReportResolution(reporter[0].uid, "message", reportData[0].reason);
      }
    }
    return result[0];
  } catch (error) {
    console.error("Error in resolveReportWithNotification:", error);
    throw new Error("Failed to resolve report");
  }
}
async function resolveUserReportWithNotification(reportId, adminNote) {
  try {
    const pgliteClient2 = db.$client;
    const reportResult = await pgliteClient2.query(
      "SELECT id, reporter_uid, reason FROM user_reports WHERE id = $1",
      [reportId]
    );
    const reportData = reportResult.rows?.[0];
    const result = await pgliteClient2.query(
      "UPDATE user_reports SET status = $1, admin_note = $2, resolved_at = NOW() WHERE id = $3 RETURNING *",
      ["resolved", adminNote || null, reportId]
    );
    if (result.rows?.[0] && reportData) {
      await notifyUserAboutReportResolution(reportData.reporter_uid, "user", reportData.reason, adminNote);
    }
    return result.rows?.[0] || null;
  } catch (error) {
    console.error("Error in resolveUserReportWithNotification:", error);
    throw new Error("Failed to resolve user report");
  }
}
var init_admin = __esm({
  "src/db/admin.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/services/redis.ts
import Redis from "ioredis";
function getRedis() {
  return redis;
}
async function createRedisConnection() {
  if (!REDIS_ENABLED) {
    logger.warn("[Redis] REDIS_ENABLED=false, using in-memory mock");
    return new MockRedis();
  }
  try {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn("[Redis] Max retries reached, falling back to mock");
          return null;
        }
        return Math.min(times * 200, 2e3);
      },
      lazyConnect: true,
      connectTimeout: 3e3
    });
    client.on("error", (err) => {
      logger.warn({ err: err.message }, "[Redis] Connection error");
    });
    client.on("connect", () => {
      logger.info("[Redis] Connected");
    });
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3e3))
    ]);
    const pong = await client.ping();
    if (pong === "PONG") {
      logger.info(`[Redis] Connected to ${REDIS_URL}`);
      return client;
    }
    throw new Error("Ping failed");
  } catch (err) {
    logger.warn({ err: err.message }, `[Redis] Failed to connect to ${REDIS_URL}, using in-memory mock`);
    return new MockRedis();
  }
}
var REDIS_URL, REDIS_ENABLED, MockRedis, redis;
var init_redis = __esm({
  async "server/services/redis.ts"() {
    "use strict";
    init_logger();
    REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
    REDIS_ENABLED = process.env.REDIS_ENABLED !== "false";
    MockRedis = class {
      constructor() {
        this.store = /* @__PURE__ */ new Map();
        this.sets = /* @__PURE__ */ new Map();
        this.hashes = /* @__PURE__ */ new Map();
      }
      async get(key) {
        return this.store.get(key) ?? null;
      }
      async set(key, val, ...args) {
        this.store.set(key, val);
        if (args.includes("EX")) {
          const ttlSec = Number(args[args.indexOf("EX") + 1]);
          setTimeout(() => this.store.delete(key), ttlSec * 1e3);
        }
        return "OK";
      }
      async del(...keys) {
        let count2 = 0;
        for (const k of keys) {
          if (this.store.delete(k)) count2++;
        }
        return count2;
      }
      async sAdd(key, ...members) {
        if (!this.sets.has(key)) this.sets.set(key, /* @__PURE__ */ new Set());
        let added = 0;
        for (const m of members) {
          if (!this.sets.get(key).has(m)) {
            this.sets.get(key).add(m);
            added++;
          }
        }
        return added;
      }
      async sMembers(key) {
        return Array.from(this.sets.get(key) ?? []);
      }
      async sRem(key, ...members) {
        const s = this.sets.get(key);
        if (!s) return 0;
        let removed = 0;
        for (const m of members) {
          if (s.delete(m)) removed++;
        }
        return removed;
      }
      async sCard(key) {
        return this.sets.get(key)?.size ?? 0;
      }
      async expire(_key, _seconds) {
        return 1;
      }
      async ttl(_key) {
        return -1;
      }
      async keys(pattern) {
        const prefix = pattern.replace("*", "");
        return Array.from(this.store.keys()).filter((k) => k.startsWith(prefix));
      }
      async hset(key, field, value) {
        if (!this.hashes.has(key)) this.hashes.set(key, /* @__PURE__ */ new Map());
        this.hashes.get(key).set(field, value);
        return 1;
      }
      async hget(key, field) {
        return this.hashes.get(key)?.get(field) ?? null;
      }
      async hgetall(key) {
        return Object.fromEntries(this.hashes.get(key) ?? []);
      }
      async hdel(key, ...fields) {
        const h = this.hashes.get(key);
        if (!h) return 0;
        let removed = 0;
        for (const f of fields) {
          if (h.delete(f)) removed++;
        }
        return removed;
      }
      async lpush(key, ...values) {
        const existing = JSON.parse(this.store.get(key) || "[]");
        this.store.set(key, JSON.stringify([...values.reverse(), ...existing]));
        return existing.length + values.length;
      }
      async rpop(key) {
        const arr = JSON.parse(this.store.get(key) || "[]");
        const val = arr.pop();
        if (arr.length) this.store.set(key, JSON.stringify(arr));
        else this.store.delete(key);
        return val ?? null;
      }
      async lrange(key, start, stop) {
        const arr = JSON.parse(this.store.get(key) || "[]");
        return stop === -1 ? arr.slice(start) : arr.slice(start, stop + 1);
      }
      async llen(key) {
        return JSON.parse(this.store.get(key) || "[]").length;
      }
      async ping() {
        return "PONG";
      }
      on(_event, _handler) {
      }
      async disconnect() {
      }
    };
    redis = await createRedisConnection();
  }
});

// server/services/invite-store.ts
var invite_store_exports = {};
__export(invite_store_exports, {
  deleteInviteToken: () => deleteInviteToken,
  generateInviteToken: () => generateInviteToken,
  getInviteChatId: () => getInviteChatId,
  revokeInviteTokensByChatId: () => revokeInviteTokensByChatId,
  setInviteToken: () => setInviteToken
});
import { randomBytes as randomBytes2 } from "crypto";
function generateInviteToken() {
  return randomBytes2(16).toString("hex");
}
async function setInviteToken(token, chatId) {
  const redis2 = getRedis();
  await redis2.set(`${PREFIX}${token}`, chatId);
  await redis2.sAdd(`${CHAT_INDEX_PREFIX}${chatId}`, token);
}
async function getInviteChatId(token) {
  const redis2 = getRedis();
  const result = await redis2.get(`${PREFIX}${token}`);
  return result ?? void 0;
}
async function deleteInviteToken(token) {
  const redis2 = getRedis();
  const chatId = await redis2.get(`${PREFIX}${token}`);
  await redis2.del(`${PREFIX}${token}`);
  if (chatId) {
    await redis2.sRem(`${CHAT_INDEX_PREFIX}${chatId}`, token);
  }
}
async function revokeInviteTokensByChatId(chatId) {
  const redis2 = getRedis();
  const tokens = await redis2.sMembers(`${CHAT_INDEX_PREFIX}${chatId}`);
  if (tokens.length > 0) {
    const pipeline = redis2.pipeline?.() || null;
    if (pipeline) {
      for (const tok of tokens) {
        pipeline.del(`${PREFIX}${tok}`);
      }
      pipeline.del(`${CHAT_INDEX_PREFIX}${chatId}`);
      await pipeline.exec();
    } else {
      for (const tok of tokens) {
        await redis2.del(`${PREFIX}${tok}`);
      }
      await redis2.del(`${CHAT_INDEX_PREFIX}${chatId}`);
    }
  }
}
var PREFIX, CHAT_INDEX_PREFIX;
var init_invite_store = __esm({
  async "server/services/invite-store.ts"() {
    "use strict";
    await init_redis();
    PREFIX = "invite:";
    CHAT_INDEX_PREFIX = "invite:chat:";
  }
});

// src/lib/push.ts
var push_exports = {};
__export(push_exports, {
  getUserSubscriptions: () => getUserSubscriptions,
  getVapidPublicKey: () => getVapidPublicKey,
  removeSubscription: () => removeSubscription,
  removeUserSubscription: () => removeUserSubscription,
  saveSubscription: () => saveSubscription,
  sendPushForCall: () => sendPushForCall,
  sendPushToChatMembers: () => sendPushToChatMembers,
  sendPushToUser: () => sendPushToUser,
  validateSubscriptionExists: () => validateSubscriptionExists
});
import { eq as eq5, and as and4 } from "drizzle-orm";
import webpush from "web-push";
function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}
async function saveSubscription(userId, endpoint, subscription, userAgent) {
  try {
    await db.delete(pushSubscriptions).where(eq5(pushSubscriptions.endpoint, endpoint));
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint,
      subscription,
      userAgent: userAgent || null
    });
    await cleanupOldSubscriptions(userId, 10);
    console.log(`[Push] Subscription saved for user ${userId}`);
  } catch (err) {
    console.error("[Push] Failed to save subscription:", err);
    throw err;
  }
}
async function removeSubscription(endpoint) {
  await db.delete(pushSubscriptions).where(eq5(pushSubscriptions.endpoint, endpoint));
}
async function removeUserSubscription(userId, endpoint) {
  await db.delete(pushSubscriptions).where(
    and4(
      eq5(pushSubscriptions.endpoint, endpoint),
      eq5(pushSubscriptions.userId, userId)
    )
  );
}
async function getUserSubscriptions(userId) {
  return db.select().from(pushSubscriptions).where(eq5(pushSubscriptions.userId, userId));
}
async function validateSubscriptionExists(endpoint) {
  try {
    const result = await db.select({ id: pushSubscriptions.id }).from(pushSubscriptions).where(eq5(pushSubscriptions.endpoint, endpoint)).limit(1);
    return result.length > 0;
  } catch {
    return false;
  }
}
async function cleanupOldSubscriptions(userId, limit) {
  try {
    const subs = await getUserSubscriptions(userId);
    if (subs.length <= limit) return;
    const sorted = subs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    const toDelete = sorted.slice(limit);
    for (const sub of toDelete) {
      await removeSubscription(sub.endpoint);
    }
    console.log(`[Push] Cleaned up ${toDelete.length} old subscriptions for user ${userId}`);
  } catch (err) {
    console.error("[Push] Cleanup failed:", err);
  }
}
async function sendPushToUser(userId, payload) {
  const subs = await getUserSubscriptions(userId);
  if (subs.length === 0) {
    console.log(`[Push] No subscriptions for user ${userId}`);
    return [];
  }
  const sendPromises = subs.map(async (sub) => {
    try {
      const subscriptionObj = sub.subscription;
      await webpush.sendNotification(subscriptionObj, JSON.stringify(payload), {
        TTL: 60 * 60,
        // 1 час — сообщение устареет если не доставлено
        urgency: "high"
        // Высокий приоритет для мессенджера
      });
      console.log(`[Push] \u2705 Sent to user ${userId} (endpoint: ${sub.endpoint.substring(0, 50)}...)`);
      return { endpoint: sub.endpoint, success: true };
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log(`[Push] \u{1F5D1}\uFE0F Removing invalid subscription (status ${err.statusCode})`);
        await removeSubscription(sub.endpoint).catch(() => {
        });
        return { endpoint: sub.endpoint, success: false, error: `Subscription expired (${err.statusCode})` };
      }
      if (err.statusCode === 429) {
        console.warn(`[Push] \u26A0\uFE0F Rate limited for user ${userId}`);
        return { endpoint: sub.endpoint, success: false, error: "Rate limited" };
      }
      console.error(`[Push] \u274C Send failed for user ${userId}:`, err.message);
      return { endpoint: sub.endpoint, success: false, error: err.message };
    }
  });
  return Promise.all(sendPromises);
}
async function sendPushToChatMembers(chatId, senderId, senderUid, senderName, messageText, messageType) {
  try {
    console.log(`[Push] \u{1F4E4} sendPushToChatMembers called: chatId=${chatId}, senderId=${senderId}, senderUid=${senderUid}`);
    const chatData = await getChat(chatId);
    if (!chatData) {
      console.warn(`[Push] \u274C Chat ${chatId} not found in database`);
      return [];
    }
    console.log(`[Push] Chat found: id=${chatData.id}, chatUid=${chatData.chatUid}, name=${chatData.name}`);
    const members = chatData.members || [];
    const mutedBy = chatData.mutedBy || [];
    console.log(`[Push] Members: [${members.join(", ")}], mutedBy: [${mutedBy.join(", ")}], senderUid: ${senderUid}`);
    const targets = [...new Set(
      members.filter((uid) => String(uid) !== String(senderUid) && !mutedBy.includes(String(uid)))
    )];
    console.log(`[Push] Targets after filtering: [${targets.join(", ")}] (${targets.length} users)`);
    if (targets.length === 0) {
      console.log(`[Push] \u26A0\uFE0F No targets to send push in chat ${chatId}`);
      return [];
    }
    const targetUserIds = [];
    const { getUser: getUser2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
    for (const targetUid of targets) {
      const targetUser = await getUser2(String(targetUid));
      if (targetUser) {
        targetUserIds.push(targetUser.id);
        console.log(`[Push] Target ${targetUid} \u2192 numeric ID ${targetUser.id}`);
      } else {
        console.warn(`[Push] \u26A0\uFE0F User ${targetUid} not found in DB`);
      }
    }
    if (targetUserIds.length === 0) {
      console.warn(`[Push] \u274C No valid user IDs found for targets`);
      return [];
    }
    const chatName = chatData.name || "\u0427\u0430\u0442";
    const typeLabel = messageType === "image" ? "\u{1F4F7} \u0424\u043E\u0442\u043E" : messageType === "file" ? "\u{1F4CE} \u0424\u0430\u0439\u043B" : messageType === "voice" ? "\u{1F3A4} \u0413\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0435" : messageType === "video" ? "\u{1F4F9} \u0412\u0438\u0434\u0435\u043E" : "";
    const body = typeLabel ? `${senderName}: ${typeLabel}` : `${senderName}: ${messageText?.slice(0, 150) || ""}`;
    const tagId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      title: chatName,
      body,
      tag: `chat-${chatData.id}-msg-${tagId}`,
      url: `/chat/${chatData.chatUid || chatData.id}`,
      chatId: chatData.id
    };
    console.log(`[Push] \u{1F4E8} Sending push to ${targetUserIds.length} users in chat ${chatData.id} (${chatName})`);
    console.log(`[Push] Payload:`, JSON.stringify(payload));
    const allResults = await Promise.all(
      targetUserIds.map(async (numericUserId) => {
        console.log(`[Push] \u2192 Sending to user ${numericUserId}...`);
        const memberResults = await sendPushToUser(numericUserId, payload);
        console.log(`[Push] \u2190 User ${numericUserId} results:`, JSON.stringify(memberResults));
        return memberResults;
      })
    );
    const flatResults = allResults.flat();
    const successCount = flatResults.filter((r) => r.success).length;
    const failCount = flatResults.filter((r) => !r.success).length;
    console.log(`[Push] \u2705 Chat ${chatId}: ${successCount} sent, ${failCount} failed`);
    return flatResults;
  } catch (err) {
    console.error("[Push] \u274C sendPushToChatMembers error:", err);
    return [];
  }
}
async function sendPushForCall(chatId, callerName, callerAvatar, isVideo) {
  try {
    const chat = await db.select().from(chats).where(eq5(chats.id, chatId)).limit(1);
    if (!chat.length) return [];
    const chatData = chat[0];
    const members = chatData.members || [];
    const mutedBy = chatData.mutedBy || [];
    const targets = [...new Set(
      members.filter((uid) => !mutedBy.includes(uid))
    )];
    if (targets.length === 0) return [];
    const payload = {
      title: `\u{1F4DE} ${callerName}`,
      body: isVideo ? "\u0412\u0438\u0434\u0435\u043E\u0437\u0432\u043E\u043D\u043E\u043A..." : "\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0437\u0432\u043E\u043D\u043E\u043A...",
      tag: `call-${chatId}`,
      url: `/chat/${chatId}`,
      chatId,
      icon: callerAvatar,
      requireInteraction: true
      // Важно для звонков — уведомление не пропадёт
    };
    const allResults = await Promise.all(
      targets.map((memberId) => sendPushToUser(memberId, payload))
    );
    return allResults.flat();
  } catch (err) {
    console.error("[Push] sendPushForCall error:", err);
    return [];
  }
}
var VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT;
var init_push = __esm({
  "src/lib/push.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_helpers();
    VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
    VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
    VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@qwercrool.app";
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    } else {
      console.warn("[Push] \u26A0\uFE0F VAPID keys not configured! Push notifications will not work.");
      console.warn("[Push] Run: node scripts/generate-vapid.js to generate keys");
    }
  }
});

// server/index.ts
init_db();
init_jwtAuth();
import express2 from "express";
import { createServer as createViteServer } from "vite";
import { timingSafeEqual as timingSafeEqual5 } from "crypto";
import fs5 from "fs";
import path6 from "path";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { sql as sql4, eq as eq10, and as and7 } from "drizzle-orm";

// src/middleware/security.ts
import rateLimit from "express-rate-limit";
function securityHeaders(req, res, next) {
  const isDev2 = process.env.NODE_ENV !== "production" && !process.env.FORCE_CSP_STRICT;
  const scriptSrc = isDev2 ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://meet.jit.si https://8x8.vc" : "script-src 'self' https://meet.jit.si https://8x8.vc";
  res.setHeader("Content-Security-Policy", [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.giphy.com https://media.giphy.com https://tenor.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://i.ytimg.com https://*.ytimg.com https://archive.org https://*.archive.org https://*.audius.co https://*.radio-browser.info https://*.invidious.* https://yewtu.be https://*.googleusercontent.com https://www.transparenttextures.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' wss: ws: https://fonts.googleapis.com https://fonts.gstatic.com https://tenor.googleapis.com https://fcm.googleapis.com https://api.giphy.com https://archive.org https://*.archive.org https://*.audius.co https://discoveryprovider.audius.co https://*.radio-browser.info https://*.invidious.* https://pipedapi.kavin.rocks https://pipedapi.tokhmi.xyz https://api.piped.private.coffee",
    "media-src 'self' blob: data: https://archive.org https://*.archive.org https://*.audius.co https://*.radio-browser.info https://*.googlevideo.com https://*.ytimg.com https://*.radio.co https://*.radioca.st https://*.stream.radioreference.com https:",
    "frame-src 'self' https://meet.jit.si https://meet.ffmuc.net https://jitsi.linux.it https://jitsi.riot.im https://jitsi.hamburg.ccc.de",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; "));
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (process.env.NODE_ENV === "production" || process.env.FORCE_HSTS === "true") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  res.setHeader("Permissions-Policy", [
    "camera=()",
    "microphone=(self)",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
    "autoplay=(self)"
  ].join(", "));
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.removeHeader("X-Powered-By");
  next();
}
function isAdmin(req) {
  try {
    const user = req.user;
    if (user?.role === "admin") return true;
    if (user?.uid) return false;
    return false;
  } catch {
    return false;
  }
}
function userKeyGenerator(req) {
  const user = req.user;
  if (user?.uid) return `user:${user.uid}`;
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return `ip:${ip}`;
}
function ipKeyGenerator(req) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return `ip:${ip}`;
}
function rateLimitResponse(_req, res, _next, options) {
  res.status(429).json({
    error: options.message || "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0437\u0436\u0435."
  });
}
var loginRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u043F\u043E\u043F\u044B\u0442\u043E\u043A \u0432\u0445\u043E\u0434\u0430. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443.",
  handler: rateLimitResponse,
  validate: false
});
var registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 час
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0439. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u0447\u0430\u0441.",
  handler: rateLimitResponse,
  validate: false
});
var qrGenerateRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432 \u043D\u0430 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044E QR-\u043A\u043E\u0434\u043E\u0432. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443.",
  handler: rateLimitResponse,
  validate: false
});
var messageRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043F\u0435\u0440\u0435\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u043E\u0439 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0445.",
  handler: rateLimitResponse,
  validate: false
});
var chatsRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432 \u043A \u0441\u043F\u0438\u0441\u043A\u0443 \u0447\u0430\u0442\u043E\u0432. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443.",
  handler: rateLimitResponse,
  validate: false
});
var defaultApiRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D \u043B\u0438\u043C\u0438\u0442 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043F\u0435\u0440\u0435\u0434 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u044B\u043C \u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u0438.",
  handler: rateLimitResponse,
  validate: false
});
var uploadRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u0433\u0440\u0443\u0437\u043E\u043A \u0444\u0430\u0439\u043B\u043E\u0432. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435.",
  handler: rateLimitResponse,
  validate: false
});
var searchRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u0445 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443.",
  handler: rateLimitResponse,
  validate: false
});
var reportRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0436\u0430\u043B\u043E\u0431. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043F\u0435\u0440\u0435\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u043E\u0439 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439.",
  handler: rateLimitResponse,
  validate: false
});
var changePasswordRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u043F\u043E\u043F\u044B\u0442\u043E\u043A \u0441\u043C\u0435\u043D\u044B \u043F\u0430\u0440\u043E\u043B\u044F. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043C\u0438\u043D\u0443\u0442\u0443.",
  handler: rateLimitResponse,
  validate: false
});
var pushRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432 \u043D\u0430 \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0443. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443.",
  handler: rateLimitResponse,
  validate: false
});
var adminPanelHashRateLimit = rateLimit({
  windowMs: 60 * 1e3,
  // 1 минута
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  skip: isAdmin,
  message: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u043F\u043E\u043F\u044B\u0442\u043E\u043A \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0445\u0435\u0448\u0430 \u0430\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u0438. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043C\u0438\u043D\u0443\u0442\u0443.",
  handler: rateLimitResponse,
  validate: false
});

// server/index.ts
init_config();

// server/middleware/auth.ts
var PUBLIC_API_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/smtp-status",
  "/auth/verify-admin-token",
  "/qr/generate",
  "/qr/status",
  "/push/vapid-key",
  "/gifs/search",
  "/themes/share",
  "/media/",
  "/media-sign/",
  "/music/",
  "/admin/"
];

// server/routes/auth.ts
init_logger();
import { randomUUID as randomUUID2, randomInt } from "crypto";
init_auth2();
init_auth();
init_sessions();

// src/middleware/validate.ts
import { z } from "zod";
var RegisterSchema = z.object({
  email: z.string().min(1, "Email \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D").email("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 email"),
  password: z.string().min(1, "\u041F\u0430\u0440\u043E\u043B\u044C \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D").regex(/[0-9]/, "\u041F\u0430\u0440\u043E\u043B\u044C \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u043E\u0434\u043D\u0443 \u0446\u0438\u0444\u0440\u0443"),
  username: z.string().min(3, "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 3 \u0441\u0438\u043C\u0432\u043E\u043B\u0430").max(30, "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 30 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").regex(
    /^[a-zA-Z0-9_]+$/,
    "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043B\u0430\u0442\u0438\u043D\u0441\u043A\u0438\u0435 \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B \u0438 \u043F\u043E\u0434\u0447\u0451\u0440\u043A\u0438\u0432\u0430\u043D\u0438\u0435"
  ),
  displayName: z.string().min(2, "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u043E\u0435 \u0438\u043C\u044F \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 2 \u0441\u0438\u043C\u0432\u043E\u043B\u0430").max(50, "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u043E\u0435 \u0438\u043C\u044F \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 50 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").optional(),
  photoURL: z.string().optional()
});
var LoginSchema = z.object({
  email: z.string().min(1, "Email \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D").email("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 email"),
  password: z.string().min(1, "\u041F\u0430\u0440\u043E\u043B\u044C \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D")
});
var MessageSchema = z.object({
  text: z.string().max(5e3, "\u0422\u0435\u043A\u0441\u0442 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043D\u0435 \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 5000 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").optional(),
  fileUrl: z.string().min(1, "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 URL \u0444\u0430\u0439\u043B\u0430").optional(),
  fileName: z.string().max(255, "\u0418\u043C\u044F \u0444\u0430\u0439\u043B\u0430 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0434\u043B\u0438\u043D\u043D\u043E\u0435").optional(),
  fileType: z.string().max(100).optional(),
  type: z.enum(["text", "image", "video", "voice", "file", "sticker", "video_note"]).default("text"),
  duration: z.number().min(0).optional(),
  replyTo: z.string().optional()
}).refine(
  (data) => data.text && data.text.trim().length > 0 || data.fileUrl,
  { message: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0442\u0435\u043A\u0441\u0442 \u0438\u043B\u0438 \u0444\u0430\u0439\u043B" }
);
var EditMessageSchema = z.object({
  text: z.string().min(1, "\u0422\u0435\u043A\u0441\u0442 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C").max(5e3, "\u0422\u0435\u043A\u0441\u0442 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043D\u0435 \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 5000 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432")
});
var ChatSchema = z.object({
  name: z.string().max(100, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0447\u0430\u0442\u0430 \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 100 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").optional(),
  type: z.enum(["private", "group", "channel", "public"]),
  participants: z.array(z.string()).optional(),
  members: z.array(z.string()).optional(),
  description: z.string().max(500, "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 500 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").optional(),
  avatar: z.string().optional(),
  chatUid: z.string().optional(),
  creatorId: z.string().optional(),
  username: z.string().min(5, "Username \u0447\u0430\u0442\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 5 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").max(32, "Username \u0447\u0430\u0442\u0430 \u043D\u0435 \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 32 \u0441\u0438\u043C\u0432\u043E\u043B\u0430").regex(/^[a-zA-Z0-9_]+$/, "Username \u0447\u0430\u0442\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043B\u0430\u0442\u0438\u043D\u0441\u043A\u0438\u0435 \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B \u0438 \u043F\u043E\u0434\u0447\u0451\u0440\u043A\u0438\u0432\u0430\u043D\u0438\u0435").optional().nullable()
});
var ChatUpdateSchema = z.object({
  name: z.string().min(1).max(100, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0447\u0430\u0442\u0430 \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 100 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").optional(),
  description: z.string().max(500, "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 500 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").optional(),
  avatar: z.string().optional(),
  type: z.enum(["private", "group", "channel", "public"]).optional(),
  participants: z.array(z.string()).optional(),
  members: z.array(z.string()).optional(),
  admins: z.array(z.string()).optional(),
  bannedUsers: z.array(z.string()).optional(),
  mutedBy: z.array(z.string()).optional(),
  pinnedMessageUid: z.string().nullable().optional(),
  typing: z.record(z.string(), z.boolean()).optional(),
  lastMessage: z.any().optional(),
  linkedChatId: z.union([z.number(), z.string(), z.null()]).optional(),
  slowMode: z.number().optional(),
  adminPerms: z.record(z.string(), z.any()).optional(),
  username: z.string().min(5, "Username \u0447\u0430\u0442\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 5 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").max(32, "Username \u0447\u0430\u0442\u0430 \u043D\u0435 \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 32 \u0441\u0438\u043C\u0432\u043E\u043B\u0430").regex(/^[a-zA-Z0-9_]+$/, "Username \u0447\u0430\u0442\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043B\u0430\u0442\u0438\u043D\u0441\u043A\u0438\u0435 \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B \u0438 \u043F\u043E\u0434\u0447\u0451\u0440\u043A\u0438\u0432\u0430\u043D\u0438\u0435").optional().nullable()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u043F\u0435\u0440\u0435\u0434\u0430\u0442\u044C \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u043D\u043E \u043F\u043E\u043B\u0435 \u0434\u043B\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F" }
);
var ReactionSchema = z.object({
  emoji: z.string().min(1, "\u042D\u043C\u043E\u0434\u0437\u0438 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D").refine(
    (val) => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        const segments = [...segmenter.segment(val)];
        if (segments.length !== 1) return false;
        return /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(segments[0].segment);
      }
      return val.length <= 8 && /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(val);
    },
    { message: "\u0414\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u0440\u043E\u0432\u043D\u043E \u043E\u0434\u0438\u043D Unicode emoji" }
  )
});
var ProfileUpdateSchema = z.object({
  displayName: z.string().min(2, "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u043E\u0435 \u0438\u043C\u044F \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 2 \u0441\u0438\u043C\u0432\u043E\u043B\u0430").max(50, "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u043E\u0435 \u0438\u043C\u044F \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 50 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").optional(),
  photoURL: z.string().optional().nullable(),
  status: z.string().max(200, "\u0421\u0442\u0430\u0442\u0443\u0441 \u043D\u0435 \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 200 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432").optional(),
  email: z.string().email("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 email").optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u043F\u0435\u0440\u0435\u0434\u0430\u0442\u044C \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u043D\u043E \u043F\u043E\u043B\u0435 \u0434\u043B\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F" }
);
var ReportSchema = z.object({
  messageId: z.union([z.string(), z.number()]).optional(),
  msgUid: z.string().optional(),
  reason: z.string().min(1, "\u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u0436\u0430\u043B\u043E\u0431\u044B \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u0430").max(500, "\u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u0436\u0430\u043B\u043E\u0431\u044B \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u0430 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 500 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432")
});
var UserReportSchema = z.object({
  targetUid: z.string().min(1, "ID \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D"),
  reason: z.string().min(1, "\u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u0436\u0430\u043B\u043E\u0431\u044B \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u0430").max(500, "\u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u0436\u0430\u043B\u043E\u0431\u044B \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u0430 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 500 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"),
  description: z.string().max(2e3, "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0434\u043B\u0438\u043D\u043D\u043E\u0435").optional()
});
var BlockSchema = z.object({
  blockedUid: z.string().min(1, "ID \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D")
});
var PushSubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 endpoint \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438"),
    keys: z.object({
      p256dh: z.string().min(1, "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u043A\u043B\u044E\u0447 p256dh"),
      auth: z.string().min(1, "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u043A\u043B\u044E\u0447 auth")
    }).optional()
  }).optional(),
  userAgent: z.string().optional()
}).refine(
  (data) => data.subscription && data.subscription.endpoint,
  { message: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B" }
);
var PushUnsubscribeSchema = z.object({
  endpoint: z.string().url("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 endpoint \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438")
});
var PushValidateSchema = z.object({
  endpoint: z.string().url("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 endpoint \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438")
});
var CommentSchema = z.object({
  text: z.string().min(1, "\u0422\u0435\u043A\u0441\u0442 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u044F \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C").max(2e3, "\u0422\u0435\u043A\u0441\u0442 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u044F \u043D\u0435 \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0442\u044C 2000 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"),
  chatId: z.union([z.string(), z.number()]).optional()
});
var UserSyncSchema = z.object({
  displayName: z.string().max(50).optional(),
  photoURL: z.string().optional(),
  email: z.string().email().optional(),
  status: z.string().max(200).optional(),
  bio: z.string().max(500).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  phoneNumber: z.string().max(20).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u043F\u0435\u0440\u0435\u0434\u0430\u0442\u044C \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u043D\u043E \u043F\u043E\u043B\u0435" }
);
var PrivacySettingsSchema = z.object({
  privacySettings: z.object({
    online_status: z.enum(["everyone", "contacts", "nobody"]),
    bio: z.enum(["everyone", "contacts", "nobody"]),
    avatar: z.enum(["everyone", "contacts", "nobody"]),
    username: z.enum(["everyone", "contacts", "nobody"]),
    messages: z.enum(["everyone", "contacts", "nobody"])
  })
});
var ContactSchema = z.object({
  contactUid: z.string().min(1, "ID \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0430 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D"),
  alias: z.string().max(50).optional()
});
var UserRoleSchema = z.object({
  role: z.enum(["user", "admin", "banned"])
});
var MessageFlagSchema = z.object({
  flag: z.string().max(100).nullable().optional()
});
var AdminPermissionsSchema = z.object({
  userUid: z.string().min(1, "ID \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D"),
  canEditInfo: z.boolean().optional(),
  canEditAvatar: z.boolean().optional(),
  canDeleteMessages: z.boolean().optional(),
  canRemoveMembers: z.boolean().optional(),
  canInviteMembers: z.boolean().optional(),
  canManageAdmins: z.boolean().optional(),
  canEditUsername: z.boolean().optional(),
  canManageInvites: z.boolean().optional(),
  canPinMessages: z.boolean().optional()
});
var CreateInviteLinkSchema = z.object({});
var ThemeShareSchema = z.object({
  themeData: z.object({
    id: z.string().min(1),
    name: z.string().min(1)
  }).passthrough(),
  creatorUsername: z.string().max(50).optional()
});
var QrScanSchema = z.object({
  token: z.string().min(1, "\u0422\u043E\u043A\u0435\u043D \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D"),
  deviceInfo: z.string().max(200).optional()
});
var QrConfirmSchema = z.object({
  token: z.string().min(1, "\u0422\u043E\u043A\u0435\u043D \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D"),
  approved: z.boolean()
});
var CallSignalSchema = z.object({
  toUid: z.string().min(1, "ID \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D"),
  type: z.enum(["offer", "answer", "candidate", "decline", "end"]).optional(),
  isVideo: z.boolean().optional(),
  data: z.any().optional(),
  fromName: z.string().max(100).optional(),
  fromAvatar: z.string().optional()
});
var PinMessageSchema = z.object({
  messageUid: z.string().min(1, "ID \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D")
});
var PinsReorderSchema = z.object({
  pins: z.array(z.object({
    id: z.number(),
    sortOrder: z.number()
  }))
});
var SessionRevokeSchema = z.object({
  // body пустой — параметры в URL
});
var AdminRoleParamsSchema = z.object({
  uid: z.string().min(1, "ID \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D")
});
function validate(schema, target = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const path7 = issue.path.join(".");
        return path7 ? `${path7}: ${issue.message}` : issue.message;
      });
      return res.status(400).json({
        error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u0438 \u0434\u0430\u043D\u043D\u044B\u0445",
        details: errors
      });
    }
    req[target] = result.data;
    next();
  };
}

// server/routes/auth.ts
init_jwtAuth();

// server/services/mail.ts
init_logger();
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  // STARTTLS на порту 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
function isSmtpConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}
async function sendOtpEmail(to, code, purpose = "recovery") {
  if (!isSmtpConfigured()) {
    logger.warn("[MAIL] SMTP not configured \u2014 cannot send email");
    return false;
  }
  const subject = purpose === "recovery" ? "QWERcrool \u2014 \u041A\u043E\u0434 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u0430\u0440\u043E\u043B\u044F" : "QWERcrool \u2014 \u041A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F";
  const html = purpose === "recovery" ? `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#6C5CE7;">QWERcrool</h2>
          <p>\u0412\u044B \u0437\u0430\u043F\u0440\u043E\u0441\u0438\u043B\u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F.</p>
          <div style="background:#f5f5f5;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <p style="font-size:14px;color:#666;margin:0 0 8px;">\u0412\u0430\u0448 \u043A\u043E\u0434:</p>
            <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#333;margin:0;">${code}</p>
          </div>
          <p style="font-size:13px;color:#999;">\u041A\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u0435\u043D \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 10 \u043C\u0438\u043D\u0443\u0442.<br/>\u0415\u0441\u043B\u0438 \u0432\u044B \u043D\u0435 \u0437\u0430\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u043B\u0438 \u0441\u0431\u0440\u043E\u0441 \u043F\u0430\u0440\u043E\u043B\u044F \u2014 \u043F\u0440\u043E\u0441\u0442\u043E \u043F\u0440\u043E\u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u044D\u0442\u043E \u043F\u0438\u0441\u044C\u043C\u043E.</p>
        </div>
      ` : `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#6C5CE7;">QWERcrool</h2>
          <p>\u041A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u0432\u0430\u0448\u0435\u0439 \u043F\u043E\u0447\u0442\u044B:</p>
          <div style="background:#f5f5f5;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#333;margin:0;">${code}</p>
          </div>
          <p style="font-size:13px;color:#999;">\u041A\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u0435\u043D \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 10 \u043C\u0438\u043D\u0443\u0442.</p>
        </div>
      `;
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    });
    logger.info({ to, messageId: info.messageId }, "[MAIL] Email sent");
    return true;
  } catch (err) {
    logger.error({ err, to }, "[MAIL] Failed to send email");
    return false;
  }
}

// server/routes/auth.ts
function setRefreshTokenCookie(res, token) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 3 * 24 * 60 * 60 * 1e3
    // 3 дня
  });
}
function clearRefreshTokenCookie(res) {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });
}
async function setupAuthRoutes(app) {
  const { setCsrfCookie: setCsrfCookie2 } = await Promise.resolve().then(() => (init_csrf(), csrf_exports));
  app.get("/api/csrf-token", (req, res) => {
    const log2 = ctx(req);
    try {
      const csrfToken = setCsrfCookie2(res);
      res.json({ csrfToken });
    } catch (err) {
      log2.error({ err }, "[CSRF] Token generation error");
      res.status(500).json({ error: "Failed to generate CSRF token" });
    }
  });
  app.post("/api/auth/register", registerRateLimit, validate(RegisterSchema), async (req, res) => {
    const log2 = ctx(req);
    try {
      const { email, password, username, displayName, photoURL } = req.body;
      const existingEmailUser = await getUserByEmail(email);
      if (existingEmailUser) {
        return res.status(409).json({ error: "Email already exists." });
      }
      const existingUsernameUser = await getUserByUsername(username);
      if (existingUsernameUser) {
        return res.status(409).json({ error: "Username already exists." });
      }
      const uid = randomUUID2();
      const createdUser = await createUserWithPassword({
        uid,
        email,
        password,
        username,
        displayName,
        photoURL,
        status: "online"
      });
      const userAgent = req.headers["user-agent"] || null;
      const ip = req.ip || req.socket?.remoteAddress || null;
      const { sessionUid } = await createSession({ userUid: uid, userAgent, ipAddress: ip });
      const token = signJwt(createdUser, sessionUid);
      const refreshToken = signRefreshJwt(createdUser, sessionUid);
      setRefreshTokenCookie(res, refreshToken);
      res.json({ token, user: createdUser });
    } catch (err) {
      log2.error({ err }, "Register error");
      res.status(500).json({ error: err.message || "Registration failed." });
    }
  });
  app.post("/api/auth/login", loginRateLimit, validate(LoginSchema), async (req, res) => {
    const log2 = ctx(req);
    try {
      const { email, password } = req.body;
      log2.info({ email }, "[LOGIN] Attempt");
      const userByEmail = await getUserByEmail(email);
      if (!userByEmail) {
        log2.warn({ email }, "[LOGIN] User NOT found by email");
        return res.status(401).json({ error: "Invalid credentials." });
      }
      log2.debug({ email, hasPassword: !!userByEmail.passwordHash }, "[LOGIN] User found by email");
      const user = await verifyUserPassword(email, password);
      log2.debug({ email, verified: !!user }, "[LOGIN] verifyUserPassword result");
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      const userAgent = req.headers["user-agent"] || null;
      const ip = req.ip || req.socket?.remoteAddress || null;
      const { sessionUid } = await createSession({ userUid: user.uid, userAgent, ipAddress: ip });
      const token = signJwt(user, sessionUid);
      const refreshToken = signRefreshJwt(user, sessionUid);
      log2.info({ email }, "[LOGIN] Success");
      setRefreshTokenCookie(res, refreshToken);
      res.json({ token, user });
    } catch (err) {
      log2.error({ err }, "Login error");
      res.status(500).json({ error: err.message || "Login failed." });
    }
  });
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const log2 = ctx(req);
    try {
      const user = await getUserByUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      res.json(user);
    } catch (err) {
      log2.error({ err }, "Auth me error");
      res.status(500).json({ error: err.message || "Failed to fetch authenticated user." });
    }
  });
  app.post("/api/auth/refresh", async (req, res) => {
    const log2 = ctx(req);
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token is required." });
      }
      let decoded;
      try {
        decoded = verifyRefreshJwt(refreshToken);
      } catch {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ error: "Invalid or expired refresh token." });
      }
      if (decoded.type !== "refresh") {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ error: "Invalid token type." });
      }
      if (decoded.sessionUid) {
        const { isSessionActive: checkSession, revokeSession: revokeOldSession } = await Promise.resolve().then(() => (init_sessions(), sessions_exports));
        const active = await checkSession(decoded.sessionUid);
        if (!active) {
          clearRefreshTokenCookie(res);
          return res.status(401).json({ error: "Session revoked." });
        }
        await revokeOldSession(decoded.sessionUid, decoded.uid);
      }
      const user = await getUserByUid(decoded.uid);
      if (!user) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ error: "User not found." });
      }
      const { sessionUid: newSessionUid } = await createSession({
        userUid: decoded.uid,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket?.remoteAddress || null
      });
      const newToken = signJwt(user, newSessionUid);
      const newRefreshToken = signRefreshJwt(user, newSessionUid);
      setRefreshTokenCookie(res, newRefreshToken);
      res.json({ token: newToken });
    } catch (err) {
      log2.error({ err }, "Refresh token error");
      res.status(500).json({ error: err.message || "Token refresh failed." });
    }
  });
  app.put("/api/auth/password", requireAuth, changePasswordRateLimit, async (req, res) => {
    const log2 = ctx(req);
    try {
      const uid = req.user.uid;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "currentPassword and newPassword are required." });
      }
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters." });
      }
      const { getUserByEmail: getFullUserByEmail } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const { verifyUserPassword: verifyUserPassword2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const bcrypt2 = (await import("bcryptjs")).default;
      const result = await db2.select().from(users3).where(eq11(users3.uid, uid)).limit(1);
      const row2 = result[0];
      if (!row2) {
        return res.status(404).json({ error: "User not found." });
      }
      const currentHash = row2.passwordHash;
      if (!currentHash) {
        return res.status(400).json({ error: "Account does not have a password set (social login)." });
      }
      const isValid = await bcrypt2.compare(currentPassword, currentHash);
      if (!isValid) {
        log2.warn({ uid }, "[PASSWORD] Incorrect current password");
        return res.status(401).json({ error: "Current password is incorrect." });
      }
      const newHash = await bcrypt2.hash(newPassword, 10);
      await db2.update(users3).set({ passwordHash: newHash }).where(eq11(users3.uid, uid));
      log2.info({ uid }, "[PASSWORD] Password changed successfully");
      res.json({ success: true });
    } catch (err) {
      log2.error({ err }, "Change password error");
      res.status(500).json({ error: err.message || "Failed to change password." });
    }
  });
  app.post("/api/auth/forgot-password", loginRateLimit, async (req, res) => {
    const log2 = ctx(req);
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required." });
      }
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eqFn, sql: sql5 } = await import("drizzle-orm");
      const rows = await dbConn.select({ uid: users3.uid, email: users3.email }).from(users3).where(eqFn(users3.recoveryEmail, email)).limit(1);
      if (!rows.length) {
        return res.json({ success: true, message: "If the email exists, an OTP code has been sent." });
      }
      const userUid = rows[0].uid;
      const recoveryEmail = email;
      const code = String(randomInt(1e5, 999999));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      const expiresAtUtc = expiresAt.toISOString();
      await dbConn.execute(sql5`DELETE FROM otp_codes WHERE user_uid = ${userUid} AND purpose = 'recovery' AND used = false`);
      await dbConn.execute(sql5`
        INSERT INTO otp_codes (user_uid, email, code, purpose, attempts, expires_at, used)
        VALUES (${userUid}, ${recoveryEmail}, ${code}, 'recovery', 0, ${expiresAtUtc}::timestamp, false)
      `);
      const sent = await sendOtpEmail(recoveryEmail, code, "recovery");
      if (!sent) {
        log2.error({ uid: userUid }, "[FORGOT-PASSWORD] Failed to send OTP email");
        return res.status(500).json({ error: "Failed to send OTP email. Please try again later." });
      }
      log2.info({ uid: userUid, email: recoveryEmail }, "[FORGOT-PASSWORD] OTP sent");
      res.json({ success: true, message: "If the email exists, an OTP code has been sent." });
    } catch (err) {
      log2.error({ err }, "Forgot password error");
      res.status(500).json({ error: err.message || "Failed to process request." });
    }
  });
  app.post("/api/auth/verify-otp", loginRateLimit, async (req, res) => {
    const log2 = ctx(req);
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: "email, code, and newPassword are required." });
      }
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters." });
      }
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { otpCodes: otpCodes2, users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { sql: sql5, eq: eqFn } = await import("drizzle-orm");
      const bcrypt2 = (await import("bcryptjs")).default;
      const userRows = await dbConn.select({ uid: users3.uid }).from(users3).where(eqFn(users3.recoveryEmail, email)).limit(1);
      if (!userRows.length) {
        return res.status(400).json({ error: "Invalid or expired OTP code." });
      }
      const userUid = userRows[0].uid;
      const otpRows = await dbConn.execute(sql5`
        SELECT * FROM otp_codes
        WHERE user_uid = ${userUid} AND purpose = 'recovery' AND used = false
        ORDER BY created_at DESC LIMIT 1
      `);
      const rows = otpRows?.rows || [];
      if (!rows.length) {
        return res.status(400).json({ error: "No OTP code found. Please request a new one." });
      }
      const otpRow = rows[0];
      const expiresAtStr = String(otpRow.expires_at);
      const expiresAtDate = new Date(expiresAtStr.endsWith("Z") ? expiresAtStr : expiresAtStr + "Z");
      if (expiresAtDate < /* @__PURE__ */ new Date()) {
        await dbConn.execute(sql5`UPDATE otp_codes SET used = true WHERE id = ${otpRow.id}`);
        return res.status(400).json({ error: "OTP code has expired. Please request a new one." });
      }
      if ((otpRow.attempts || 0) >= 5) {
        await dbConn.execute(sql5`UPDATE otp_codes SET used = true WHERE id = ${otpRow.id}`);
        return res.status(400).json({ error: "Too many attempts. Please request a new OTP code." });
      }
      if (otpRow.code !== code) {
        await dbConn.execute(sql5`UPDATE otp_codes SET attempts = (attempts + 1) WHERE id = ${otpRow.id}`);
        log2.warn({ uid: userUid }, "[VERIFY-OTP] Incorrect code");
        return res.status(400).json({ error: "Incorrect OTP code." });
      }
      const newHash = await bcrypt2.hash(newPassword, 10);
      await dbConn.update(users3).set({ passwordHash: newHash }).where(eqFn(users3.uid, userUid));
      await dbConn.execute(sql5`UPDATE otp_codes SET used = true WHERE id = ${otpRow.id}`);
      const userAccountRows = await dbConn.select({ email: users3.email }).from(users3).where(eqFn(users3.uid, userUid)).limit(1);
      const accountEmail = userAccountRows[0]?.email || null;
      log2.info({ uid: userUid }, "[VERIFY-OTP] Password reset successfully");
      res.json({ success: true, message: "Password has been reset.", accountEmail });
    } catch (err) {
      log2.error({ err }, "Verify OTP error");
      res.status(500).json({ error: err.message || "Failed to verify OTP." });
    }
  });
  app.get("/api/auth/recovery-email", requireAuth, async (req, res) => {
    const log2 = ctx(req);
    try {
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eqFn } = await import("drizzle-orm");
      const uid = req.user.uid;
      const rows = await dbConn.select({ recoveryEmail: users3.recoveryEmail }).from(users3).where(eqFn(users3.uid, uid)).limit(1);
      const email = rows[0]?.recoveryEmail || null;
      res.json({ email });
    } catch (err) {
      log2.error({ err }, "Get recovery email error");
      res.status(500).json({ error: err.message || "Failed to get recovery email." });
    }
  });
  app.post("/api/auth/recovery-email", requireAuth, loginRateLimit, async (req, res) => {
    const log2 = ctx(req);
    try {
      const { email } = req.body;
      const uid = req.user.uid;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required." });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { otpCodes: otpCodes2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { sql: sql5 } = await import("drizzle-orm");
      const code = String(randomInt(1e5, 999999));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      const expiresAtUtc = expiresAt.toISOString();
      await dbConn.execute(sql5`DELETE FROM otp_codes WHERE user_uid = ${uid} AND purpose = 'verify' AND used = false`);
      await dbConn.execute(sql5`
        INSERT INTO otp_codes (user_uid, email, code, purpose, attempts, expires_at, used)
        VALUES (${uid}, ${email}, ${code}, 'verify', 0, ${expiresAtUtc}::timestamp, false)
      `);
      const sent = await sendOtpEmail(email, code, "verify");
      if (!sent) {
        log2.error({ uid }, "[RECOVERY-EMAIL] Failed to send verification email");
        return res.status(500).json({ error: "Failed to send verification email." });
      }
      log2.info({ uid, email }, "[RECOVERY-EMAIL] Verification OTP sent");
      res.json({ success: true, message: "OTP code sent to the new email." });
    } catch (err) {
      log2.error({ err }, "Set recovery email error");
      res.status(500).json({ error: err.message || "Failed to send verification email." });
    }
  });
  app.post("/api/auth/confirm-recovery-email", requireAuth, loginRateLimit, async (req, res) => {
    const log2 = ctx(req);
    try {
      const { email, code } = req.body;
      const uid = req.user.uid;
      if (!email || !code) {
        return res.status(400).json({ error: "email and code are required." });
      }
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { otpCodes: otpCodes2, users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { sql: sql5, eq: eqFn } = await import("drizzle-orm");
      const otpRows = await dbConn.execute(sql5`
        SELECT * FROM otp_codes
        WHERE user_uid = ${uid} AND email = ${email} AND purpose = 'verify' AND used = false
        ORDER BY created_at DESC LIMIT 1
      `);
      const rows = otpRows?.rows || [];
      if (!rows.length) {
        return res.status(400).json({ error: "No OTP code found. Please request a new one." });
      }
      const otpRow = rows[0];
      const expiresAtStr2 = String(otpRow.expires_at);
      const expiresAtDate2 = new Date(expiresAtStr2.endsWith("Z") ? expiresAtStr2 : expiresAtStr2 + "Z");
      if (expiresAtDate2 < /* @__PURE__ */ new Date()) {
        await dbConn.execute(sql5`UPDATE otp_codes SET used = true WHERE id = ${otpRow.id}`);
        return res.status(400).json({ error: "OTP code has expired." });
      }
      if ((otpRow.attempts || 0) >= 5) {
        await dbConn.execute(sql5`UPDATE otp_codes SET used = true WHERE id = ${otpRow.id}`);
        return res.status(400).json({ error: "Too many attempts. Please request a new code." });
      }
      if (otpRow.code !== code) {
        await dbConn.execute(sql5`UPDATE otp_codes SET attempts = (attempts + 1) WHERE id = ${otpRow.id}`);
        return res.status(400).json({ error: "Incorrect OTP code." });
      }
      await dbConn.update(users3).set({ recoveryEmail: email }).where(eqFn(users3.uid, uid));
      await dbConn.execute(sql5`UPDATE otp_codes SET used = true WHERE id = ${otpRow.id}`);
      log2.info({ uid, email }, "[CONFIRM-RECOVERY-EMAIL] Email verified and saved");
      res.json({ success: true, email });
    } catch (err) {
      log2.error({ err }, "Confirm recovery email error");
      res.status(500).json({ error: err.message || "Failed to confirm email." });
    }
  });
  app.delete("/api/auth/recovery-email", requireAuth, async (req, res) => {
    const log2 = ctx(req);
    try {
      const uid = req.user.uid;
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eqFn } = await import("drizzle-orm");
      await dbConn.update(users3).set({ recoveryEmail: null }).where(eqFn(users3.uid, uid));
      log2.info({ uid }, "[RECOVERY-EMAIL] Email unlinked");
      res.json({ success: true });
    } catch (err) {
      log2.error({ err }, "Remove recovery email error");
      res.status(500).json({ error: err.message || "Failed to remove recovery email." });
    }
  });
  app.get("/api/auth/smtp-status", (_req, res) => {
    res.json({ configured: isSmtpConfigured() });
  });
  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const sessionUid = req.user.sessionUid;
      if (sessionUid) {
        const { revokeSession: revokeSession3 } = await Promise.resolve().then(() => (init_sessions(), sessions_exports));
        await revokeSession3(sessionUid, uid);
        try {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn) {
            broadcastFn([uid], { type: "session_revoked", sessionUid });
          }
        } catch {
        }
      }
      clearRefreshTokenCookie(res);
      res.json({ success: true });
    } catch (err) {
      log.error({ err }, "Logout error");
      res.status(500).json({ error: err.message || "Logout failed." });
    }
  });
}

// server/routes/users.ts
init_jwtAuth();
init_helpers();
init_logger();
function setupUserRoutes(app) {
  app.post("/api/users/sync", requireAuth, validate(UserSyncSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const data = req.body;
      const user = await syncUser(uid, data);
      res.json(user);
    } catch (err) {
      logger.error({ err }, "Sync user error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const requesterUid = req.user.uid;
      const usersList = await getUsers();
      const sanitized = usersList.map((u) => {
        if (u.uid === requesterUid || req.user?.role === "admin") return u;
        const { email, recoveryEmail, phoneNumber, passwordHash, ...publicData } = u;
        return publicData;
      });
      res.json(sanitized);
    } catch (err) {
      logger.error({ err }, "Get users error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/users/:uid", requireAuth, async (req, res) => {
    try {
      logger.info(`[GET USER] uid: ${req.params.uid}`);
      const user = await getUser(req.params.uid);
      if (!user) {
        logger.info(`[GET USER] \u274C User not found: ${req.params.uid}`);
        return res.status(404).json({ error: "User not found" });
      }
      logger.info(`[GET USER] \u2705 Found user: ${user.displayName}`);
      const requesterUid = req.user.uid;
      const targetUid = req.params.uid;
      const { getBlockDirection: getBlockDirection2 } = await Promise.resolve().then(() => (init_admin(), admin_exports));
      const blockDir = await getBlockDirection2(requesterUid, targetUid);
      const safeUser = { ...user };
      if (blockDir === "by_me") {
        safeUser._blockedByMe = true;
      } else if (blockDir === "by_them" || blockDir === "both") {
        safeUser.photoURL = null;
        safeUser.lastSeen = null;
        safeUser._blockedMe = true;
      }
      if (requesterUid !== targetUid && !safeUser._blockedByMe) {
        const privacy = user.privacySettings || {
          online_status: "everyone",
          bio: "everyone",
          avatar: "everyone",
          username: "everyone",
          messages: "everyone"
        };
        const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { userContacts: userContacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq11, and: and8 } = await import("drizzle-orm");
        const contactCheck = await db2.select().from(userContacts2).where(and8(eq11(userContacts2.ownerUid, targetUid), eq11(userContacts2.contactUid, requesterUid))).limit(1);
        const isContact = contactCheck.length > 0;
        if (privacy.online_status === "nobody" || privacy.online_status === "contacts" && !isContact) {
          safeUser.status = "offline";
          safeUser.lastSeen = null;
          safeUser._onlineHidden = true;
        }
        if (privacy.avatar === "nobody" || privacy.avatar === "contacts" && !isContact) {
          safeUser.photoURL = null;
          safeUser._avatarHidden = true;
        }
        if (privacy.username === "nobody" || privacy.username === "contacts" && !isContact) {
          safeUser.username = null;
          safeUser._usernameHidden = true;
        }
        if (privacy.bio === "nobody" || privacy.bio === "contacts" && !isContact) {
          safeUser.bio = null;
          safeUser._bioHidden = true;
        }
      }
      res.json(safeUser);
    } catch (err) {
      logger.error({ err }, "Get user error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/chats/list", requireAuth, chatsRateLimit, async (req, res) => {
    try {
      const uid = req.user.uid;
      const all = req.query.all === "true";
      const { getChatsListForUser: getChatsListForUser2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chatsList = await getChatsListForUser2(uid, all);
      res.json(chatsList);
    } catch (err) {
      logger.error({ err }, "Get chats list error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/users/search", requireAuth, searchRateLimit, async (req, res) => {
    try {
      const q = (req.query.q || "").trim();
      if (q.length < 2) {
        return res.json([]);
      }
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { or: or2, ilike: ilike2 } = await import("drizzle-orm");
      const likePattern = `%${q}%`;
      const results = await db2.select({
        uid: users3.uid,
        email: users3.email,
        username: users3.username,
        displayName: users3.displayName,
        photoURL: users3.photoURL,
        status: users3.status,
        lastSeen: users3.lastSeen,
        bio: users3.bio
      }).from(users3).where(
        or2(
          ilike2(users3.username, likePattern),
          ilike2(users3.displayName, likePattern)
        )
      ).limit(20);
      res.json(results);
    } catch (err) {
      logger.error({ err }, "User search error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/user/privacy", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const result = await db2.select({ privacySettings: users3.privacySettings }).from(users3).where(eq11(users3.uid, uid)).limit(1);
      if (!result[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(result[0].privacySettings || {
        online_status: "everyone",
        bio: "everyone",
        avatar: "everyone",
        username: "everyone",
        messages: "everyone"
      });
    } catch (err) {
      logger.error({ err }, "Get privacy settings error");
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/user/privacy", requireAuth, validate(PrivacySettingsSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const result = await db2.update(users3).set({ privacySettings: req.body.privacySettings, updatedAt: /* @__PURE__ */ new Date() }).where(eq11(users3.uid, uid)).returning();
      if (!result[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(result[0].privacySettings);
    } catch (err) {
      logger.error({ err }, "Update privacy settings error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/user/contacts", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { userContacts: userContacts2, users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const contacts = await db2.select({
        id: userContacts2.id,
        contactUid: userContacts2.contactUid,
        alias: userContacts2.alias,
        createdAt: userContacts2.createdAt,
        displayName: users3.displayName,
        photoURL: users3.photoURL,
        username: users3.username,
        status: users3.status,
        lastSeen: users3.lastSeen
      }).from(userContacts2).leftJoin(users3, eq11(userContacts2.contactUid, users3.uid)).where(eq11(userContacts2.ownerUid, uid));
      res.json(contacts);
    } catch (err) {
      logger.error({ err }, "Get contacts error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/user/contacts", requireAuth, validate(ContactSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { contactUid, alias } = req.body;
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { userContacts: userContacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11, and: and8 } = await import("drizzle-orm");
      const existing = await db2.select().from(userContacts2).where(and8(eq11(userContacts2.ownerUid, uid), eq11(userContacts2.contactUid, contactUid))).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ error: "Contact already exists" });
      }
      const result = await db2.insert(userContacts2).values({ ownerUid: uid, contactUid, alias: alias || null }).returning();
      res.json(result[0]);
    } catch (err) {
      logger.error({ err }, "Add contact error");
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/user/contacts/:contactUid", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { contactUid } = req.params;
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { userContacts: userContacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11, and: and8 } = await import("drizzle-orm");
      await db2.delete(userContacts2).where(and8(eq11(userContacts2.ownerUid, uid), eq11(userContacts2.contactUid, contactUid)));
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Delete contact error");
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/user/contacts/:contactUid", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { contactUid } = req.params;
      const { alias } = req.body;
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { userContacts: userContacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11, and: and8 } = await import("drizzle-orm");
      const result = await db2.update(userContacts2).set({ alias: alias || null }).where(and8(eq11(userContacts2.ownerUid, uid), eq11(userContacts2.contactUid, contactUid))).returning();
      res.json(result[0] || { success: true });
    } catch (err) {
      logger.error({ err }, "Update contact error");
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/user/delete-all-data", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const result = await deleteUserCompletely(uid);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/chats-crud.ts
init_jwtAuth();
init_helpers();
init_logger();
await init_invite_store();
function setupChatCrudRoutes(app) {
  app.get("/api/chats", requireAuth, chatsRateLimit, async (req, res) => {
    try {
      const uid = req.user.uid;
      const all = req.query.all === "true";
      const userChats = await getChatsForUser(uid, all);
      try {
        const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { sql: drizzleSql } = await import("drizzle-orm");
        const userResult = await dbConn.execute(drizzleSql`SELECT id FROM users WHERE uid = ${uid}`);
        const userId = userResult?.rows?.[0]?.id;
        if (userId) {
          const unreadResult = await dbConn.execute(drizzleSql`
            SELECT chat_id, COUNT(*)::int as unread_count
            FROM messages m
            LEFT JOIN message_statuses ms ON ms.message_id = m.id AND ms.user_id = ${userId}
            WHERE m.sender_id != ${userId}
              AND ms.id IS NULL
            GROUP BY chat_id
          `);
          const unreadMap = /* @__PURE__ */ new Map();
          for (const row2 of unreadResult?.rows || []) {
            unreadMap.set(Number(row2.chat_id), Number(row2.unread_count));
          }
          for (const chat of userChats) {
            chat.unreadCount = unreadMap.get(chat.idNumeric || 0) || 0;
          }
        }
      } catch (unreadErr) {
        logger.warn({ err: unreadErr }, "Failed to fetch unread counts (non-fatal)");
      }
      res.json(userChats);
    } catch (err) {
      logger.error({ err }, "Get chats error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats", requireAuth, validate(ChatSchema), async (req, res) => {
    try {
      const chatData = { ...req.body };
      if (chatData.id && !chatData.chatUid) {
        chatData.chatUid = chatData.id;
        delete chatData.id;
      }
      if (chatData.creatorId && typeof chatData.creatorId === "string") {
        const creator = await getUser(chatData.creatorId);
        if (creator) {
          chatData.creatorId = creator.id;
        } else {
          return res.status(404).json({ error: "Creator user not found" });
        }
      }
      if (chatData.username) {
        const cleanUsername = chatData.username.trim().toLowerCase();
        if (cleanUsername.length < 5) {
          return res.status(400).json({ error: "Username \u0447\u0430\u0442\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 5 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432" });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
          return res.status(400).json({ error: "Username \u0447\u0430\u0442\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043B\u0430\u0442\u0438\u043D\u0441\u043A\u0438\u0435 \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B \u0438 \u043F\u043E\u0434\u0447\u0451\u0440\u043A\u0438\u0432\u0430\u043D\u0438\u0435" });
        }
        const { isChatUsernameTaken: isChatUsernameTaken2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        if (await isChatUsernameTaken2(cleanUsername)) {
          return res.status(409).json({ error: "\u042D\u0442\u043E\u0442 username \u0443\u0436\u0435 \u0437\u0430\u043D\u044F\u0442. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0439." });
        }
        chatData.username = cleanUsername;
      }
      if (chatData.type === "private" && Array.isArray(chatData.participants) && chatData.participants.length === 2) {
        const existingChats = await getChatsForUser(chatData.participants[0], false);
        for (const existing of existingChats) {
          if (existing.type === "private") {
            const eps = existing.participants || [];
            if (eps.includes(chatData.participants[0]) && eps.includes(chatData.participants[1])) {
              logger.info(`[Chat] \u{1F504} Duplicate private chat detected, returning existing: ${existing.id}`);
              return res.json(existing);
            }
          }
        }
      }
      if ((chatData.type === "channel" || chatData.type === "group") && req.user?.uid) {
        if (!chatData.admins) chatData.admins = [];
        if (!chatData.admins.includes(req.user.uid)) {
          chatData.admins = [...chatData.admins, req.user.uid];
        }
      }
      const chat = await createChat(chatData);
      if (chatData.type === "channel" || chatData.type === "group") {
        const { logAdminAction: logAdminAction2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        logAdminAction2({
          chatId: chat.id,
          actorUid: req.user.uid,
          action: chatData.type === "channel" ? "channel_created" : "group_created"
        });
      }
      res.json({
        ...chat,
        id: chat.chatUid || String(chat.id),
        idNumeric: chat.id
      });
    } catch (err) {
      logger.error({ err }, "Create chat error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/update", requireAuth, validate(ChatUpdateSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      logger.info(`[UPDATE CHAT] chatId: ${chatId}, type: ${typeof chatId}, body:`, req.body);
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const currentChat = await getChat2(chatId);
      const sensitiveFields = ["avatar", "name", "description", "admins", "bannedUsers", "mutedBy", "username"];
      const isGroupOrChannel = currentChat && (currentChat.type === "group" || currentChat.type === "channel");
      const hasSensitiveUpdate = Object.keys(req.body).some((key) => sensitiveFields.includes(key));
      const isPinningInGroup = isGroupOrChannel && req.body.pinnedMessageUid !== void 0;
      if (hasSensitiveUpdate || isPinningInGroup) {
        if (currentChat) {
          const isAdmin2 = currentChat.admins?.includes(uid);
          const isCreator = currentChat.creatorId === uid || currentChat.creatorUid === uid;
          const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
          const userObj = await getUserByUid2(uid);
          const isGlobalAdmin = userObj?.role === "admin";
          if (!isAdmin2 && !isCreator && !isGlobalAdmin) {
            return res.status(403).json({ error: "Only chat administrators can modify this field" });
          }
        }
      }
      if (req.body.username !== void 0 && req.body.username !== null && req.body.username !== "") {
        const cleanUsername = String(req.body.username).trim().toLowerCase();
        if (cleanUsername.length < 5) {
          return res.status(400).json({ error: "Username \u0447\u0430\u0442\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 5 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432" });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
          return res.status(400).json({ error: "Username \u0447\u0430\u0442\u0430 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043B\u0430\u0442\u0438\u043D\u0441\u043A\u0438\u0435 \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B \u0438 \u043F\u043E\u0434\u0447\u0451\u0440\u043A\u0438\u0432\u0430\u043D\u0438\u0435" });
        }
        const { isChatUsernameTaken: isChatUsernameTaken2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        const excludeId = currentChat?.id;
        if (await isChatUsernameTaken2(cleanUsername, excludeId)) {
          return res.status(409).json({ error: "\u042D\u0442\u043E\u0442 username \u0443\u0436\u0435 \u0437\u0430\u043D\u044F\u0442. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0439." });
        }
        req.body.username = cleanUsername;
      }
      const chat = await updateChat(chatId, req.body);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      if (isGroupOrChannel) {
        const { logAdminAction: logAdminAction2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        const loggableActions = {
          name: "name_changed",
          description: "description_changed",
          avatar: "avatar_changed",
          admins: "admins_changed",
          username: "username_changed"
        };
        for (const key of Object.keys(req.body)) {
          if (loggableActions[key]) {
            logAdminAction2({
              chatId: chat.id,
              actorUid: uid,
              action: loggableActions[key],
              details: { field: key }
            });
          }
        }
      }
      res.json(chat);
    } catch (err) {
      logger.error({ err }, "Update chat error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/invite", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      if (chat.type !== "group" && chat.type !== "channel") {
        return res.status(400).json({ error: "Invite links are only for groups and channels" });
      }
      const isAdmin2 = chat.admins?.includes(uid);
      const isCreator = chat.creatorId === uid || chat.creatorUid === uid;
      if (!isAdmin2 && !isCreator) {
        return res.status(403).json({ error: "Only admins can generate invite links" });
      }
      const token = generateInviteToken();
      await setInviteToken(token, chatId);
      const host2 = req.get("host") || "localhost:4080";
      const proto = req.protocol || "http";
      const link = `${proto}://${host2}/chat?token=${token}`;
      res.json({ token, link });
    } catch (err) {
      logger.error({ err }, "Generate invite error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/join/:token", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      const chatId = await getInviteChatId(token);
      if (!chatId) {
        return res.status(404).json({ error: "Invalid or expired invite token" });
      }
      const { getChat: getChat2, updateChat: updateChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const participants = chat.participants || [];
      const members = chat.members || [];
      if (!participants.includes(uid)) {
        participants.push(uid);
      }
      if (!members.includes(uid)) {
        members.push(uid);
      }
      await updateChat2(chatId, { participants, members });
      await deleteInviteToken(token);
      res.json({ success: true, chatId });
    } catch (err) {
      logger.error({ err }, "Join by token error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/revoke-invites", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const isAdmin2 = chat.admins?.includes(uid);
      const isCreator = chat.creatorId === uid || chat.creatorUid === uid;
      if (!isAdmin2 && !isCreator) {
        return res.status(403).json({ error: "Only admins can revoke invite links" });
      }
      await revokeInviteTokensByChatId(chatId);
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Revoke invites error");
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/chats/:chatId/delete", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const isCreator = chat.creatorId === user.id;
      const isChatAdmin = chat.admins?.includes(uid);
      const isSuperAdmin = user.role === "admin";
      if (!isCreator && !isChatAdmin && !isSuperAdmin) {
        return res.status(403).json({ error: "Only chat creator, chat administrators or super administrators can delete this chat" });
      }
      const result = await deleteChatCompletely(chatId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/chats/:chatId", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const isCreator = chat.creatorId === user.id;
      const isChatAdmin = chat.admins?.includes(uid);
      const isSuperAdmin = user.role === "admin";
      if (!isCreator && !isChatAdmin && !isSuperAdmin) {
        return res.status(403).json({ error: "Only chat creator, chat administrators or super administrators can delete this chat" });
      }
      const result = await deleteChatCompletely(chatId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/chats-pins.ts
init_jwtAuth();
init_logger();
function setupChatPinRoutes(app) {
  app.get("/api/chats/:chatId/pins", requireAuth, async (req, res) => {
    try {
      const chatId = req.params.chatId;
      const { pinnedMessages: pinnedMessagesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11, sql: drizzleSql } = await import("drizzle-orm");
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) return res.status(404).json({ error: "Chat not found" });
      const pins = await db2.select().from(pinnedMessagesTable).where(eq11(pinnedMessagesTable.chatId, chat.id)).orderBy(drizzleSql`${pinnedMessagesTable.pinnedAt} DESC`);
      res.json(pins);
    } catch (err) {
      logger.error({ err }, "Get pinned messages error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/pins", requireAuth, validate(PinMessageSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { messageUid } = req.body;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) return res.status(404).json({ error: "Chat not found" });
      const isPrivate = chat.type === "private" || chat.type === "direct";
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const userObj = await getUserByUid2(uid);
      if (!isPrivate) {
        const isAdmin2 = chat.admins?.includes(uid);
        const isCreator = chat.creatorId === uid || chat.creatorUid === uid;
        const isGlobalAdmin = userObj?.role === "admin";
        if (!isAdmin2 && !isCreator && !isGlobalAdmin) {
          return res.status(403).json({ error: "Only administrators can pin messages in this chat" });
        }
      }
      const MAX_PINS = parseInt(process.env.MAX_PINS_PER_CHAT || "50", 10);
      const { pinnedMessages: pinnedMessagesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11, and: and8, count: count2 } = await import("drizzle-orm");
      const countResult = await db2.select({ cnt: count2() }).from(pinnedMessagesTable).where(eq11(pinnedMessagesTable.chatId, chat.id));
      const currentCount = countResult[0]?.cnt || 0;
      if (currentCount >= MAX_PINS) {
        return res.status(400).json({ error: `Maximum pinned messages limit (${MAX_PINS}) reached` });
      }
      const existing = await db2.select().from(pinnedMessagesTable).where(and8(eq11(pinnedMessagesTable.chatId, chat.id), eq11(pinnedMessagesTable.messageUid, messageUid)));
      if (existing.length > 0) {
        return res.status(409).json({ error: "Message is already pinned" });
      }
      const pinnedByName = userObj?.displayName || userObj?.username || "User";
      const result = await db2.insert(pinnedMessagesTable).values({
        chatId: chat.id,
        messageUid,
        pinnedBy: uid,
        pinnedByName,
        sortOrder: 0
      }).returning();
      const pin = result[0];
      try {
        const broadcastFn = globalThis.__broadcastPinnedMessagesUpdate;
        if (broadcastFn) {
          const participants = chat.participants || [];
          broadcastFn(participants, {
            type: "pinned_messages_update",
            chatId,
            action: "pin",
            pin
          });
        }
      } catch (broadcastErr) {
        logger.warn({ err: broadcastErr }, "[Pin] Broadcast failed");
      }
      res.json(pin);
    } catch (err) {
      logger.error({ err }, "Pin message error");
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/chats/:chatId/pins/:messageUid", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const messageUid = req.params.messageUid;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) return res.status(404).json({ error: "Chat not found" });
      const isPrivate = chat.type === "private" || chat.type === "direct";
      if (!isPrivate) {
        const isAdmin2 = chat.admins?.includes(uid);
        const isCreator = chat.creatorId === uid || chat.creatorUid === uid;
        const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
        const userObj = await getUserByUid2(uid);
        const isGlobalAdmin = userObj?.role === "admin";
        if (!isAdmin2 && !isCreator && !isGlobalAdmin) {
          return res.status(403).json({ error: "Only administrators can unpin messages in this chat" });
        }
      }
      const { pinnedMessages: pinnedMessagesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11, and: and8 } = await import("drizzle-orm");
      const deleted = await db2.delete(pinnedMessagesTable).where(and8(eq11(pinnedMessagesTable.chatId, chat.id), eq11(pinnedMessagesTable.messageUid, messageUid))).returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Pinned message not found" });
      }
      try {
        const broadcastFn = globalThis.__broadcastPinnedMessagesUpdate;
        if (broadcastFn) {
          const participants = chat.participants || [];
          broadcastFn(participants, {
            type: "pinned_messages_update",
            chatId,
            action: "unpin",
            messageUid
          });
        }
      } catch (broadcastErr) {
        logger.warn({ err: broadcastErr }, "[Unpin] Broadcast failed");
      }
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Unpin message error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/pins/reorder", requireAuth, validate(PinsReorderSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { pins } = req.body;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) return res.status(404).json({ error: "Chat not found" });
      const { pinnedMessages: pinnedMessagesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      for (const pin of pins) {
        await db2.update(pinnedMessagesTable).set({ sortOrder: pin.sortOrder }).where(eq11(pinnedMessagesTable.id, pin.id));
      }
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Reorder pins error");
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/chats-statuses.ts
init_jwtAuth();
init_logger();
function setupChatStatusRoutes(app) {
  app.get("/api/chats/:chatId/media", requireAuth, async (req, res) => {
    try {
      const chatId = req.params.chatId;
      const type = req.query.type || "all";
      const limit = Math.min(parseInt(req.query.limit) || 30, 100);
      const offset = parseInt(req.query.offset) || 0;
      const search = req.query.search || "";
      const sort = req.query.sort || "newest";
      const { getMediaForChat: getMediaForChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const result = await getMediaForChat2(chatId, { type, limit, offset, search, sort });
      res.json(result);
    } catch (err) {
      logger.error({ err }, "Get media error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/chats/:chatId/statuses", requireAuth, async (req, res) => {
    try {
      const chatIdParam = req.params.chatId;
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql5 } = await import("drizzle-orm");
      let chatNumericId = parseInt(chatIdParam);
      if (isNaN(chatNumericId)) {
        const chatResult = await dbConn.execute(sql5`SELECT id FROM chats WHERE chat_uid = ${chatIdParam}`);
        const chatRows = chatResult?.rows || [];
        if (!chatRows.length) {
          logger.info(`[Statuses] \u26A0\uFE0F Chat ${chatIdParam} not found`);
          return res.json([]);
        }
        chatNumericId = chatRows[0].id;
      }
      logger.info(`[Statuses] GET statuses: chatIdParam=${chatIdParam}, chatNumericId=${chatNumericId}`);
      const result = await dbConn.execute(sql5`
        SELECT ms.id, ms.message_id, ms.user_id, ms.status, ms.push_sent_at, ms.push_delivered_at, ms.opened_at, ms.read_at,
               m.msg_uid as message_uid
        FROM message_statuses ms
        JOIN messages m ON m.id = ms.message_id
        WHERE m.chat_id = ${chatNumericId}
        ORDER BY ms.updated_at DESC
      `);
      const rows = result?.rows || (Array.isArray(result) ? result : []);
      res.json(rows);
    } catch (err) {
      logger.error({ err }, "Get statuses error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/chats/:chatId/my-statuses", requireAuth, async (req, res) => {
    try {
      const chatIdParam = req.params.chatId;
      const uid = req.user.uid;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql5 } = await import("drizzle-orm");
      let chatNumericId = parseInt(chatIdParam);
      if (isNaN(chatNumericId)) {
        const chatResult = await dbConn.execute(sql5`SELECT id FROM chats WHERE chat_uid = ${chatIdParam}`);
        const chatRows = chatResult?.rows || [];
        if (!chatRows.length) {
          logger.info(`[MyStatuses] \u26A0\uFE0F Chat ${chatIdParam} not found`);
          return res.json([]);
        }
        chatNumericId = chatRows[0].id;
      }
      logger.info(`[MyStatuses] GET my-statuses: chatIdParam=${chatIdParam}, chatNumericId=${chatNumericId}, userId=${user.id}`);
      const result = await dbConn.execute(sql5`
        SELECT
          m.msg_uid as message_uid,
          m.id as message_id,
          CASE
            WHEN MAX(CASE WHEN ms.status = 'read' THEN 1 ELSE 0 END) = 1 THEN 'read'
            WHEN MAX(CASE WHEN ms.status = 'opened' THEN 1 ELSE 0 END) = 1 THEN 'delivered'
            WHEN MAX(CASE WHEN ms.status IN ('sent', 'delivered') THEN 1 ELSE 0 END) = 1 THEN 'sent'
            WHEN MAX(CASE WHEN ms.status = 'pending' THEN 1 ELSE 0 END) = 1 THEN 'pending'
            ELSE 'pending'
          END as aggregated_status,
          COUNT(CASE WHEN ms.status = 'read' THEN 1 END) as read_count,
          COUNT(CASE WHEN ms.status IN ('sent', 'delivered', 'opened', 'read') THEN 1 END) as delivered_count,
          COUNT(*) as total_recipients
        FROM messages m
        LEFT JOIN message_statuses ms ON ms.message_id = m.id
        WHERE m.chat_id = ${chatNumericId}
        AND m.sender_id = ${user.id}
        GROUP BY m.id, m.msg_uid
        ORDER BY m.created_at DESC
      `);
      const rows = result?.rows || (Array.isArray(result) ? result : []);
      res.json(rows);
    } catch (err) {
      logger.error({ err }, "Get my statuses error");
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/chats-members.ts
init_jwtAuth();
init_logger();
function getBroadcast() {
  return globalThis.__broadcastStatusUpdate;
}
function setupChatMemberRoutes(app) {
  app.post(
    "/api/chats/:chatId/members",
    requireAuth,
    chatsRateLimit,
    async (req, res) => {
      try {
        const requesterUid = req.user.uid;
        const { chatId } = req.params;
        const { uid: singleUid, uids: multipleUids } = req.body;
        const uidsToAdd = singleUid ? [singleUid] : Array.isArray(multipleUids) ? multipleUids : [];
        if (uidsToAdd.length === 0) {
          return res.status(400).json({ error: "Provide uid or uids array in body." });
        }
        const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        const chat = await getChat2(chatId);
        if (!chat) {
          return res.status(404).json({ error: "Chat not found" });
        }
        if (chat.type === "private") {
          return res.status(400).json({ error: "Cannot add members to a private chat." });
        }
        const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
        const requester = await getUserByUid2(requesterUid);
        const isChatAdmin = chat.admins?.includes(requesterUid);
        const isCreator = chat.creatorUid === requesterUid || chat.creatorId === requester?.id;
        const isGlobalAdmin = requester?.role === "admin";
        if (!isChatAdmin && !isCreator && !isGlobalAdmin) {
          return res.status(403).json({ error: "Only chat administrators can add members." });
        }
        const participants = [...chat.participants || []];
        const members = [...chat.members || []];
        let addedCount = 0;
        for (const uid of uidsToAdd) {
          if (!participants.includes(uid)) {
            participants.push(uid);
            addedCount++;
          }
          if (!members.includes(uid)) {
            members.push(uid);
          }
        }
        if (addedCount === 0) {
          return res.json({ success: true, added: 0, message: "All users are already members." });
        }
        const { updateChat: updateChat2, logAdminAction: logAdminAction2, createMessage: createMessage2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        await updateChat2(chatId, { participants, members });
        for (const addedUid of uidsToAdd) {
          try {
            const { getUserByUid: getUserByUid3 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
            const addedUser = await getUserByUid3(addedUid);
            const senderUser = await getUserByUid3(requesterUid);
            const addedName = addedUser?.displayName || addedUser?.username || addedUid;
            const actorName = senderUser?.displayName || senderUser?.username || requesterUid;
            const isSelfAdd = addedUid === requesterUid;
            await createMessage2({
              msgUid: `sys_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              chatId,
              senderId: senderUser?.id || 0,
              senderName: "system",
              text: isSelfAdd ? `\u{1F44B} ${addedName} \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u043B\u0441\u044F \u043A \u0447\u0430\u0442\u0443` : `\u{1F44B} ${actorName} \u0434\u043E\u0431\u0430\u0432\u0438\u043B(\u0430) ${addedName} \u0432 \u0447\u0430\u0442`,
              type: "text"
            });
          } catch (msgErr) {
            logger.warn({ err: msgErr }, "Failed to create system message on member add");
          }
        }
        logAdminAction2({
          chatId: chat.id || void 0,
          actorUid: requesterUid,
          action: "members_added",
          details: { addedUids: uidsToAdd, addedCount }
        });
        logger.info(
          `[MEMBERS] ${requesterUid} added ${addedCount} member(s) to chat ${chatId}`
        );
        const broadcast = getBroadcast();
        if (broadcast) {
          const allParticipantUids = participants.filter(
            (p) => !uidsToAdd.includes(p) || uidsToAdd.includes(p)
          );
          broadcast([...new Set(allParticipantUids)], {
            type: "chat_members_updated",
            chatId,
            participants,
            members,
            addedBy: requesterUid,
            addedUids: uidsToAdd
          });
        }
        res.json({ success: true, added: addedCount, participants, members });
      } catch (err) {
        logger.error({ err }, "Add member error");
        res.status(500).json({ error: err.message });
      }
    }
  );
  app.delete(
    "/api/chats/:chatId/members/:uid",
    requireAuth,
    chatsRateLimit,
    async (req, res) => {
      try {
        const requesterUid = req.user.uid;
        const { chatId, uid } = req.params;
        if (!uid) {
          return res.status(400).json({ error: "uid param is required." });
        }
        const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        const chat = await getChat2(chatId);
        if (!chat) {
          return res.status(404).json({ error: "Chat not found" });
        }
        const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
        const requester = await getUserByUid2(requesterUid);
        const isChatAdmin = chat.admins?.includes(requesterUid);
        const isCreator = chat.creatorUid === requesterUid || chat.creatorId === requester?.id;
        const isGlobalAdmin = requester?.role === "admin";
        if (!isChatAdmin && !isCreator && !isGlobalAdmin) {
          return res.status(403).json({ error: "Only chat administrators can remove members." });
        }
        if (chat.creatorUid === uid) {
          return res.status(400).json({ error: "Cannot remove the chat creator." });
        }
        const participants = (chat.participants || []).filter((p) => p !== uid);
        const members = (chat.members || []).filter((m) => m !== uid);
        const admins = (chat.admins || []).filter((a) => a !== uid);
        const { updateChat: updateChat2, logAdminAction: logAdminAction2, createMessage: createMessage2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        await updateChat2(chatId, { participants, members, admins });
        try {
          const { getUserByUid: getUserByUid3 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
          const removedUser = await getUserByUid3(uid);
          const actorUser = await getUserByUid3(requesterUid);
          const removedName = removedUser?.displayName || removedUser?.username || uid;
          const actorName = actorUser?.displayName || actorUser?.username || requesterUid;
          await createMessage2({
            msgUid: `sys_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            chatId,
            senderId: actorUser?.id || 0,
            senderName: "system",
            text: `\u{1F6AA} ${actorName} \u0438\u0441\u043A\u043B\u044E\u0447\u0438\u043B(\u0430) ${removedName} \u0438\u0437 \u0447\u0430\u0442\u0430`,
            type: "text"
          });
        } catch (msgErr) {
          logger.warn({ err: msgErr }, "Failed to create system message on member remove");
        }
        logAdminAction2({
          chatId: chat.id || void 0,
          actorUid: requesterUid,
          action: "member_removed",
          targetUid: uid
        });
        logger.info(
          `[MEMBERS] ${requesterUid} removed ${uid} from chat ${chatId}`
        );
        const broadcast = getBroadcast();
        if (broadcast) {
          broadcast([.../* @__PURE__ */ new Set([...participants, uid])], {
            type: "chat_members_updated",
            chatId,
            participants,
            members,
            removedBy: requesterUid,
            removedUid: uid
          });
        }
        res.json({ success: true, participants, members });
      } catch (err) {
        logger.error({ err }, "Remove member error");
        res.status(500).json({ error: err.message });
      }
    }
  );
  app.post(
    "/api/chats/:chatId/leave",
    requireAuth,
    chatsRateLimit,
    async (req, res) => {
      try {
        const uid = req.user.uid;
        const { chatId } = req.params;
        const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        const chat = await getChat2(chatId);
        if (!chat) {
          return res.status(404).json({ error: "Chat not found" });
        }
        if (chat.type === "private") {
          return res.status(400).json({ error: "Cannot leave a private chat." });
        }
        if (chat.creatorUid === uid) {
          return res.status(400).json({ error: "Chat creator cannot leave. Delete the chat instead." });
        }
        const participants = (chat.participants || []).filter((p) => p !== uid);
        const members = (chat.members || []).filter((m) => m !== uid);
        const admins = (chat.admins || []).filter((a) => a !== uid);
        const { updateChat: updateChat2, logAdminAction: logAdminAction2, createMessage: createMessage2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        await updateChat2(chatId, { participants, members, admins });
        try {
          const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
          const leavingUser = await getUserByUid2(uid);
          const leavingName = leavingUser?.displayName || leavingUser?.username || uid;
          await createMessage2({
            msgUid: `sys_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            chatId,
            senderId: leavingUser?.id || 0,
            senderName: "system",
            text: `\u{1F6AA} ${leavingName} \u043F\u043E\u043A\u0438\u043D\u0443\u043B(\u0430) \u0447\u0430\u0442`,
            type: "text"
          });
        } catch (msgErr) {
          logger.warn({ err: msgErr }, "Failed to create system message on member leave");
        }
        logAdminAction2({
          chatId: chat.id || void 0,
          actorUid: uid,
          action: "member_left"
        });
        logger.info(`[MEMBERS] ${uid} left chat ${chatId}`);
        const broadcast = getBroadcast();
        if (broadcast) {
          broadcast([.../* @__PURE__ */ new Set([...participants, uid])], {
            type: "chat_members_updated",
            chatId,
            participants,
            members,
            leftUid: uid
          });
        }
        res.json({ success: true, participants, members });
      } catch (err) {
        logger.error({ err }, "Leave chat error");
        res.status(500).json({ error: err.message });
      }
    }
  );
}

// server/routes/chats-advanced.ts
init_jwtAuth();
init_logger();
function setupChatAdvancedRoutes(app) {
  app.get("/api/chats/by-username/:username", requireAuth, async (req, res) => {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();
      const { getChatByUsername: getChatByUsername2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChatByUsername2(cleanUsername);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found by this username" });
      }
      res.json(chat);
    } catch (err) {
      logger.error({ err }, "Get chat by username error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/chats/:chatId/members/list", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const search = req.query.search || "";
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      if (chat.type === "channel") {
        const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
        const userObj = await getUserByUid2(uid);
        const isAdmin2 = chat.admins?.includes(uid);
        const isCreator = chat.creatorId === chat.creatorUid || chat.creatorUid === uid;
        const isGlobalAdmin = userObj?.role === "admin";
        if (!isAdmin2 && !isCreator && !isGlobalAdmin) {
          return res.json({ members: [], total: 0 });
        }
      }
      const participantUids = chat.participants || chat.members || [];
      if (participantUids.length === 0) {
        return res.json({ members: [], total: 0 });
      }
      const { getUsers: getUsers2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const allUsers = await getUsers2();
      let members = allUsers.filter((u) => participantUids.includes(u.uid)).map((u) => ({
        uid: u.uid,
        displayName: u.displayName || u.username || u.uid,
        username: u.username,
        photoURL: u.photoURL,
        status: u.status,
        isCreator: chat.creatorUid === u.uid || chat.creatorId === u.id,
        isAdmin: chat.admins?.includes(u.uid)
      }));
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        members = members.filter(
          (m) => m.displayName?.toLowerCase().includes(q) || m.username?.toLowerCase().includes(q)
        );
      }
      res.json({ members, total: members.length });
    } catch (err) {
      logger.error({ err }, "Get members list error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/chats/:chatId/admin-permissions", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const userObj = await getUserByUid2(uid);
      const isCreator = chat.creatorUid === uid || chat.creatorId === userObj?.id;
      const isGlobalAdmin = userObj?.role === "admin";
      if (!isCreator && !isGlobalAdmin) {
        return res.status(403).json({ error: "Only chat creator can manage admin permissions" });
      }
      const { adminPermissions: adminPermissions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const perms = await db2.select().from(adminPermissions2).where(eq11(adminPermissions2.chatId, chat.id));
      res.json(perms);
    } catch (err) {
      logger.error({ err }, "Get admin permissions error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/admin-permissions", requireAuth, chatsRateLimit, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { userUid, ...permissions } = req.body;
      if (!userUid) {
        return res.status(400).json({ error: "userUid is required" });
      }
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const userObj = await getUserByUid2(uid);
      const isCreator = chat.creatorUid === uid || chat.creatorId === userObj?.id;
      const isGlobalAdmin = userObj?.role === "admin";
      if (!isCreator && !isGlobalAdmin) {
        return res.status(403).json({ error: "Only chat creator can manage admin permissions" });
      }
      const { adminPermissions: adminPermissions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11, and: and8 } = await import("drizzle-orm");
      const existing = await db2.select().from(adminPermissions2).where(and8(
        eq11(adminPermissions2.chatId, chat.id),
        eq11(adminPermissions2.userUid, userUid)
      ));
      if (existing.length > 0) {
        await db2.update(adminPermissions2).set({ ...permissions, updatedAt: /* @__PURE__ */ new Date() }).where(eq11(adminPermissions2.id, existing[0].id));
      } else {
        await db2.insert(adminPermissions2).values({
          chatId: chat.id,
          userUid,
          ...permissions
        });
      }
      const { logAdminAction: logAdminAction2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      logAdminAction2({
        chatId: chat.id,
        actorUid: uid,
        action: "admin_permissions_changed",
        targetUid: userUid,
        details: permissions
      });
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Set admin permissions error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/chats/:chatId/invite-links", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const isAdmin2 = chat.admins?.includes(uid);
      const isCreator = chat.creatorUid === uid || chat.creatorId === chat.creatorUid;
      if (!isAdmin2 && !isCreator) {
        return res.status(403).json({ error: "Only admins can view invite links" });
      }
      const { inviteLinks: inviteLinks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11, desc: desc5 } = await import("drizzle-orm");
      const links = await db2.select().from(inviteLinks2).where(eq11(inviteLinks2.chatId, chat.id)).orderBy(desc5(inviteLinks2.createdAt));
      res.json(links);
    } catch (err) {
      logger.error({ err }, "Get invite links error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/invite-links", requireAuth, chatsRateLimit, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      if (chat.type !== "group" && chat.type !== "channel") {
        return res.status(400).json({ error: "Invite links are only for groups and channels" });
      }
      const isAdmin2 = chat.admins?.includes(uid);
      const isCreator = chat.creatorUid === uid || chat.creatorId === chat.creatorUid;
      if (!isAdmin2 && !isCreator) {
        return res.status(403).json({ error: "Only admins can create invite links" });
      }
      const { generateInviteToken: generateInviteToken2 } = await init_invite_store().then(() => invite_store_exports);
      const { inviteLinks: inviteLinks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const token = generateInviteToken2();
      const result = await db2.insert(inviteLinks2).values({
        chatId: chat.id,
        token,
        createdBy: uid
      }).returning();
      const host2 = req.get("host") || "localhost:4080";
      const proto = req.protocol || "http";
      const link = `${proto}://${host2}/chat?token=${token}`;
      res.json({ ...result[0], link });
    } catch (err) {
      logger.error({ err }, "Create invite link error");
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/chats/:chatId/invite-links/:linkId", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { chatId, linkId } = req.params;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const isAdmin2 = chat.admins?.includes(uid);
      const isCreator = chat.creatorUid === uid;
      if (!isAdmin2 && !isCreator) {
        return res.status(403).json({ error: "Only admins can delete invite links" });
      }
      const { inviteLinks: inviteLinks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11, and: and8 } = await import("drizzle-orm");
      await db2.delete(inviteLinks2).where(and8(
        eq11(inviteLinks2.id, Number(linkId)),
        eq11(inviteLinks2.chatId, chat.id)
      ));
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Delete invite link error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/invite-links/:linkId/revoke", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { chatId, linkId } = req.params;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const isAdmin2 = chat.admins?.includes(uid);
      const isCreator = chat.creatorUid === uid;
      if (!isAdmin2 && !isCreator) {
        return res.status(403).json({ error: "Only admins can revoke invite links" });
      }
      const { inviteLinks: inviteLinks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11, and: and8 } = await import("drizzle-orm");
      await db2.update(inviteLinks2).set({ revoked: true, revokedAt: /* @__PURE__ */ new Date() }).where(and8(
        eq11(inviteLinks2.id, Number(linkId)),
        eq11(inviteLinks2.chatId, chat.id)
      ));
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Revoke invite link error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/chats/:chatId/admin-logs", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const offset = parseInt(req.query.offset) || 0;
      const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chat = await getChat2(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const userObj = await getUserByUid2(uid);
      const isAdmin2 = chat.admins?.includes(uid);
      const isCreator = chat.creatorUid === uid || chat.creatorId === userObj?.id;
      const isGlobalAdmin = userObj?.role === "admin";
      if (!isAdmin2 && !isCreator && !isGlobalAdmin) {
        return res.status(403).json({ error: "Only admins can view admin logs" });
      }
      const { adminLogs: adminLogs2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq11, desc: descOrd } = await import("drizzle-orm");
      const logs = await db2.select().from(adminLogs2).where(eq11(adminLogs2.chatId, chat.id)).orderBy(descOrd(adminLogs2.createdAt)).limit(limit).offset(offset);
      const enrichedLogs = await Promise.all(logs.map(async (log2) => {
        try {
          const actor = await getUserByUid2(log2.actorUid);
          let targetName = null;
          if (log2.targetUid) {
            const target = await getUserByUid2(log2.targetUid);
            targetName = target?.displayName || target?.username || log2.targetUid;
          }
          return {
            ...log2,
            actorName: actor?.displayName || actor?.username || log2.actorUid,
            targetName
          };
        } catch {
          return log2;
        }
      }));
      res.json(enrichedLogs);
    } catch (err) {
      logger.error({ err }, "Get admin logs error");
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/chats.ts
function setupChatRoutes(app) {
  setupChatCrudRoutes(app);
  setupChatPinRoutes(app);
  setupChatStatusRoutes(app);
  setupChatMemberRoutes(app);
  setupChatAdvancedRoutes(app);
}

// server/routes/messages.ts
init_jwtAuth();
import { randomUUID as randomUUID3 } from "crypto";
init_helpers();
init_push();
init_logger();
init_db();
init_schema();
import { eq as eq6 } from "drizzle-orm";
function setupMessageRoutes(app) {
  app.get("/api/chats/:chatId/messages", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      if (chatId !== "global_chat") {
        const { getChat: getChatInfo } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        const chatInfo = await getChatInfo(chatId);
        if (chatInfo) {
          const isPrivate = chatInfo.type === "private";
          const isGroup = chatInfo.type === "group";
          const pts = chatInfo.participants || [];
          const mbs = chatInfo.members || [];
          const isMember = pts.includes(uid) || mbs.includes(uid) || chatInfo.creatorUid === uid;
          const isSuperAdmin = req.user?.role === "admin";
          if (isPrivate && !isMember && !isSuperAdmin) {
            return res.status(403).json({ error: "Access denied: you are not a participant in this chat" });
          }
          if (isGroup && !isMember && !isSuperAdmin && !chatInfo.username) {
            return res.status(403).json({ error: "Access denied: you are not a member of this group" });
          }
        }
      }
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const msgs = await getMessagesForChat(chatId, limit, offset);
      res.json(msgs);
    } catch (err) {
      logger.error({ err }, "Get messages error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/chats/:chatId/messages", requireAuth, messageRateLimit, validate(MessageSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const chatId = req.params.chatId;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const sender = await getUserByUid2(uid);
      if (!sender) {
        return res.status(404).json({ error: "User not found" });
      }
      if (sender.role === "banned") {
        return res.status(403).json({ error: "Your account has been banned. You cannot send messages." });
      }
      const { getBlockDirection: getBlockDirection2 } = await Promise.resolve().then(() => (init_admin(), admin_exports));
      const { getChat: getChatInfo } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const chatInfo = await getChatInfo(chatId);
      if (chatInfo) {
        if (chatInfo.type === "channel") {
          const isCreator = chatInfo.creatorUid === uid || chatInfo.creatorId === sender.id;
          const isAdmin2 = chatInfo.admins?.includes(uid);
          if (!isCreator && !isAdmin2 && sender.role !== "admin") {
            return res.status(403).json({ error: "Only channel admins can post in this channel" });
          }
        } else if (chatInfo.type === "group") {
          const pts = chatInfo.participants || [];
          const mbs = chatInfo.members || [];
          const isMember = pts.includes(uid) || mbs.includes(uid) || chatInfo.creatorUid === uid;
          if (!isMember && sender.role !== "admin") {
            return res.status(403).json({ error: "You must join this group to send messages" });
          }
        } else if (chatInfo.type === "private") {
          const pts = chatInfo.participants || [];
          if (!pts.includes(uid) && sender.role !== "admin") {
            return res.status(403).json({ error: "You are not a participant in this private chat" });
          }
        }
      }
      if (chatInfo && chatInfo.type === "private") {
        const participants = chatInfo.participants || [];
        const otherUid = participants.find((p) => p !== uid);
        if (otherUid) {
          const blockDir = await getBlockDirection2(uid, otherUid);
          if (blockDir === "by_me" || blockDir === "both") {
            return res.status(403).json({ error: "You have blocked this user" });
          }
          if (blockDir === "by_them") {
            return res.status(403).json({ error: "This user has blocked you" });
          }
          const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const { eq: eqOp } = await import("drizzle-orm");
          const targetUserResult = await db.select({ privacySettings: users3.privacySettings }).from(users3).where(eqOp(users3.uid, otherUid)).limit(1);
          const targetPrivacy = targetUserResult[0]?.privacySettings;
          if (targetPrivacy?.messages) {
            const msgPrivacy = targetPrivacy.messages;
            if (msgPrivacy === "nobody") {
              return res.status(403).json({ error: "This user does not accept messages" });
            }
            if (msgPrivacy === "contacts") {
              const { userContacts: userContacts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
              const { and: and8 } = await import("drizzle-orm");
              const contactCheck = await db.select().from(userContacts2).where(and8(eqOp(userContacts2.ownerUid, otherUid), eqOp(userContacts2.contactUid, uid))).limit(1);
              if (contactCheck.length === 0) {
                return res.status(403).json({ error: "This user only accepts messages from contacts" });
              }
            }
          }
        }
      }
      const isChannel = chatInfo && (chatInfo.type === "channel" || chatInfo.type === "channel");
      const messageId = randomUUID3();
      const messageData = {
        msgUid: messageId,
        chatId,
        senderId: sender.id,
        senderName: isChannel ? String(chatInfo.name || "\u041A\u0430\u043D\u0430\u043B") : sender.displayName || "Anonymous",
        senderAvatar: isChannel ? String(chatInfo.avatar || "") : sender.photoURL || "",
        text: req.body.text || null,
        fileUrl: req.body.fileUrl || null,
        fileName: req.body.fileName || null,
        fileType: req.body.fileType || null,
        type: isChannel ? "channel_post" : req.body.type || "text",
        duration: req.body.duration || null,
        replyTo: req.body.replyTo || null
      };
      const msg = await createMessage(messageData);
      const outgoingMsg = {
        ...msg,
        senderId: isChannel ? `channel_${chatId}` : sender.uid,
        isChannelPost: isChannel
      };
      if (isChannel && chatInfo.linkedChatId) {
        try {
          const linkedIdNum = Number(chatInfo.linkedChatId);
          const mirrorUid = randomUUID3();
          const mirrorMsg = await createMessage({
            msgUid: mirrorUid,
            chatId: linkedIdNum,
            senderId: sender.id,
            senderName: String(chatInfo.name || "\u041A\u0430\u043D\u0430\u043B"),
            senderAvatar: String(chatInfo.avatar || ""),
            text: req.body.text || null,
            fileUrl: req.body.fileUrl || null,
            fileName: req.body.fileName || null,
            fileType: req.body.fileType || null,
            type: "channel_post",
            duration: req.body.duration || null,
            replyTo: null
          });
          const { getChat: getLinkedChat } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
          const linkedChatInfo = await getLinkedChat(linkedIdNum);
          if (linkedChatInfo) {
            const discRecipients = Array.from(/* @__PURE__ */ new Set([
              ...linkedChatInfo.participants || [],
              ...linkedChatInfo.members || []
            ]));
            const broadcastFn = globalThis.__broadcastStatusUpdate;
            if (broadcastFn) {
              broadcastFn(discRecipients, {
                type: "new_message",
                chatId: String(linkedChatInfo.chatUid || linkedChatInfo.id),
                message: {
                  ...mirrorMsg,
                  senderId: `channel_${chatId}`,
                  isChannelPost: true,
                  channelId: chatId
                }
              });
            }
          }
        } catch (mirrorErr) {
          logger.error({ err: mirrorErr }, "[Message] Failed to mirror post to linked discussion group");
        }
      }
      setImmediate(() => {
        try {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn && chatInfo) {
            const participants = chatInfo.participants || [];
            broadcastFn(participants, {
              type: "new_message",
              chatId,
              message: outgoingMsg
            });
          }
        } catch (e) {
          logger.error({ err: e }, "[Message] new_message broadcast error");
        }
      });
      if (req.body.replyTo) {
        try {
          let replyTargetMsgId = null;
          let replyParsed = null;
          try {
            replyParsed = typeof req.body.replyTo === "string" ? JSON.parse(req.body.replyTo) : req.body.replyTo;
            replyTargetMsgId = replyParsed?.msgId;
          } catch {
            replyTargetMsgId = req.body.replyTo;
          }
          if (replyTargetMsgId) {
            const { messages: msgsTable, chats: chsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
            const { eq: eqOp } = await import("drizzle-orm");
            let repMsgRows = await db.select().from(msgsTable).where(eqOp(msgsTable.msgUid, replyTargetMsgId)).limit(1);
            if (!repMsgRows.length) {
              const parsedNum = parseInt(replyTargetMsgId);
              if (!isNaN(parsedNum)) {
                repMsgRows = await db.select().from(msgsTable).where(eqOp(msgsTable.id, parsedNum)).limit(1);
              }
            }
            if (repMsgRows.length > 0) {
              const repMsg = repMsgRows[0];
              const repChatRows = await db.select().from(chsTable).where(eqOp(chsTable.id, repMsg.chatId)).limit(1);
              const repChat = repChatRows[0];
              let channelMsgToComment = null;
              let channelChat = null;
              if (repChat?.type === "channel") {
                channelMsgToComment = repMsg;
                channelChat = repChat;
              } else if (replyParsed?.isChannelPost && replyParsed?.msgId) {
                let rootRows = await db.select().from(msgsTable).where(eqOp(msgsTable.msgUid, replyParsed.msgId)).limit(1);
                if (rootRows.length) {
                  channelMsgToComment = rootRows[0];
                  const cRows = await db.select().from(chsTable).where(eqOp(chsTable.id, channelMsgToComment.chatId)).limit(1);
                  channelChat = cRows[0];
                }
              }
              if (channelMsgToComment && channelChat) {
                const commentId = randomUUID3();
                const newCommentObj = await createComment({
                  commentUid: commentId,
                  messageId: channelMsgToComment.id,
                  chatId: channelMsgToComment.chatId,
                  userId: sender.id,
                  userName: sender.displayName || sender.username || "Anonymous",
                  userAvatar: sender.photoURL || "",
                  text: req.body.text || "\u{1F4AC}"
                });
                const broadcastFn = globalThis.__broadcastStatusUpdate;
                if (broadcastFn && channelChat) {
                  const chanRecipients = Array.from(/* @__PURE__ */ new Set([
                    ...channelChat.participants || [],
                    ...channelChat.members || []
                  ]));
                  broadcastFn(chanRecipients, {
                    type: "new_comment",
                    chatId: String(channelChat.chatUid || channelChat.id),
                    messageUid: channelMsgToComment.msgUid || String(channelMsgToComment.id),
                    comment: newCommentObj
                  });
                }
              }
            }
          }
        } catch (replySyncErr) {
          logger.error({ err: replySyncErr }, "[Message] Failed to sync reply as channel comment");
        }
      }
      setImmediate(() => {
        try {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn && chatInfo) {
            const participants = chatInfo.participants || [];
            broadcastFn(participants, {
              type: "new_message",
              chatId,
              message: msg
            });
          }
        } catch (e) {
          logger.error({ err: e }, "[Message] new_message broadcast error");
        }
      });
      setImmediate(() => {
        logger.info(`[Message] \u{1F4E4} Calling sendPushToChatMembers: chatId=${chatId}, senderId=${sender.id}, senderUid=${sender.uid}`);
        sendPushToChatMembers(
          chatId,
          sender.id,
          sender.uid,
          sender.displayName || "Anonymous",
          req.body.text || "",
          req.body.type || "text"
        ).catch((err) => logger.error({ err }, "[Message] \u274C Push error"));
      });
      res.json(msg);
    } catch (err) {
      logger.error({ err }, "Create message error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/messages/:messageId/comments", requireAuth, messageRateLimit, validate(CommentSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const commentId = randomUUID3();
      const msgParam = req.params.messageId;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { messages: messagesTable, chats: chatsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eqOp } = await import("drizzle-orm");
      let msgRows = await db.select().from(messagesTable).where(eqOp(messagesTable.msgUid, msgParam)).limit(1);
      if (!msgRows.length) {
        const numId = parseInt(msgParam);
        if (!isNaN(numId)) {
          msgRows = await db.select().from(messagesTable).where(eqOp(messagesTable.id, numId)).limit(1);
        }
      }
      if (!msgRows.length) {
        return res.status(404).json({ error: "Message not found" });
      }
      const targetMsg = msgRows[0];
      const chatRows = await db.select().from(chatsTable).where(eqOp(chatsTable.id, targetMsg.chatId)).limit(1);
      const parentChat = chatRows[0];
      if (parentChat && parentChat.type === "channel" && !parentChat.linkedChatId) {
        return res.status(403).json({ error: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438 \u043A \u044D\u0442\u043E\u043C\u0443 \u043A\u0430\u043D\u0430\u043B\u0443 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B, \u0442\u0430\u043A \u043A\u0430\u043A \u043D\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D \u0447\u0430\u0442 \u043E\u0431\u0441\u0443\u0436\u0434\u0435\u043D\u0438\u0439." });
      }
      const commentData = {
        commentUid: commentId,
        messageId: targetMsg.id,
        chatId: targetMsg.chatId,
        userId: user.id,
        userName: user.displayName || user.username || "Anonymous",
        userAvatar: user.photoURL || "",
        text: req.body.text
      };
      const comment = await createComment(commentData);
      if (parentChat && parentChat.type === "channel" && parentChat.linkedChatId) {
        try {
          const linkedChatIdNum = Number(parentChat.linkedChatId);
          const discMsgUid = randomUUID3();
          const discMsg = await createMessage({
            msgUid: discMsgUid,
            chatId: linkedChatIdNum,
            senderId: user.id,
            senderName: user.displayName || user.username || "Anonymous",
            senderAvatar: user.photoURL || "",
            text: req.body.text,
            type: "text",
            replyTo: JSON.stringify({
              msgId: targetMsg.msgUid || String(targetMsg.id),
              isChannelPost: true,
              text: targetMsg.text || parentChat.name || "\u041F\u043E\u0441\u0442 \u043A\u0430\u043D\u0430\u043B\u0430",
              senderName: parentChat.name || "\u041A\u0430\u043D\u0430\u043B"
            })
          });
          const { getChat: getLinkedChat } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
          const linkedChatInfo = await getLinkedChat(linkedChatIdNum);
          if (linkedChatInfo) {
            const discRecipients = Array.from(/* @__PURE__ */ new Set([
              ...linkedChatInfo.participants || [],
              ...linkedChatInfo.members || []
            ]));
            const broadcastFn = globalThis.__broadcastStatusUpdate;
            if (broadcastFn) {
              broadcastFn(discRecipients, {
                type: "new_message",
                chatId: String(linkedChatInfo.chatUid || linkedChatInfo.id),
                message: discMsg
              });
            }
          }
        } catch (discErr) {
          logger.error({ err: discErr }, "[Comment] Failed to mirror comment to linked discussion group");
        }
      }
      setImmediate(() => {
        try {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn && parentChat) {
            const recipients = Array.from(/* @__PURE__ */ new Set([
              ...parentChat.participants || [],
              ...parentChat.members || []
            ]));
            broadcastFn(recipients, {
              type: "new_comment",
              chatId: String(parentChat.chatUid || parentChat.id),
              messageUid: targetMsg.msgUid || String(targetMsg.id),
              comment
            });
          }
        } catch (e) {
          logger.error({ err: e }, "[Comment] new_comment broadcast error");
        }
      });
      res.json(comment);
    } catch (err) {
      logger.error({ err }, "Create comment error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/messages/:messageId/delete", requireAuth, messageRateLimit, async (req, res) => {
    try {
      const uid = req.user.uid;
      const msgId = req.params.messageId;
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { messages: messagesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const msgRows = await dbConn.select({ senderId: messagesTable.senderId, chatId: messagesTable.chatId }).from(messagesTable).where(eq11(messagesTable.msgUid, msgId)).limit(1);
      if (!msgRows.length) {
        return res.status(404).json({ error: "Message not found" });
      }
      const msgSenderId = msgRows[0].senderId;
      const msgChatId = msgRows[0].chatId;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const isOwner = msgSenderId === user.id;
      if (!isOwner) {
        const { getChat: getChat2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        const chat = await getChat2(msgChatId);
        const isChatAdmin = chat?.admins?.includes(uid) || false;
        const isCreator = chat?.creatorId === user.id;
        const isSuperAdmin = user.role === "admin";
        if (!isChatAdmin && !isCreator && !isSuperAdmin) {
          return res.status(403).json({ error: "You can only delete your own messages" });
        }
      }
      const result = await deleteMessage(msgId);
      setImmediate(() => {
        try {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn) {
            getChat(String(msgChatId)).then((chat) => {
              if (chat) {
                broadcastFn(chat.participants || [], {
                  type: "message_deleted",
                  chatId: String(msgChatId),
                  messageUid: msgId
                });
              }
            });
          }
        } catch (e) {
          logger.error({ err: e }, "[Message] message_deleted broadcast error");
        }
      });
      res.json({ success: true, deleted: result });
    } catch (err) {
      logger.error({ err }, "Delete message error");
      res.status(500).json({ error: err.message });
    }
  });
  app.patch("/api/messages/:messageId/edit", requireAuth, messageRateLimit, validate(EditMessageSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { text: text3 } = req.body;
      const { editMessage: editMessageFn } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const edited = await editMessageFn(req.params.messageId, uid, text3.trim());
      try {
        const chatNumericId = edited.chatId;
        const { getChat: getChatFn } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
        const chatInfo = await getChatFn(chatNumericId);
        if (chatInfo) {
          const participants = chatInfo.participants || [];
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn) {
            broadcastFn(participants, {
              type: "message_edited",
              message: {
                msgUid: edited.msgUid,
                text: edited.text,
                editedAt: edited.editedAt,
                chatId: chatInfo.chatUid || String(chatNumericId)
              }
            });
          }
        }
      } catch (broadcastErr) {
        logger.error({ err: broadcastErr }, "[Edit Message] Broadcast error");
      }
      res.json({ success: true, message: edited });
    } catch (err) {
      logger.error({ err }, "Edit message error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/messages/:messageId/react", requireAuth, messageRateLimit, validate(ReactionSchema), async (req, res) => {
    try {
      const { emoji } = req.body;
      const uid = req.user.uid;
      const messageId = req.params.messageId;
      const reactions = await toggleMessageReaction(messageId, uid, emoji);
      setImmediate(() => {
        try {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn) {
            db.select({ chatId: messages.chatId }).from(messages).where(eq6(messages.msgUid, messageId)).limit(1).then((rows) => {
              if (rows.length) {
                getChat(String(rows[0].chatId)).then((chat) => {
                  if (chat) {
                    broadcastFn(chat.participants || [], {
                      type: "message_reaction",
                      chatId: String(rows[0].chatId),
                      messageUid: messageId,
                      reactions
                    });
                  }
                });
              }
            });
          }
        } catch (e) {
          logger.error({ err: e }, "[Message] message_reaction broadcast error");
        }
      });
      res.json({ success: true, reactions });
    } catch (err) {
      logger.error({ err }, "Toggle message reaction error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/messages/:messageId/comments", requireAuth, async (req, res) => {
    try {
      const cmts = await getCommentsForMessage(req.params.messageId);
      res.json(cmts);
    } catch (err) {
      logger.error({ err }, "Get comments error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/messages/:messageId/status/delivered", requireAuth, async (req, res) => {
    try {
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(req.user.uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql5 } = await import("drizzle-orm");
      const messageResult = await dbConn.execute(sql5`SELECT id FROM messages WHERE msg_uid = ${req.params.messageId}`);
      const messageRows = messageResult?.rows || [];
      if (!messageRows.length) return res.status(404).json({ error: "Message not found" });
      const messageId = messageRows[0].id;
      await dbConn.execute(sql5`
        INSERT INTO message_statuses (message_id, user_id, status, push_delivered_at, updated_at)
        VALUES (${messageId}, ${user.id}, 'delivered', NOW(), NOW())
        ON CONFLICT (message_id, user_id)
        DO UPDATE SET status = 'delivered', push_delivered_at = NOW(), updated_at = NOW()
        WHERE message_statuses.status NOT IN ('opened', 'read')
      `);
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Delivered status error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/messages/:messageId/status/opened", requireAuth, async (req, res) => {
    try {
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(req.user.uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql5 } = await import("drizzle-orm");
      const messageResult = await dbConn.execute(sql5`SELECT id FROM messages WHERE msg_uid = ${req.params.messageId}`);
      const messageRows = messageResult?.rows || [];
      if (!messageRows.length) return res.status(404).json({ error: "Message not found" });
      const messageId = messageRows[0].id;
      await dbConn.execute(sql5`
        INSERT INTO message_statuses (message_id, user_id, status, opened_at, updated_at)
        VALUES (${messageId}, ${user.id}, 'opened', NOW(), NOW())
        ON CONFLICT (message_id, user_id)
        DO UPDATE SET status = 'opened', opened_at = NOW(), updated_at = NOW()
        WHERE message_statuses.status NOT IN ('read')
      `);
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Opened status error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/messages/:messageId/view", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const param = req.params.messageId;
      const numId = parseInt(param);
      const isNum = !isNaN(numId) && String(numId) === param;
      const msg = isNum ? await db.select().from(messages).where(eq6(messages.id, numId)).limit(1) : await db.select().from(messages).where(eq6(messages.msgUid, param)).limit(1);
      if (!msg[0]) return res.status(404).json({ error: "Not found" });
      const viewedBy = msg[0].viewedBy || [];
      if (!viewedBy.includes(uid)) {
        viewedBy.push(uid);
        await db.update(messages).set({ viewedBy }).where(eq6(messages.id, msg[0].id));
      }
      res.json({ success: true, viewedBy });
    } catch (err) {
      logger.error({ err }, "View error");
      res.status(500).json({ error: "Server error" });
    }
  });
  app.post("/api/chats/:chatId/status/read", requireAuth, async (req, res) => {
    try {
      const chatIdParam = req.params.chatId;
      const uid = req.user.uid;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { db: dbConn } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql5 } = await import("drizzle-orm");
      let chatNumericId = parseInt(chatIdParam);
      if (isNaN(chatNumericId)) {
        const chatResult = await dbConn.execute(sql5`SELECT id FROM chats WHERE chat_uid = ${chatIdParam}`);
        const chatRows = chatResult?.rows || [];
        if (!chatRows.length) {
          logger.info(`[StatusRead] \u26A0\uFE0F Chat ${chatIdParam} not found`);
          return res.json({ success: true, updated: 0 });
        }
        chatNumericId = chatRows[0].id;
      }
      logger.info(`[StatusRead] \u{1F4D6} Marking read: chatIdParam=${chatIdParam}, chatNumericId=${chatNumericId}, userId=${user.id}, uid=${uid}`);
      await dbConn.execute(sql5`
        INSERT INTO message_statuses (message_id, user_id, status, read_at, updated_at)
        SELECT m.id, ${user.id}, 'read', NOW(), NOW()
        FROM messages m
        WHERE m.chat_id = ${chatNumericId}
        AND m.sender_id != ${user.id}
        ON CONFLICT (message_id, user_id)
        DO UPDATE SET status = 'read', read_at = NOW(), updated_at = NOW()
        WHERE message_statuses.status != 'read'
      `);
      await dbConn.execute(sql5`
        UPDATE messages SET read_by =
          CASE
            WHEN read_by IS NULL THEN ${JSON.stringify([uid])}::jsonb
            WHEN read_by @> ${JSON.stringify([uid])}::jsonb THEN read_by
            ELSE read_by || ${JSON.stringify([uid])}::jsonb
          END
        WHERE chat_id = ${chatNumericId}
        AND sender_id != ${user.id}
      `);
      logger.info(`[StatusRead] \u2705 Read status updated for chat ${chatNumericId}`);
      try {
        const chatResult = await dbConn.execute(sql5`
            SELECT DISTINCT u.uid
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.chat_id = ${chatNumericId} AND m.sender_id != ${user.id}
          `);
        const senderUids = (chatResult?.rows || []).map((r) => r.uid).filter(Boolean);
        if (senderUids.length > 0) {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn) {
            broadcastFn(senderUids, {
              type: "message_status_update",
              chatId: chatNumericId,
              chatUid: chatIdParam,
              readerUid: uid,
              status: "read"
            });
            logger.info(`[StatusRead] Broadcast read to ${senderUids.length} senders`);
          }
        }
      } catch (broadcastErr) {
        logger.warn({ err: broadcastErr }, "[StatusRead] \u26A0\uFE0F Broadcast failed");
      }
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Read status error");
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/upload.ts
init_jwtAuth();
import express from "express";
import fs4 from "fs";
import path5 from "path";
import { randomUUID as randomUUID5 } from "crypto";
init_config();

// server/services/upload.ts
init_config();
import fs2 from "fs";
import path3 from "path";
import multer from "multer";
import sharp from "sharp";
import { randomUUID as randomUUID4 } from "crypto";
var secureUploadStorage = {
  _handleFile(req, file, callback) {
    const ext = path3.extname(file.originalname || "").toLowerCase();
    const uniqueName = `${randomUUID4()}${ext}`;
    const dest = path3.join(UPLOADS_DIR, uniqueName);
    const maxBytes = getMaxSizeForMime(file.mimetype);
    const writeStream = fs2.createWriteStream(dest);
    let totalBytes = 0;
    let magicChecked = false;
    let rejected = false;
    const header = Buffer.alloc(16);
    let headerPos = 0;
    file.stream.on("data", (chunk) => {
      if (rejected) return;
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        rejected = true;
        file.stream.destroy();
        writeStream.destroy(() => fs2.unlink(dest, () => {
        }));
        const mb = Math.round(maxBytes / (1024 * 1024));
        return callback(new Error(`\u0420\u0430\u0437\u043C\u0435\u0440 \u0444\u0430\u0439\u043B\u0430 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0435\u0442 \u043B\u0438\u043C\u0438\u0442 \u0434\u043B\u044F ${file.mimetype.split("/")[0]}-\u0444\u0430\u0439\u043B\u043E\u0432 (${mb} MB)`));
      }
      if (!magicChecked && headerPos < 16) {
        const copyLen = Math.min(chunk.length, 16 - headerPos);
        chunk.copy(header, headerPos, 0, copyLen);
        headerPos += copyLen;
        if (headerPos >= 4) {
          magicChecked = true;
          if (!validateMagicBytes(file.mimetype, header)) {
            rejected = true;
            file.stream.destroy();
            writeStream.destroy(() => fs2.unlink(dest, () => {
            }));
            return callback(new Error(`\u0424\u0430\u0439\u043B \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u043E\u043C\u0443 \u0442\u0438\u043F\u0443: magic bytes \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0442 \u0441 ${file.mimetype}`));
          }
        }
      }
      writeStream.write(chunk);
    });
    file.stream.on("end", () => {
      if (rejected) return;
      writeStream.end(() => {
        callback(null, { path: dest, size: totalBytes, filename: uniqueName });
      });
    });
    file.stream.on("error", (err) => {
      writeStream.destroy();
      fs2.unlink(dest, () => {
      });
      callback(err);
    });
  },
  _removeFile(req, file, callback) {
    fs2.unlink(file.path, callback);
  }
};
async function generateThumbnails(filePath) {
  const ext = path3.extname(filePath).toLowerCase();
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"];
  if (!imageExts.includes(ext)) return null;
  try {
    const dir = path3.dirname(filePath);
    const baseName = path3.basename(filePath, ext);
    const thumbName = `${baseName}_thumb.webp`;
    const mediumName = `${baseName}_medium.webp`;
    const thumbPath = path3.join(dir, thumbName);
    const mediumPath = path3.join(dir, mediumName);
    await sharp(filePath).resize(150, 150, { fit: "cover" }).webp({ quality: 80 }).toFile(thumbPath);
    await sharp(filePath).resize(600, 600, { fit: "inside" }).webp({ quality: 82 }).toFile(mediumPath);
    return {
      thumbUrl: `/api/download/${thumbName}`,
      mediumUrl: `/api/download/${mediumName}`
    };
  } catch (err) {
    console.warn("[Upload] Thumbnail generation failed:", err.message);
    return null;
  }
}
function createUploadMiddleware() {
  return multer({
    storage: secureUploadStorage,
    fileFilter: (req, file, cb) => {
      if (ALLOWED_MIMETYPES.has(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u044B \u0442\u043E\u043B\u044C\u043A\u043E: ${[...ALLOWED_MIMETYPES].join(", ")}`));
      }
    },
    limits: { fileSize: 100 * 1024 * 1024 }
  });
}

// server/services/ffmpeg.ts
init_logger();
import { execFile } from "child_process";
import fs3 from "fs";
import path4 from "path";
import ffmpegPath from "ffmpeg-static";
var rawFfmpegPath = ffmpegPath;
var FFMPEG_PATH = rawFfmpegPath && fs3.existsSync(rawFfmpegPath) ? rawFfmpegPath : null;
if (FFMPEG_PATH) {
  logger.info(`[FFmpeg] \u2705 Using bundled ffmpeg-static binary: ${FFMPEG_PATH}`);
} else {
  logger.info("[FFmpeg] \u2139\uFE0F ffmpeg binary not found on disk, skipping video transcoding and keeping original files");
}
var runFFmpeg = (args) => {
  return new Promise((resolve) => {
    if (!FFMPEG_PATH) return resolve(false);
    execFile(FFMPEG_PATH, args, { timeout: 18e4, maxBuffer: 10 * 1024 * 1024 }, (error) => {
      if (error) {
        logger.warn({ err: error.message }, "[FFmpeg] execFile failed");
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
var processVideoWithFFmpeg = async (filePath) => {
  if (!FFMPEG_PATH || !fs3.existsSync(filePath)) {
    logger.info({ filePath }, "[FFmpeg] ffmpeg not available or file missing, keeping original file:");
    return filePath;
  }
  const ext = path4.extname(filePath).toLowerCase();
  const dir = path4.dirname(filePath);
  const base = path4.basename(filePath, ext);
  const mp4Path = path4.join(dir, `${base}_faststart.mp4`);
  logger.info(`[FFmpeg] \u{1F3AC} Processing video for maximum browser compatibility: ${path4.basename(filePath)}`);
  const isValidOutput = (outPath) => {
    if (!fs3.existsSync(outPath)) return false;
    const size = fs3.statSync(outPath).size;
    return size > 500;
  };
  const isVideoNote = filePath.toLowerCase().includes("video_note");
  const cropArgs = isVideoNote ? ["-vf", "crop=min(iw\\,ih):min(iw\\,ih)"] : [];
  const strategy1Args = [
    "-y",
    "-analyzeduration",
    "100M",
    "-probesize",
    "100M",
    "-i",
    filePath,
    ...cropArgs,
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    "-ac",
    "2",
    "-max_muxing_queue_size",
    "1024",
    "-movflags",
    "+faststart",
    mp4Path
  ];
  if (await runFFmpeg(strategy1Args) && isValidOutput(mp4Path)) {
    logger.info(`[FFmpeg] \u2705 Strategy 1 (H.264/AAC MP4) success: ${path4.basename(mp4Path)} (${fs3.statSync(mp4Path).size} bytes)`);
    try {
      if (fs3.existsSync(filePath) && !filePath.includes("_faststart")) fs3.unlinkSync(filePath);
    } catch (_) {
    }
    return mp4Path;
  }
  const strategy2Args = [
    "-y",
    "-analyzeduration",
    "100M",
    "-probesize",
    "100M",
    "-i",
    filePath,
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-an",
    "-movflags",
    "+faststart",
    mp4Path
  ];
  if (await runFFmpeg(strategy2Args) && isValidOutput(mp4Path)) {
    logger.info(`[FFmpeg] \u2705 Strategy 2 (Video-only H.264 MP4) success: ${path4.basename(mp4Path)} (${fs3.statSync(mp4Path).size} bytes)`);
    try {
      if (fs3.existsSync(filePath) && !filePath.includes("_faststart")) fs3.unlinkSync(filePath);
    } catch (_) {
    }
    return mp4Path;
  }
  const webmPath = path4.join(dir, `${base}_fallback.webm`);
  const strategy3Args = [
    "-y",
    "-i",
    filePath,
    "-c:v",
    "libvpx",
    "-crf",
    "30",
    "-b:v",
    "0",
    "-c:a",
    "libvorbis",
    "-b:a",
    "64k",
    webmPath
  ];
  if (await runFFmpeg(strategy3Args) && isValidOutput(webmPath)) {
    logger.info(`[FFmpeg] \u2705 Strategy 3 (WebM re-encode) success: ${path4.basename(webmPath)} (${fs3.statSync(webmPath).size} bytes)`);
    try {
      if (fs3.existsSync(filePath) && !filePath.includes("_faststart")) fs3.unlinkSync(filePath);
    } catch (_) {
    }
    return webmPath;
  }
  logger.info("[FFmpeg] \u26A0\uFE0F All transcoding strategies failed, keeping original file");
  if (fs3.existsSync(mp4Path)) try {
    fs3.unlinkSync(mp4Path);
  } catch (_) {
  }
  if (fs3.existsSync(webmPath)) try {
    fs3.unlinkSync(webmPath);
  } catch (_) {
  }
  return filePath;
};
var shouldTranscodeVideo = (filename) => {
  const lower = filename.toLowerCase();
  return lower.includes("video_note") || lower.includes("video") || lower.endsWith(".webm") || lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".qt") || lower.endsWith(".avi") || lower.endsWith(".mkv") || lower.endsWith(".3gp");
};

// server/routes/upload.ts
init_logger();
async function setupUploadRoutes(app) {
  const uploadMiddleware = createUploadMiddleware();
  app.get("/api/download/:filename", requireAuth, async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path5.join(UPLOADS_DIR, filename);
      if (!filePath.startsWith(UPLOADS_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!fs4.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      const stats = fs4.statSync(filePath);
      const ext = path5.extname(filename).toLowerCase();
      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac"
      };
      let contentType = mimeTypes[ext] || "application/octet-stream";
      if (filename.includes("voice_")) {
        contentType = ext === ".mp4" || ext === ".m4a" ? "audio/mp4" : ext === ".ogg" ? "audio/ogg" : "audio/webm";
      } else if (filename.includes("video_note")) {
        contentType = ext === ".mp4" ? "video/mp4" : "video/webm";
      }
      try {
        if (stats.size >= 8) {
          const fd = fs4.openSync(filePath, "r");
          const buffer = Buffer.alloc(12);
          fs4.readSync(fd, buffer, 0, 12, 0);
          fs4.closeSync(fd);
          const isWebm = buffer[0] === 26 && buffer[1] === 69 && buffer[2] === 223 && buffer[3] === 163;
          const isFtyp = buffer[4] === 102 && buffer[5] === 116 && buffer[6] === 121 && buffer[7] === 112 || buffer[0] === 102 && buffer[1] === 116 && buffer[2] === 121 && buffer[3] === 112;
          const isOgg = buffer[0] === 79 && buffer[1] === 103 && buffer[2] === 103 && buffer[3] === 83;
          if (isWebm) {
            contentType = (filename.includes("video_note") || ext === ".webm") && !filename.includes("voice_") ? "video/webm" : "audio/webm";
          } else if (isFtyp) {
            contentType = (filename.includes("video_note") || ext === ".mp4") && !filename.includes("voice_") ? "video/mp4" : "audio/mp4";
          } else if (isOgg) {
            contentType = "audio/ogg";
          }
        }
      } catch (_) {
      }
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        if (start >= stats.size || end >= stats.size) {
          res.setHeader("Content-Range", `bytes */${stats.size}`);
          return res.status(416).json({ error: "Requested Range Not Satisfiable" });
        }
        const chunksize = end - start + 1;
        const fileStream2 = fs4.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": contentType
        });
        fileStream2.pipe(res);
        return;
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", stats.size);
      res.setHeader("Accept-Ranges", "bytes");
      if (!contentType.startsWith("image/") && !contentType.startsWith("video/") && !contentType.startsWith("audio/")) {
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      }
      const fileStream = fs4.createReadStream(filePath);
      fileStream.pipe(res);
      fileStream.on("error", (err) => {
        logger.error({ err }, "File stream error");
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to stream file" });
        }
      });
    } catch (err) {
      logger.error({ err }, "Download error");
      res.status(500).json({ error: err.message || "Download failed" });
    }
  });
  app.post("/api/upload", requireAuth, uploadRateLimit, uploadMiddleware.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      let filePath = req.file.path;
      if (shouldTranscodeVideo(req.file.originalname) || shouldTranscodeVideo(req.file.filename)) {
        filePath = await processVideoWithFFmpeg(filePath);
      }
      const finalName = path5.basename(filePath);
      const result = { url: `/api/download/${finalName}` };
      if (req.file.mimetype?.startsWith("image/")) {
        const thumbs = await generateThumbnails(filePath);
        if (thumbs) {
          result.thumbUrl = thumbs.thumbUrl;
          result.mediumUrl = thumbs.mediumUrl;
        }
      }
      res.json(result);
    } catch (err) {
      logger.error({ err }, "Multipart upload error");
      res.status(500).json({ error: err.message || "Failed to save upload" });
    }
  });
  app.post(
    "/api/upload-binary",
    requireAuth,
    uploadRateLimit,
    express.raw({ type: "*/*", limit: "50mb" }),
    async (req, res) => {
      const startTime = Date.now();
      try {
        const filename = req.headers["x-filename"] || "upload.bin";
        logger.info(`\u{1F4E4} Binary upload started: ${filename}, size: ${req.body?.length || 0} bytes`);
        if (!req.body || !(req.body instanceof Buffer) || req.body.length === 0) {
          logger.error("\u274C Upload failed: Missing or empty body");
          return res.status(400).json({ error: "Missing binary upload body" });
        }
        const buffer = req.body;
        const safeFilename = path5.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, "_");
        const shortId = randomUUID5().substring(0, 8);
        const uniqueName = `${Date.now()}_${shortId}_${safeFilename}`;
        let filePath = path5.join(UPLOADS_DIR, uniqueName);
        fs4.writeFileSync(filePath, buffer);
        if (shouldTranscodeVideo(filename) || shouldTranscodeVideo(uniqueName)) {
          filePath = await processVideoWithFFmpeg(filePath);
        }
        const finalName = path5.basename(filePath);
        logger.info(`\u2705 Upload completed: ${finalName} in ${Date.now() - startTime} ms`);
        const result = { url: `/api/download/${finalName}` };
        if (filename.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i)) {
          const thumbs = await generateThumbnails(filePath);
          if (thumbs) {
            result.thumbUrl = thumbs.thumbUrl;
            result.mediumUrl = thumbs.mediumUrl;
          }
        }
        res.json(result);
      } catch (err) {
        logger.error({ err }, `\u274C Upload error after ${Date.now() - startTime} ms`);
        res.status(500).json({ error: err.message || "Failed to save upload" });
      }
    }
  );
  app.post("/api/reprocess-video/:filename", requireAuth, async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path5.join(UPLOADS_DIR, filename);
      if (!filePath.startsWith(UPLOADS_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!fs4.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      if (filename.includes("_faststart")) {
        logger.info(`[FFmpeg] \u23ED\uFE0F ${filename} already reprocessed`);
        return res.json({ url: `/api/download/${filename}`, reprocessed: false });
      }
      logger.info(`[FFmpeg] \u{1F504} Reprocessing existing video: ${filename}`);
      const reprocessedPath = await processVideoWithFFmpeg(filePath);
      const finalName = path5.basename(reprocessedPath);
      logger.info(`[FFmpeg] \u2705 Reprocessed video: ${finalName}`);
      res.json({ url: `/api/download/${finalName}`, reprocessed: reprocessedPath !== filePath });
    } catch (err) {
      logger.error({ err }, "[FFmpeg] \u274C Reprocess error");
      res.status(500).json({ error: err.message || "Reprocessing failed" });
    }
  });
  app.post("/api/upload-base64", requireAuth, uploadRateLimit, async (req, res) => {
    try {
      const { base64, filename, mimeType } = req.body;
      if (!base64 || !filename) {
        return res.status(400).json({ error: "Missing base64 or filename" });
      }
      const safeFilename = path5.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, "_");
      const buffer = Buffer.from(base64, "base64");
      if (buffer.length < 1e3) {
        logger.error(`\u274C Base64 upload rejected: suspiciously small payload (${buffer.length} bytes) for ${filename}.`);
        return res.status(400).json({ error: `Upload appears empty or corrupted (${buffer.length} bytes received). Please try recording again.` });
      }
      const shortId = randomUUID5().substring(0, 8);
      const uniqueName = `${Date.now()}_${shortId}_${safeFilename}`;
      let filePath = path5.join(UPLOADS_DIR, uniqueName);
      fs4.writeFileSync(filePath, buffer);
      if (shouldTranscodeVideo(filename) || shouldTranscodeVideo(uniqueName)) {
        filePath = await processVideoWithFFmpeg(filePath);
      }
      const finalName = path5.basename(filePath);
      logger.info(`\u2705 Base64 upload completed: ${finalName}`);
      const result64 = { url: `/api/download/${finalName}` };
      if (filename.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i)) {
        const thumbs = await generateThumbnails(filePath);
        if (thumbs) {
          result64.thumbUrl = thumbs.thumbUrl;
          result64.mediumUrl = thumbs.mediumUrl;
        }
      }
      res.json(result64);
    } catch (err) {
      logger.error({ err }, "Base64 upload error");
      res.status(500).json({ error: err.message || "Failed to save upload" });
    }
  });
  const { signMediaUrl: signMediaUrl2, verifyMediaSignature: verifyMediaSignature2 } = await Promise.resolve().then(() => (init_crypto(), crypto_exports));
  app.get("/api/media-sign/:filename", requireAuth, (req, res) => {
    try {
      const filename = path5.basename(req.params.filename);
      const filePath = path5.join(UPLOADS_DIR, filename);
      if (!filePath.startsWith(UPLOADS_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!fs4.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      const { sig, exp } = signMediaUrl2(filename);
      const signedUrl = `/api/media/${filename}?sig=${sig}&exp=${exp}`;
      res.json({ url: signedUrl });
    } catch (err) {
      logger.error({ err }, "[MediaSign] Error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/media/:filename", (req, res) => {
    try {
      const filename = path5.basename(req.params.filename);
      const sig = req.query.sig;
      const exp = parseInt(req.query.exp, 10);
      if (!sig || isNaN(exp)) {
        return res.status(401).json({ error: "Missing signature parameters" });
      }
      if (!verifyMediaSignature2(filename, sig, exp)) {
        return res.status(403).json({ error: "Invalid or expired media signature" });
      }
      const filePath = path5.join(UPLOADS_DIR, filename);
      if (!filePath.startsWith(UPLOADS_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!fs4.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      const stats = fs4.statSync(filePath);
      const ext = path5.extname(filename).toLowerCase();
      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac"
      };
      let contentType = mimeTypes[ext] || "application/octet-stream";
      if (filename.includes("voice_")) {
        contentType = ext === ".mp4" || ext === ".m4a" ? "audio/mp4" : ext === ".ogg" ? "audio/ogg" : "audio/webm";
      } else if (filename.includes("video_note")) {
        contentType = ext === ".mp4" ? "video/mp4" : "video/webm";
      }
      try {
        if (stats.size >= 8) {
          const fd = fs4.openSync(filePath, "r");
          const buffer = Buffer.alloc(12);
          fs4.readSync(fd, buffer, 0, 12, 0);
          fs4.closeSync(fd);
          const isWebm = buffer[0] === 26 && buffer[1] === 69 && buffer[2] === 223 && buffer[3] === 163;
          const isFtyp = buffer[4] === 102 && buffer[5] === 116 && buffer[6] === 121 && buffer[7] === 112 || buffer[0] === 102 && buffer[1] === 116 && buffer[2] === 121 && buffer[3] === 112;
          const isOgg = buffer[0] === 79 && buffer[1] === 103 && buffer[2] === 103 && buffer[3] === 83;
          if (isWebm) {
            contentType = (filename.includes("video_note") || ext === ".webm") && !filename.includes("voice_") ? "video/webm" : "audio/webm";
          } else if (isFtyp) {
            contentType = (filename.includes("video_note") || ext === ".mp4") && !filename.includes("voice_") ? "video/mp4" : "audio/mp4";
          } else if (isOgg) {
            contentType = "audio/ogg";
          }
        }
      } catch (_) {
      }
      res.setHeader("Cache-Control", "private, no-cache");
      res.setHeader("Referrer-Policy", "no-referrer");
      res.setHeader("X-Content-Type-Options", "nosniff");
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        if (start >= stats.size || end >= stats.size) {
          res.setHeader("Content-Range", `bytes */${stats.size}`);
          return res.status(416).json({ error: "Requested Range Not Satisfiable" });
        }
        const chunksize = end - start + 1;
        const fileStream2 = fs4.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": contentType
        });
        fileStream2.pipe(res);
        return;
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", stats.size);
      res.setHeader("Accept-Ranges", "bytes");
      const fileStream = fs4.createReadStream(filePath);
      fileStream.pipe(res);
      fileStream.on("error", (err) => {
        logger.error({ err }, "[Media] File stream error");
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to stream file" });
        }
      });
    } catch (err) {
      logger.error({ err }, "[Media] Error");
      res.status(500).json({ error: err.message || "Media access failed" });
    }
  });
}

// src/middleware/adminAuth.ts
init_auth2();
init_jwtAuth();
import { timingSafeEqual as timingSafeEqual2 } from "crypto";
var requireAdmin = async (req, res, next) => {
  try {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret && typeof adminSecret === "string") {
      const allowedSecrets = [process.env.ADMIN_SECRET, process.env.ADMIN_KEY].filter(
        (s) => typeof s === "string" && s.length > 0
      );
      const a = Buffer.from(adminSecret);
      for (const secret of allowedSecrets) {
        const b = Buffer.from(secret);
        if (a.length === b.length && timingSafeEqual2(a, b)) {
          return next();
        }
      }
    }
    if (req.user && req.user.isAdmin) {
      return next();
    }
    const runAuth = async () => {
      try {
        const uid = req.user?.uid;
        if (!uid) {
          return res.status(401).json({ error: "Not authenticated" });
        }
        const user = await getUserByUid(uid);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }
        const isAdmin2 = user.role === "admin";
        req.user.isAdmin = isAdmin2;
        req.user.role = user.role;
        if (!isAdmin2) {
          return res.status(403).json({ error: "Forbidden: Admin access required" });
        }
        req.adminUser = user;
        next();
      } catch (err) {
        console.error("Admin auth error:", err);
        res.status(500).json({ error: "Admin authentication failed" });
      }
    };
    if (req.user) {
      await runAuth();
    } else {
      requireAuth(req, res, () => {
        runAuth();
      });
    }
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ error: "Admin middleware failed" });
  }
};

// server/routes/admin-users.ts
init_helpers();
init_logger();
import { timingSafeEqual as timingSafeEqual3 } from "crypto";

// server/services/admin-notify.ts
init_logger();
import nodemailer2 from "nodemailer";
import crypto from "crypto";
var ADMIN_EMAIL = "fanikfil@gmail.com";
var adminTokens = /* @__PURE__ */ new Map();
var transporter2 = nodemailer2.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
function isConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}
function generateAdminToken() {
  const token = crypto.randomBytes(32).toString("hex");
  adminTokens.set(token, { createdAt: Date.now(), used: false });
  return token;
}
function consumeAdminToken(token) {
  const entry = adminTokens.get(token);
  if (!entry || entry.used) return false;
  if (Date.now() - entry.createdAt > 15 * 60 * 1e3) {
    adminTokens.delete(token);
    return false;
  }
  entry.used = true;
  return true;
}
function getBaseUrl() {
  const port = process.env.PORT || 4080;
  return `http://localhost:${port}`;
}
function sendAdminEmail(subject, html) {
  if (!isConfigured()) {
    logger.warn("[ADMIN-NOTIFY] SMTP not configured");
    return;
  }
  transporter2.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: ADMIN_EMAIL,
    subject,
    html
  }).catch((err) => {
    logger.error({ err }, "[ADMIN-NOTIFY] Failed to send admin email");
  });
}
function wrapHtml(emoji, title, color, content) {
  const adminToken = generateAdminToken();
  const adminLink = `${getBaseUrl()}?admin_token=${adminToken}`;
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,${color},${color}cc);padding:32px 24px;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px;">${emoji}</div>
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">${title}</h1>
      </div>
      <div style="padding:28px 24px;">
        ${content}
        <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #eee;">
          <p style="font-size:13px;color:#666;margin:0 0 16px;">\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u0432\u0445\u043E\u0434\u0430 \u0432 \u0430\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C:</p>
          <a href="${adminLink}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6C5CE7,#a78bfa);color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;font-size:15px;box-shadow:0 4px 14px rgba(108,92,231,0.4);">
            \u0412\u043E\u0439\u0442\u0438 \u0432 \u0430\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C
          </a>
          <p style="font-size:11px;color:#aaa;margin:12px 0 0;">\u0421\u0441\u044B\u043B\u043A\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 15 \u043C\u0438\u043D\u0443\u0442 \xB7 \u041E\u0434\u043D\u043E\u0440\u0430\u0437\u043E\u0432\u0430\u044F</p>
        </div>
      </div>
      <div style="text-align:center;padding:12px 24px;font-size:11px;color:#bbb;background:#f9f9f9;">QWERcrool Admin Notifications</div>
    </div>
  `;
}
function row(label, value) {
  return `<tr><td style="padding:10px 12px;color:#999;font-size:13px;border-bottom:1px solid #f0f0f0;">${label}</td><td style="padding:10px 12px;font-weight:600;font-size:13px;border-bottom:1px solid #f0f0f0;">${value}</td></tr>`;
}
function notifyReportSubmitted(reporter, target, reason, type) {
  const isMsg = type === "message";
  const html = wrapHtml(
    isMsg ? "\u{1F4E8}" : "\u{1F464}",
    isMsg ? "\u041D\u043E\u0432\u044B\u0439 \u0440\u0435\u043F\u043E\u0440\u0442 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435" : "\u041D\u043E\u0432\u044B\u0439 \u0440\u0435\u043F\u043E\u0440\u0442 \u043D\u0430 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F",
    isMsg ? "#6C5CE7" : "#f59e0b",
    `<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
      ${row("Reporter", reporter)}
      ${row("Target", target)}
      ${row("Reason", reason)}
      ${row("Type", isMsg ? "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435" : "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C")}
      ${row("Time", (/* @__PURE__ */ new Date()).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }))}
    </table>`
  );
  sendAdminEmail(isMsg ? "\u{1F4E8} \u0420\u0435\u043F\u043E\u0440\u0442 \u043D\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435" : "\u{1F464} \u0420\u0435\u043F\u043E\u0440\u0442 \u043D\u0430 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F", html);
}
function notifyAdminAccess(ip, uid) {
  const html = wrapHtml(
    "\u{1F510}",
    "\u0412\u0445\u043E\u0434 \u0432 \u0430\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C",
    "#ef4444",
    `<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
      ${row("IP Address", ip || "unknown")}
      ${row("Time", (/* @__PURE__ */ new Date()).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }))}
    </table>`
  );
  sendAdminEmail("\u{1F510} \u0412\u0445\u043E\u0434 \u0432 \u0430\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C", html);
}

// server/routes/admin-users.ts
async function setupAdminUserRoutes(app) {
  const {
    getAllUsers: getAllUsers2,
    setUserRole: setUserRole2,
    searchUsers: searchUsers2,
    getAllSessions: getAllSessions2,
    revokeUserSession: revokeUserSession2,
    revokeAllUserSessions: revokeAllUserSessions2,
    getStats: getStats2,
    createAuditLog: createAuditLog2
  } = await Promise.resolve().then(() => (init_admin(), admin_exports));
  app.post("/api/auth/verify-admin-token", (req, res) => {
    try {
      const { token } = req.body;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ valid: false, error: "Token is required" });
      }
      const valid = consumeAdminToken(token);
      if (valid) {
        logger.info("[Admin] One-time token used successfully");
        notifyAdminAccess(req.ip || req.socket?.remoteAddress, void 0);
      } else {
        logger.warn("[Admin] Invalid or expired one-time token");
      }
      res.json({ valid });
    } catch (err) {
      logger.error({ err }, "[Admin] Verify token error");
      res.status(500).json({ valid: false, error: "Internal server error" });
    }
  });
  app.post("/api/admin/verify-panel-hash", adminPanelHashRateLimit, (req, res) => {
    try {
      const { hash } = req.body;
      if (!hash || typeof hash !== "string") {
        return res.status(400).json({ valid: false, error: "Hash is required" });
      }
      const expectedHash = process.env.VITE_ADMIN_PANEL_HASH;
      if (!expectedHash) {
        logger.error("[Admin Panel] VITE_ADMIN_PANEL_HASH is not set in environment");
        return res.status(500).json({ valid: false, error: "Server configuration error" });
      }
      if (hash.length !== expectedHash.length) {
        res.json({ valid: false });
        return;
      }
      const isValid = timingSafeEqual3(
        Buffer.from(hash, "utf8"),
        Buffer.from(expectedHash, "utf8")
      );
      if (!isValid) {
        logger.warn(`[Admin Panel] Invalid hash attempt from IP: ${req.ip || req.socket?.remoteAddress}`);
      } else {
        notifyAdminAccess(req.ip || req.socket?.remoteAddress, void 0);
      }
      res.json({ valid: isValid });
    } catch (err) {
      logger.error({ err }, "[Admin Panel] Verify hash error");
      res.status(500).json({ valid: false, error: "Internal server error" });
    }
  });
  app.get("/api/admin/check-auth", requireAdmin, async (req, res) => {
    res.json({ ok: true });
  });
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await getStats2();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const usersList = await getAllUsers2();
      res.json(usersList);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/users/:uid/role", requireAdmin, validate(UserRoleSchema), async (req, res) => {
    try {
      const { uid } = req.params;
      const { role } = req.body;
      const updated = await setUserRole2(uid, role);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/users/:uid", requireAdmin, async (req, res) => {
    try {
      const { uid } = req.params;
      const result = await deleteUserCompletely(uid);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/users/search", requireAdmin, async (req, res) => {
    try {
      const q = req.query.q || "";
      if (!q.trim()) return res.json([]);
      const results = await searchUsers2(q);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/users/:uid/role-audit", requireAdmin, async (req, res) => {
    try {
      const targetUid = req.params.uid;
      const { role } = req.body;
      if (!role || !["user", "admin", "banned"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      const result = await setUserRole2(targetUid, role);
      const adminUid = req.user?.uid || req.adminUser?.uid || "admin-secret";
      await createAuditLog2("role_change", adminUid, `Changed role to ${role}`, targetUid);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/users/:uid/audit", requireAdmin, async (req, res) => {
    try {
      const targetUid = req.params.uid;
      await deleteUserCompletely(targetUid);
      const adminUid = req.user?.uid || req.adminUser?.uid || "admin-secret";
      await createAuditLog2("user_delete", adminUid, "Deleted user", targetUid);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/sessions", requireAdmin, async (req, res) => {
    try {
      const sessions2 = await getAllSessions2();
      res.json(sessions2);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/sessions/:sessionUid", requireAdmin, async (req, res) => {
    try {
      await revokeUserSession2(req.params.sessionUid);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/users/:uid/sessions", requireAdmin, async (req, res) => {
    try {
      const { getUserByUid: getU } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getU(req.params.uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      await revokeAllUserSessions2(user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/admin-messages.ts
async function setupAdminMessageRoutes(app) {
  const {
    getRecentMessages: getRecentMessages2,
    flagMessage: flagMessage2,
    deleteMessageAdmin: deleteMessageAdmin2,
    searchMessages: searchMessages3,
    getAllChats: getAllChats2,
    deleteAllChatMessages: deleteAllChatMessages2,
    getStickerPacks: getStickerPacks3,
    deleteStickerPack: deleteStickerPack2
  } = await Promise.resolve().then(() => (init_admin(), admin_exports));
  app.get("/api/admin/messages", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const msgs = await getRecentMessages2(limit, offset);
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/messages/:msgId/flag", requireAdmin, validate(MessageFlagSchema), async (req, res) => {
    try {
      const { msgId } = req.params;
      const { flag } = req.body;
      const updated = await flagMessage2(msgId, flag ?? null);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/messages/:msgId", requireAdmin, async (req, res) => {
    try {
      const { msgId } = req.params;
      const deleted = await deleteMessageAdmin2(msgId);
      res.json({ deleted: !!deleted });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/messages/search", requireAdmin, async (req, res) => {
    try {
      const q = req.query.q || "";
      if (!q.trim()) return res.json([]);
      const results = await searchMessages3(q);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/chats", requireAdmin, async (req, res) => {
    try {
      const chatsList = await getAllChats2();
      res.json(chatsList);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/chats/:chatId", requireAdmin, async (req, res) => {
    try {
      const { chatId } = req.params;
      const { deleteChatCompletely: deleteChatCompletely2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      const result = await deleteChatCompletely2(chatId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/chats/:chatId/messages", requireAdmin, async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      if (isNaN(chatId)) return res.status(400).json({ error: "Invalid chat id" });
      const count2 = await deleteAllChatMessages2(chatId);
      res.json({ deleted: count2 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/sticker-packs", requireAdmin, async (req, res) => {
    try {
      const packs = await getStickerPacks3();
      res.json(packs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/sticker-packs/:id", requireAdmin, async (req, res) => {
    try {
      const packId = parseInt(req.params.id);
      if (isNaN(packId)) return res.status(400).json({ error: "Invalid pack id" });
      await deleteStickerPack2(packId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/admin-reports.ts
init_logger();
async function setupAdminReportRoutes(app) {
  const {
    getDetailedStats: getDetailedStats2,
    broadcastMessage: broadcastMessage2,
    getAuditLogs: getAuditLogs2,
    getAuditLogsCount: getAuditLogsCount2,
    createAuditLog: createAuditLog2,
    getReports: getReports3,
    resolveReportWithNotification: resolveReportWithNotification3,
    getUserReports: getUserReports3,
    resolveUserReportWithNotification: resolveUserReportWithNotification3,
    dismissUserReport: dismissUserReport3,
    sendAdminMessageToUser: sendAdminMessageToUser2
  } = await Promise.resolve().then(() => (init_admin(), admin_exports));
  app.get("/api/admin/stats/detailed", requireAdmin, async (req, res) => {
    try {
      const stats = await getDetailedStats2();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/reports", requireAdmin, async (req, res) => {
    try {
      const reports2 = await getReports3();
      res.json(reports2);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/reports/:id/resolve", requireAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) return res.status(400).json({ error: "Invalid report id" });
      const result = await resolveReportWithNotification3(reportId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/user-reports", requireAdmin, async (req, res) => {
    try {
      const reports2 = await getUserReports3();
      res.json(reports2);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/user-reports/:id/resolve", requireAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) return res.status(400).json({ error: "Invalid report id" });
      const { adminNote } = req.body;
      const result = await resolveUserReportWithNotification3(reportId, adminNote);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/user-reports/:id/dismiss", requireAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) return res.status(400).json({ error: "Invalid report id" });
      const result = await dismissUserReport3(reportId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/broadcast", requireAdmin, async (req, res) => {
    try {
      const { text: text3 } = req.body;
      if (!text3 || typeof text3 !== "string" || !text3.trim()) {
        return res.status(400).json({ error: "Text is required" });
      }
      const senderUid = req.user?.uid || req.adminUser?.uid || "admin";
      const result = await broadcastMessage2(text3, senderUid);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/send-message", requireAdmin, async (req, res) => {
    try {
      const { target, text: text3 } = req.body;
      if (!target || typeof target !== "string" || !target.trim()) {
        return res.status(400).json({ error: "Target (uid \u0438\u043B\u0438 @username) \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D" });
      }
      if (!text3 || typeof text3 !== "string" || !text3.trim()) {
        return res.status(400).json({ error: "\u0422\u0435\u043A\u0441\u0442 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D" });
      }
      const senderUid = req.user?.uid || req.adminUser?.uid;
      const result = await sendAdminMessageToUser2(target.trim(), text3.trim(), senderUid);
      res.json(result);
    } catch (err) {
      logger.error({ err }, "[Admin] Send message error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/audit-logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      const logs = await getAuditLogs2(limit, offset);
      const total = await getAuditLogsCount2();
      res.json({ logs, total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/audit-logs", requireAdmin, async (req, res) => {
    try {
      const { action, details, targetUid } = req.body;
      if (!action) return res.status(400).json({ error: "Action is required" });
      const adminUid = req.user?.uid || req.adminUser?.uid || "admin-secret";
      await createAuditLog2(action, adminUid, details, targetUid);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/admin.ts
async function setupAdminRoutes(app) {
  await setupAdminUserRoutes(app);
  await setupAdminMessageRoutes(app);
  await setupAdminReportRoutes(app);
}

// server/routes/push.ts
init_jwtAuth();
init_logger();
init_push();
function setupPushRoutes(app) {
  app.get("/api/push/vapid-key", (req, res) => {
    res.json({ publicKey: getVapidPublicKey() });
  });
  app.post("/api/push/subscribe", requireAuth, validate(PushSubscribeSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { subscription, userAgent } = req.body;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await saveSubscription(user.id, subscription.endpoint, subscription, userAgent);
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Subscribe error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/push/unsubscribe", requireAuth, validate(PushUnsubscribeSchema), async (req, res) => {
    try {
      const { endpoint } = req.body;
      await removeSubscription(endpoint);
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Unsubscribe error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/push/validate", requireAuth, async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ valid: false, error: "Missing endpoint" });
      }
      const { validateSubscriptionExists: validateSubscriptionExists2 } = await Promise.resolve().then(() => (init_push(), push_exports));
      const exists = await validateSubscriptionExists2(endpoint);
      res.json({ valid: exists });
    } catch (err) {
      logger.error({ err }, "Validate subscription error");
      res.json({ valid: true });
    }
  });
}

// server/routes/calls.ts
init_jwtAuth();
import { randomUUID as randomUUID7 } from "crypto";
init_logger();

// server/services/call-store.ts
await init_redis();
import { randomUUID as randomUUID6 } from "crypto";
var SIGNALS_KEY = "call:signals";
var DELIVERED_PREFIX = "call:delivered:";
var USER_SIGNALS_PREFIX = "call:user:";
async function addCallSignal(signal) {
  const redis2 = getRedis();
  if (!signal.id) signal.id = randomUUID6();
  if (!signal.timestamp) signal.timestamp = Date.now();
  const json = JSON.stringify(signal);
  if (redis2.zAdd) {
    await redis2.zAdd(SIGNALS_KEY, { score: signal.timestamp, value: json });
    await redis2.sAdd(`${USER_SIGNALS_PREFIX}${signal.fromUid}`, signal.id);
    await redis2.sAdd(`${USER_SIGNALS_PREFIX}${signal.toUid}`, signal.id);
  } else {
    await redis2.lpush(SIGNALS_KEY, json);
  }
}
async function getSignalsForUser(uid) {
  const redis2 = getRedis();
  const now = Date.now();
  const maxAge = 3e4;
  if (redis2.zRangeByScore) {
    const raw = await redis2.zRangeByScore(SIGNALS_KEY, String(now - maxAge), String(now));
    return raw.map((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    }).filter((s) => s && (s.toUid === uid || s.fromUid === uid));
  }
  const all = await redis2.lrange(SIGNALS_KEY, 0, -1);
  return all.map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }).filter((s) => s && (s.toUid === uid || s.fromUid === uid) && now - s.timestamp < maxAge);
}
async function cleanOldSignals(maxAge = 3e4) {
  const redis2 = getRedis();
  const cutoff = Date.now() - maxAge;
  if (redis2.zRemRangeByScore) {
    await redis2.zRemRangeByScore(SIGNALS_KEY, "-inf", String(cutoff));
  }
}
async function removeUserCallSignals(uid) {
  const redis2 = getRedis();
  await redis2.del(`${DELIVERED_PREFIX}${uid}`);
  await redis2.del(`${USER_SIGNALS_PREFIX}${uid}`);
}

// server/routes/calls.ts
function setupCallRoutes(app) {
  app.post("/api/calls/test-signal", requireAuth, validate(CallSignalSchema), async (req, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { toUid, type, data, isVideo, fromName, fromAvatar } = req.body || {};
      if (!toUid || !type) {
        return res.status(400).json({ error: "toUid and type are required" });
      }
      const signal = {
        id: randomUUID7(),
        fromUid: String(uid),
        fromName: fromName || req.user?.uid || "User",
        fromAvatar: fromAvatar || "",
        toUid: String(toUid),
        type: String(type),
        isVideo: !!isVideo,
        data: data || null,
        timestamp: Date.now()
      };
      const allSignals = await getSignalsForUser(String(uid));
      if (allSignals.length > 1e4) {
        await removeUserCallSignals(String(uid));
        logger.warn(`[Calls][test-signal] Signal limit exceeded for ${uid}, cleared`);
        return res.status(429).json({ error: "Too many pending signals, cleared." });
      }
      await addCallSignal(signal);
      return res.json({ ok: true, signal });
    } catch (err) {
      logger.error({ err }, "[Calls][test-signal] Error");
      return res.status(500).json({ error: "Failed to store test signal" });
    }
  });
  app.post("/api/calls/signal", requireAuth, validate(CallSignalSchema), async (req, res) => {
    try {
      const fromUid = req.user.uid;
      const { toUid, type, isVideo, data, fromName, fromAvatar } = req.body;
      const checkSignals = await getSignalsForUser(fromUid);
      if (checkSignals.length > 1e4) {
        await removeUserCallSignals(fromUid);
        logger.warn(`[Call] Signal limit exceeded for ${fromUid}, cleared`);
        return res.status(429).json({ error: "Too many pending signals, cleared." });
      }
      const signal = {
        id: randomUUID7(),
        fromUid,
        fromName: fromName || req.user?.uid || "User",
        fromAvatar: fromAvatar || "",
        toUid,
        type: type || "offer",
        isVideo: !!isVideo,
        data,
        timestamp: Date.now()
      };
      await addCallSignal(signal);
      await cleanOldSignals(3e4);
      const allSignals = await getSignalsForUser(fromUid);
      logger.info(`[Call] Signal from ${fromUid} (${signal.fromName}) to ${toUid}, type: ${type}, total signals: ${allSignals.length}`);
      res.json({ success: true, signalId: signal.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      logger.error({ err }, "[Call] Signal error");
      res.status(500).json({ error: msg });
    }
  });
  app.get("/api/calls/poll", requireAuth, async (req, res) => {
    try {
      const myUid = String(req.user.uid);
      const since = parseInt(req.query.since) || 0;
      const now = Date.now();
      await cleanOldSignals(3e4);
      const mySignals = await getSignalsForUser(myUid);
      const filtered = mySignals.filter((s) => {
        if (String(s.toUid) !== myUid) return false;
        if (s.type === "offer") {
          return now - s.timestamp < 25e3;
        }
        const minTimestamp = since > 0 ? Math.max(0, since - 1e4) : now - 15e3;
        return s.timestamp >= minTimestamp;
      });
      logger.info(`[Call] Poll from ${myUid}, since: ${since}, returned signals: ${filtered.length}`);
      if (filtered.length > 0) {
        filtered.forEach((s, i) => {
          logger.info(`[Call]   Signal ${i}: type=${s.type}, from=${s.fromUid} (${s.fromName}), to=${s.toUid}`);
        });
      }
      res.json({ signals: filtered, now });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      logger.error({ err }, "[Call] Poll error");
      res.status(500).json({ error: msg });
    }
  });
  app.post("/api/calls/clear", requireAuth, async (req, res) => {
    try {
      const myUid = req.user.uid;
      await removeUserCallSignals(myUid);
      res.json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: msg });
    }
  });
}

// server/routes/qr.ts
init_jwtAuth();
import { randomUUID as randomUUID8 } from "crypto";
init_auth2();
init_auth();
init_sessions();
init_config();

// server/services/qr-store.ts
init_config();
await init_redis();
var PREFIX2 = "qr:";
var TTL_SECONDS = Math.ceil(QR_TOKEN_TTL / 1e3) + 60;
async function getQrToken(token) {
  const redis2 = getRedis();
  const raw = await redis2.get(`${PREFIX2}${token}`);
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return void 0;
  }
}
async function setQrToken(token, entry) {
  const redis2 = getRedis();
  await redis2.set(`${PREFIX2}${token}`, JSON.stringify(entry), "EX", TTL_SECONDS);
}
async function updateQrToken(token, updates) {
  const redis2 = getRedis();
  const raw = await redis2.get(`${PREFIX2}${token}`);
  if (!raw) return;
  try {
    const entry = JSON.parse(raw);
    Object.assign(entry, updates);
    await redis2.set(`${PREFIX2}${token}`, JSON.stringify(entry), "EX", TTL_SECONDS);
  } catch {
  }
}
async function deleteQrToken(token) {
  const redis2 = getRedis();
  await redis2.del(`${PREFIX2}${token}`);
}

// server/routes/qr.ts
init_logger();
function deviceInfoToUserAgent(deviceInfo) {
  return `QWERcrool QR Login (${deviceInfo})`;
}
function setupQrRoutes(app) {
  app.get("/api/qr/generate", qrGenerateRateLimit, async (req, res) => {
    try {
      const token = randomUUID8();
      await setQrToken(token, { token, created: Date.now(), status: "pending" });
      logger.info("[QR] Generated QR token (public)");
      res.json({ token, expiresIn: QR_TOKEN_TTL });
    } catch (err) {
      logger.error({ err }, "[QR] Generate error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/qr/status/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const entry = await getQrToken(token);
      if (!entry) {
        return res.json({ status: "expired" });
      }
      if (Date.now() - entry.created > QR_TOKEN_TTL) {
        await deleteQrToken(token);
        return res.json({ status: "expired" });
      }
      const result = {
        status: entry.status,
        scannedBy: entry.scannedBy,
        deviceInfo: entry.deviceInfo,
        remainingMs: QR_TOKEN_TTL - (Date.now() - entry.created)
      };
      if (entry.status === "confirmed" && entry.loginToken) {
        result.loginToken = entry.loginToken;
        result.refreshToken = entry.loginRefreshToken;
      }
      res.json(result);
    } catch (err) {
      logger.error({ err }, "[QR] Status check error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/qr/scan", requireAuth, validate(QrScanSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { token, deviceInfo } = req.body;
      const entry = await getQrToken(token);
      if (!entry) {
        return res.status(404).json({ error: "QR code not found or expired" });
      }
      if (Date.now() - entry.created > QR_TOKEN_TTL) {
        await deleteQrToken(token);
        return res.status(410).json({ error: "QR code expired" });
      }
      if (entry.status !== "pending") {
        return res.status(409).json({ error: "QR code already used" });
      }
      await updateQrToken(token, { status: "scanned", scannedBy: uid, deviceInfo: deviceInfo || "Unknown device" });
      logger.info(`[QR] QR scanned by ${uid}, waiting for confirmation`);
      res.json({ success: true, status: "scanned" });
    } catch (err) {
      logger.error({ err }, "[QR] Scan error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/qr/confirm", requireAuth, validate(QrConfirmSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { token, approved } = req.body;
      const entry = await getQrToken(token);
      if (!entry) {
        return res.status(404).json({ error: "QR code not found or expired" });
      }
      if (entry.status !== "scanned") {
        return res.status(400).json({ error: "QR code not in scanned state" });
      }
      if (entry.scannedBy !== uid) {
        return res.status(403).json({ error: "Only the scanner can confirm" });
      }
      if (approved) {
        const userAgent = deviceInfoToUserAgent(entry.deviceInfo || "");
        const { sessionUid } = await createSession({ userUid: uid, userAgent, ipAddress: null });
        const user = await getUserByUid(uid);
        if (!user) return res.status(404).json({ error: "User not found" });
        const newToken = signJwt(user, sessionUid);
        const refreshToken = signRefreshJwt(user, sessionUid);
        try {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn) {
            broadcastFn([uid], {
              type: "qr_login_confirmed",
              qrToken: token,
              loginToken: newToken,
              refreshToken
            });
          }
        } catch {
        }
        await updateQrToken(token, { status: "confirmed", confirmedBy: uid, loginToken: newToken, loginRefreshToken: refreshToken });
        logger.info(`[QR] QR login confirmed for ${uid}, tokens stored for desktop polling`);
        res.json({ success: true, token: newToken, refreshToken });
      } else {
        try {
          const broadcastFn = globalThis.__broadcastStatusUpdate;
          if (broadcastFn) {
            broadcastFn([uid], { type: "qr_login_rejected", qrToken: token });
          }
        } catch {
        }
        await deleteQrToken(token);
        res.json({ success: false });
      }
    } catch (err) {
      logger.error({ err }, "[QR] Confirm error");
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/sessions.ts
init_jwtAuth();
init_sessions();
init_logger();
function setupSessionRoutes(app) {
  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const sessionsList = await getUserSessions(uid);
      const currentSessionUid = req.user.sessionUid;
      res.json({ sessions: sessionsList, currentSessionUid });
    } catch (err) {
      logger.error({ err }, "Get sessions error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/sessions/:sessionUid/revoke", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { sessionUid } = req.params;
      if (sessionUid === req.user.sessionUid) {
        return res.status(400).json({ error: "Cannot revoke current session" });
      }
      const revoked = await revokeSession(sessionUid, uid);
      if (!revoked) {
        return res.status(404).json({ error: "Session not found or already revoked" });
      }
      try {
        const broadcastFn = globalThis.__broadcastStatusUpdate;
        if (broadcastFn) {
          broadcastFn([uid], { type: "session_revoked", sessionUid });
        }
      } catch (broadcastErr) {
        logger.warn({ err: broadcastErr }, "[Sessions] Broadcast revoke failed");
      }
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "Revoke session error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/sessions/revoke-all-others", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const currentSessionUid = req.user.sessionUid;
      if (!currentSessionUid) {
        return res.status(400).json({ error: "Current session not identified" });
      }
      const count2 = await revokeAllOtherSessions(currentSessionUid, uid);
      try {
        const broadcastFn = globalThis.__broadcastStatusUpdate;
        if (broadcastFn) {
          broadcastFn([uid], { type: "all_other_sessions_revoked" });
        }
      } catch (broadcastErr) {
        logger.warn({ err: broadcastErr }, `[Sessions] Broadcast revoke-all failed`);
      }
      res.json({ success: true, revokedCount: count2 });
    } catch (err) {
      logger.error({ err }, "Revoke all sessions error");
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/bots.ts
init_jwtAuth();
init_logger();
init_db();
init_config();
import { createHash as createHash2, createHmac as createHmac2, randomBytes as randomBytes3, timingSafeEqual as timingSafeEqual4 } from "crypto";
import { pgTable as pgTable2, text as text2, timestamp as timestamp2, integer as integer2, boolean as boolean2, jsonb as jsonb2, index as index2 } from "drizzle-orm/pg-core";
import { eq as eq7, sql as sql3 } from "drizzle-orm";
var botsTable = pgTable2(
  "bots",
  {
    id: integer2("id").primaryKey().generatedAlwaysAsIdentity(),
    ownerUid: text2("owner_uid").notNull(),
    username: text2("username").unique().notNull(),
    displayName: text2("display_name").notNull(),
    description: text2("description").default(""),
    avatar: text2("avatar").default(""),
    tokenHash: text2("token_hash").notNull(),
    tokenPrefix: text2("token_prefix").notNull(),
    webhookUrl: text2("webhook_url").default(""),
    privacyMode: boolean2("privacy_mode").default(true),
    isActive: boolean2("is_active").default(true),
    botPermissions: jsonb2("bot_permissions").default(["send_messages", "read_messages"]),
    createdAt: timestamp2("created_at").defaultNow(),
    updatedAt: timestamp2("updated_at").defaultNow()
  },
  (table) => [
    index2("idx_bots_owner_uid_drizzle").on(table.ownerUid),
    index2("idx_bots_token_hash_drizzle").on(table.tokenHash)
  ]
);
var safeBotFields = {
  id: botsTable.id,
  ownerUid: botsTable.ownerUid,
  username: botsTable.username,
  displayName: botsTable.displayName,
  description: botsTable.description,
  avatar: botsTable.avatar,
  tokenPrefix: botsTable.tokenPrefix,
  webhookUrl: botsTable.webhookUrl,
  privacyMode: botsTable.privacyMode,
  isActive: botsTable.isActive,
  botPermissions: botsTable.botPermissions,
  createdAt: botsTable.createdAt,
  updatedAt: botsTable.updatedAt
};
var tableInitialized = false;
async function ensureBotsTable() {
  if (tableInitialized) return;
  try {
    await db.execute(sql3`
      CREATE TABLE IF NOT EXISTS bots (
        id SERIAL PRIMARY KEY,
        owner_uid TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        token_hash TEXT NOT NULL,
        token_prefix TEXT NOT NULL,
        webhook_url TEXT DEFAULT '',
        privacy_mode BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        bot_permissions JSONB DEFAULT '["send_messages", "read_messages"]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    try {
      await db.execute(sql3`CREATE INDEX IF NOT EXISTS idx_bots_owner_uid_drizzle ON bots(owner_uid)`);
      await db.execute(sql3`CREATE INDEX IF NOT EXISTS idx_bots_token_hash_drizzle ON bots(token_hash)`);
    } catch {
    }
    tableInitialized = true;
  } catch (err) {
    logger.warn({ err }, "[Bots] Notice: Auto-ensure bots table encountered an error");
  }
}
function generateBotToken(botId) {
  const secret = randomBytes3(32).toString("hex");
  return botId !== void 0 ? `${botId}:${secret}` : secret;
}
function extractTokenPrefix(token) {
  if (!token) return "";
  if (token.includes(":")) {
    return token.split(":")[0];
  }
  return token.substring(0, 10);
}
function hashBotToken(token) {
  return createHash2("sha256").update(token.trim()).digest("hex");
}
async function verifyBotToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }
  const cleanToken = token.trim();
  if (cleanToken.length < 16) {
    return null;
  }
  const tokenHash = hashBotToken(cleanToken);
  return getBotByTokenHash(tokenHash);
}
async function getBotByTokenHash(tokenHash) {
  if (!tokenHash || typeof tokenHash !== "string") {
    return null;
  }
  const cleanHash = tokenHash.trim();
  if (!cleanHash) return null;
  await ensureBotsTable();
  try {
    const rows = await db.select({
      ...safeBotFields,
      tokenHash: botsTable.tokenHash
    }).from(botsTable).where(eq7(botsTable.tokenHash, cleanHash));
    if (!rows || rows.length === 0) {
      return null;
    }
    const bot = rows[0];
    try {
      const bufGiven = Buffer.from(cleanHash, "hex");
      const bufStored = Buffer.from(bot.tokenHash, "hex");
      if (bufGiven.length !== bufStored.length || !timingSafeEqual4(bufGiven, bufStored)) {
        return null;
      }
    } catch {
      if (bot.tokenHash !== cleanHash) {
        return null;
      }
    }
    const { tokenHash: _th, ...safeBot } = bot;
    return safeBot;
  } catch (err) {
    logger.error({ err }, "[Bots] Error fetching bot by token hash");
    return null;
  }
}
async function getBotById(botId) {
  if (typeof botId !== "number" || isNaN(botId) || botId <= 0) {
    return null;
  }
  await ensureBotsTable();
  try {
    const rows = await db.select(safeBotFields).from(botsTable).where(eq7(botsTable.id, botId));
    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (err) {
    logger.error({ err }, "[Bots] Error fetching bot by ID");
    return null;
  }
}
async function getBotsByOwner(ownerUid) {
  if (!ownerUid || typeof ownerUid !== "string") {
    return [];
  }
  await ensureBotsTable();
  try {
    const rows = await db.select(safeBotFields).from(botsTable).where(eq7(botsTable.ownerUid, ownerUid));
    return rows || [];
  } catch (err) {
    logger.error({ err }, "[Bots] Error fetching bots by owner");
    return [];
  }
}
function setupBotRoutes(app) {
  ensureBotsTable().catch(() => {
  });
  app.get("/api/bots", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const botsList = await getBotsByOwner(uid);
      res.json(botsList);
    } catch (err) {
      logger.error({ err }, "[API] /api/bots error");
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.post("/api/bots", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { username, displayName, description, avatar, webhookUrl, botPermissions } = req.body || {};
      if (!username || typeof username !== "string" || !username.trim()) {
        res.status(400).json({ error: "username is required" });
        return;
      }
      if (!displayName || typeof displayName !== "string" || !displayName.trim()) {
        res.status(400).json({ error: "displayName is required" });
        return;
      }
      await ensureBotsTable();
      const rawToken = generateBotToken();
      const tokenHash = hashBotToken(rawToken);
      const tokenPrefix = extractTokenPrefix(rawToken);
      const inserted = await db.insert(botsTable).values({
        ownerUid: uid,
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        description: typeof description === "string" ? description.trim() : "",
        avatar: typeof avatar === "string" ? avatar.trim() : "",
        tokenHash,
        tokenPrefix,
        webhookUrl: typeof webhookUrl === "string" ? webhookUrl.trim() : "",
        botPermissions: botPermissions || ["send_messages", "read_messages"]
      }).returning();
      if (!inserted || inserted.length === 0) {
        res.status(500).json({ error: "Failed to create bot" });
        return;
      }
      const { tokenHash: _th, ...safeBot } = inserted[0];
      res.status(201).json({
        bot: safeBot,
        token: rawToken
      });
    } catch (err) {
      logger.error({ err }, "[API] POST /api/bots error");
      if (err?.code === "23505") {
        res.status(409).json({ error: "Bot username already exists" });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.get("/api/bots/token/:token", requireAuth, async (req, res) => {
    try {
      const { token } = req.params;
      const bot = await verifyBotToken(token);
      if (!bot) {
        res.status(404).json({ error: "Bot not found or invalid token" });
        return;
      }
      res.json(bot);
    } catch (err) {
      logger.error({ err }, "[API] /api/bots/token/:token error");
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.get("/api/bots/by-hash", requireAuth, async (req, res) => {
    try {
      const tokenHash = req.headers["x-token-hash"];
      if (!tokenHash) {
        res.status(400).json({ error: "Missing X-Token-Hash header" });
        return;
      }
      const bot = await getBotByTokenHash(tokenHash);
      if (!bot) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }
      res.json(bot);
    } catch (err) {
      logger.error({ err }, "[API] /api/bots/by-hash error");
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.get("/api/bots/id/:botId", requireAuth, async (req, res) => {
    try {
      const botId = parseInt(req.params.botId, 10);
      if (isNaN(botId)) {
        res.status(400).json({ error: "Invalid bot ID" });
        return;
      }
      const bot = await getBotById(botId);
      if (!bot) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }
      res.json(bot);
    } catch (err) {
      logger.error({ err }, "[API] /api/bots/id/:botId error");
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.post("/api/bots/id/:botId/token", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const botId = parseInt(req.params.botId, 10);
      if (isNaN(botId)) {
        res.status(400).json({ error: "Invalid bot ID" });
        return;
      }
      await ensureBotsTable();
      const existing = await db.select().from(botsTable).where(eq7(botsTable.id, botId));
      if (!existing || existing.length === 0) {
        res.status(404).json({ error: "Bot not found" });
        return;
      }
      if (existing[0].ownerUid !== uid && req.user?.role !== "admin") {
        res.status(403).json({ error: "Access denied" });
        return;
      }
      const rawToken = generateBotToken(botId);
      const tokenHash = hashBotToken(rawToken);
      const tokenPrefix = extractTokenPrefix(rawToken);
      const updated = await db.update(botsTable).set({
        tokenHash,
        tokenPrefix,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq7(botsTable.id, botId)).returning();
      if (!updated || updated.length === 0) {
        res.status(500).json({ error: "Failed to update bot token" });
        return;
      }
      const { tokenHash: _th, ...safeBot } = updated[0];
      res.json({
        bot: safeBot,
        token: rawToken
      });
    } catch (err) {
      logger.error({ err }, "[API] /api/bots/id/:botId/token error");
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

// server/routes/reports.ts
init_jwtAuth();
init_admin();
function setupReportRoutes(app) {
  app.post("/api/reports", requireAuth, validate(ReportSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { messageId, reason } = req.body;
      const { getUserByUid: getUserByUid2 } = await Promise.resolve().then(() => (init_auth2(), auth_exports));
      const user = await getUserByUid2(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { msgUid } = req.body;
      const report = await createReport(parseInt(messageId), user.id, reason, msgUid);
      notifyReportSubmitted(uid, `msg:${msgUid || messageId}`, reason, "message");
      res.json(report);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/blocks", requireAuth, validate(BlockSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { blockedUid } = req.body;
      if (uid === blockedUid) return res.status(400).json({ error: "Cannot block yourself" });
      const result = await blockUser(uid, blockedUid);
      res.json({ success: true, block: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/blocks/:blockedUid", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const blockedUid = req.params.blockedUid;
      const result = await unblockUser(uid, blockedUid);
      res.json({ success: true, block: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/blocks", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const blocked = await getBlockedUsers(uid);
      res.json(blocked);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/blocks/check/:otherUid", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const otherUid = req.params.otherUid;
      const direction = await getBlockDirection(uid, otherUid);
      res.json({ direction });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/user-reports", requireAuth, validate(UserReportSchema), async (req, res) => {
    try {
      const uid = req.user.uid;
      const { targetUid, reason, description } = req.body;
      if (uid === targetUid) return res.status(400).json({ error: "Cannot report yourself" });
      const result = await createUserReport(targetUid, uid, reason, description);
      notifyReportSubmitted(uid, targetUid, reason, "user");
      res.json({ success: true, report: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/themes.ts
init_jwtAuth();
import { randomBytes as randomBytes4 } from "crypto";
init_logger();
function setupThemeRoutes(app) {
  app.post("/api/themes/share", requireAuth, validate(ThemeShareSchema), async (req, res) => {
    try {
      const uid = req.user?.uid;
      const { themeData, creatorUsername } = req.body;
      let shareId = randomBytes4(4).toString("hex").substring(0, 6);
      const { db: db2, ensureDbReady: ensureDbReady2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sharedThemes: sharedThemes2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      await ensureDbReady2();
      await db2.insert(sharedThemes2).values({
        shareId,
        themeData,
        creatorUid: uid || null,
        creatorUsername: creatorUsername || null
      });
      res.json({ shareId, url: `/theme/${shareId}` });
    } catch (err) {
      logger.error({ err }, "Share theme error");
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/themes/share/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;
      if (!shareId) {
        return res.status(400).json({ error: "shareId is required" });
      }
      const { db: db2, ensureDbReady: ensureDbReady2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sharedThemes: sharedThemes2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      await ensureDbReady2();
      const results = await db2.select().from(sharedThemes2).where(eq11(sharedThemes2.shareId, shareId)).limit(1);
      if (results.length === 0) {
        return res.status(404).json({ error: "Theme not found" });
      }
      const row2 = results[0];
      res.json({
        shareId: row2.shareId,
        themeData: typeof row2.themeData === "string" ? JSON.parse(row2.themeData) : row2.themeData,
        creatorUid: row2.creatorUid,
        creatorUsername: row2.creatorUsername,
        createdAt: row2.createdAt
      });
    } catch (err) {
      logger.error({ err, cause: err?.cause }, "Get shared theme detailed error:");
      res.status(500).json({ error: err.message, cause: err?.cause?.message || err?.cause });
    }
  });
}

// server/routes/gifs.ts
init_logger();
function setupGifRoutes(app) {
  app.get("/api/gifs/search", async (req, res) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const limit = 30;
      const TENOR_KEY = process.env.TENOR_API_KEY || "";
      if (TENOR_KEY) {
        try {
          const tenorUrl = q ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&client_key=qwer_app&limit=${limit}&media_filter=gif,tinygif` : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&client_key=qwer_app&limit=${limit}&media_filter=gif,tinygif`;
          const tenorRes = await fetch(tenorUrl);
          if (tenorRes.ok) {
            const data = await tenorRes.json();
            const gifs = (data.results || []).map((item) => {
              const formats = item.media_formats || {};
              const gifUrl = formats.gif?.url || formats.mediumgif?.url || formats.tinygif?.url || "";
              const previewUrl = formats.tinygif?.url || gifUrl;
              return { id: item.id || String(Math.random()), title: item.title || item.content_description || "GIF", url: gifUrl, preview: previewUrl };
            }).filter((g) => !!g.url);
            if (gifs.length > 0) return res.json(gifs);
          }
        } catch (err) {
          logger.warn({ err: err?.message }, "[GIFs] Tenor fallback:");
        }
      }
      const GIPHY_KEY = process.env.GIPHY_API_KEY;
      if (!GIPHY_KEY) logger.warn("\u26A0\uFE0F GIPHY_API_KEY \u043D\u0435 \u0437\u0430\u0434\u0430\u043D \u2014 GIPHY \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B");
      if (GIPHY_KEY) try {
        const giphyUrl = q ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&limit=${limit}&q=${encodeURIComponent(q)}&rating=g` : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=${limit}&rating=g`;
        const giphyRes = await fetch(giphyUrl);
        if (giphyRes.ok) {
          const data = await giphyRes.json();
          const gifs = (data.data || []).map((item) => ({
            id: item.id,
            title: item.title || "GIF",
            url: item.images?.original?.url || "",
            preview: item.images?.fixed_width_small_still?.url || item.images?.fixed_width?.url || ""
          })).filter((g) => !!g.url);
          return res.json(gifs);
        }
      } catch (err) {
        logger.warn({ err: err?.message }, "[GIFs] GIPHY fallback error:");
      }
      const fallbackGifs = [
        { id: "1", title: "Cat Dance", url: "https://i.giphy.com/GeimqsH0TLDt4tScGw.gif", preview: "https://i.giphy.com/GeimqsH0TLDt4tScGw.gif" },
        { id: "2", title: "Popcorn", url: "https://i.giphy.com/hVTouq08y8fzW.gif", preview: "https://i.giphy.com/hVTouq08y8fzW.gif" },
        { id: "3", title: "Mind Blown", url: "https://i.giphy.com/26ufdipQqU2lhNA4g.gif", preview: "https://i.giphy.com/26ufdipQqU2lhNA4g.gif" },
        { id: "4", title: "Cat Vibe", url: "https://i.giphy.com/jpbnoe3UIa8TU8LM13.gif", preview: "https://i.giphy.com/jpbnoe3UIa8TU8LM13.gif" },
        { id: "5", title: "Approved / Like", url: "https://i.giphy.com/111ebonMs90YLu.gif", preview: "https://i.giphy.com/111ebonMs90YLu.gif" },
        { id: "6", title: "Fireworks", url: "https://i.giphy.com/26tOZ42Mg6pbTUPHW.gif", preview: "https://i.giphy.com/26tOZ42Mg6pbTUPHW.gif" },
        { id: "7", title: "LOL Laughing", url: "https://i.giphy.com/10JhvtGP90WXfO.gif", preview: "https://i.giphy.com/10JhvtGP90WXfO.gif" },
        { id: "8", title: "High Five", url: "https://i.giphy.com/l0ErFaf44gZYcw55S.gif", preview: "https://i.giphy.com/l0ErFaf44gZYcw55S.gif" }
      ];
      res.json(fallbackGifs);
    } catch (err) {
      logger.warn({ err }, "GIF search error");
      res.json([]);
    }
  });
}

// server/routes/health.ts
var START_TIME = Date.now();
function setupHealthRoutes(app) {
  app.get("/api/health", async (_req, res) => {
    const checks = {};
    let isHealthy = true;
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { sql: sql5 } = await import("drizzle-orm");
      const start = Date.now();
      await db2.execute(sql5`SELECT 1`);
      const latencyMs = Date.now() - start;
      checks.postgres = { status: "ok", latencyMs };
    } catch (err) {
      checks.postgres = { status: "error", message: err.message };
      isHealthy = false;
    }
    const uptimeMs = Date.now() - START_TIME;
    const uptimeSec = Math.floor(uptimeMs / 1e3);
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor(uptimeSec % 3600 / 60);
    const seconds = uptimeSec % 60;
    let version = "unknown";
    try {
      const fs6 = await import("fs");
      const path7 = await import("path");
      const pkgPath = path7.resolve("package.json");
      const pkg2 = JSON.parse(fs6.readFileSync(pkgPath, "utf8"));
      version = pkg2.version || "unknown";
    } catch {
    }
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "ok" : "degraded",
      version,
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      uptimeMs,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      checks
    });
  });
}

// server/routes/stickers.ts
init_jwtAuth();
init_logger();
function setupStickerRoutes(app) {
  app.get("/api/stickers/market", requireAuth, async (_req, res) => {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { stickerPacks: stickerPacks2, stickers: stickers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11, count: count2, sql: sql5 } = await import("drizzle-orm");
      const result = await db2.execute(sql5`
        SELECT
          sp.id,
          sp.name,
          sp.title,
          sp.is_default,
          sp.thumbnail,
          sp.created_at,
          sp.author_id,
          COUNT(s.id)::int AS sticker_count
        FROM sticker_packs sp
        LEFT JOIN stickers s ON s.pack_id = sp.id
        GROUP BY sp.id
        ORDER BY sp.created_at DESC
      `);
      res.json(result?.rows || result);
    } catch (err) {
      logger.error({ err }, "Sticker market error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/sticker-packs", requireAdmin, async (req, res) => {
    try {
      const { name, title, thumbnail, isDefault } = req.body;
      if (!name || !title) {
        return res.status(400).json({ error: "name and title are required." });
      }
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { stickerPacks: stickerPacks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const inserted = await db2.insert(stickerPacks2).values({
        name,
        title,
        thumbnail: thumbnail || null,
        isDefault: isDefault ? "true" : "false",
        authorId: req.user.id
      }).returning();
      logger.info(`[Stickers] Pack created: ${name} by ${req.user.uid}`);
      res.json(inserted[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Pack with this name already exists." });
      }
      logger.error({ err }, "Create sticker pack error");
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/stickers/:packId/add", requireAdmin, async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      if (isNaN(packId)) {
        return res.status(400).json({ error: "Invalid pack id." });
      }
      const { imageUrl, emoji, width, height } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required." });
      }
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { stickers: stickers2, stickerPacks: stickerPacks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const pack = await db2.select().from(stickerPacks2).where(eq11(stickerPacks2.id, packId)).limit(1);
      if (!pack.length) {
        return res.status(404).json({ error: "Sticker pack not found." });
      }
      const inserted = await db2.insert(stickers2).values({
        packId,
        imageUrl,
        emoji: emoji || "\u{1F60A}",
        width: width || null,
        height: height || null
      }).returning();
      logger.info(`[Stickers] Sticker added to pack ${packId}`);
      res.json(inserted[0]);
    } catch (err) {
      logger.error({ err }, "Add sticker error");
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/stickers/:packId/stickers/:id", requireAdmin, async (req, res) => {
    try {
      const stickerId = parseInt(req.params.id);
      if (isNaN(stickerId)) {
        return res.status(400).json({ error: "Invalid sticker id." });
      }
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { stickers: stickers2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq11 } = await import("drizzle-orm");
      const deleted = await db2.delete(stickers2).where(eq11(stickers2.id, stickerId)).returning();
      if (!deleted.length) {
        return res.status(404).json({ error: "Sticker not found." });
      }
      logger.info(`[Stickers] Sticker ${stickerId} deleted`);
      res.json({ success: true, deleted: deleted[0] });
    } catch (err) {
      logger.error({ err }, "Delete sticker error");
      res.status(500).json({ error: err.message });
    }
  });
}

// server/routes/accounts.ts
init_logger();
init_jwtAuth();
import { randomUUID as randomUUID9 } from "crypto";

// src/db/accounts.ts
init_db();
init_schema();
import { eq as eq8, and as and5 } from "drizzle-orm";
async function getAccountsByOwnerUid(ownerUid) {
  const result = await db.select().from(accounts).where(eq8(accounts.ownerUid, ownerUid));
  return result;
}
async function getAccountByIdAndOwner(id, ownerUid) {
  const result = await db.select().from(accounts).where(and5(eq8(accounts.id, id), eq8(accounts.ownerUid, ownerUid))).limit(1);
  return result[0] || null;
}
async function addAccount(data) {
  const inserted = await db.insert(accounts).values({
    ownerUid: data.ownerUid,
    userUid: data.userUid,
    displayName: data.displayName ?? null,
    email: data.email ?? null,
    phoneNumber: data.phoneNumber ?? null,
    photoUrl: data.photoUrl ?? null
  }).returning();
  return inserted[0];
}
async function removeAccount(id, ownerUid) {
  const result = await db.delete(accounts).where(and5(eq8(accounts.id, id), eq8(accounts.ownerUid, ownerUid))).returning();
  return result.length > 0;
}
async function isAccountLinked(ownerUid, userUid) {
  const result = await db.select({ id: accounts.id }).from(accounts).where(and5(eq8(accounts.ownerUid, ownerUid), eq8(accounts.userUid, userUid))).limit(1);
  return result.length > 0;
}
async function resolveOwnerUid(currentUid) {
  const owned = await getAccountsByOwnerUid(currentUid);
  if (owned.length > 0) {
    return currentUid;
  }
  const result = await db.select({ ownerUid: accounts.ownerUid }).from(accounts).where(eq8(accounts.userUid, currentUid)).limit(1);
  if (result.length > 0) {
    return result[0].ownerUid;
  }
  return currentUid;
}
async function findUserByUsername(username) {
  const result = await db.select().from(users).where(eq8(users.username, username)).limit(1);
  return result[0] || null;
}

// server/routes/accounts.ts
init_auth2();
init_auth2();
init_sessions();
init_auth();
function setRefreshTokenCookie2(res, token) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 3 * 24 * 60 * 60 * 1e3
    // 3 дня
  });
}
async function setupAccountsRoutes(app) {
  app.get("/api/accounts", requireAuth, async (req, res) => {
    const log2 = ctx(req);
    try {
      const ownerUid = await resolveOwnerUid(req.user.uid);
      const accountList = await getAccountsByOwnerUid(ownerUid);
      const currentUser = await getUserByUid(ownerUid);
      const mainAccount = currentUser ? {
        id: 0,
        // 0 = основной аккаунт (не в таблице accounts)
        ownerUid,
        userUid: ownerUid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        photoUrl: currentUser.photoURL,
        createdAt: currentUser.createdAt,
        isMain: true
      } : null;
      res.json({
        accounts: [
          ...mainAccount ? [mainAccount] : [],
          ...accountList.map((a) => ({ ...a, isMain: false }))
        ]
      });
    } catch (err) {
      log2.error({ err }, "[ACCOUNTS] List error");
      res.status(500).json({ error: err.message || "Failed to list accounts." });
    }
  });
  app.post("/api/accounts", requireAuth, async (req, res) => {
    const log2 = ctx(req);
    try {
      const ownerUid = await resolveOwnerUid(req.user.uid);
      const { username, password, displayName } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
      }
      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-z0-9_\-]+$/.test(cleanUsername)) {
        return res.status(400).json({ error: "Invalid username. Use lowercase letters, numbers, underscores, and hyphens." });
      }
      const existingUser = await findUserByUsername(cleanUsername);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists." });
      }
      const email = `${cleanUsername}@qwcroll.com`;
      const uid = randomUUID9();
      const createdUser = await createUserWithPassword({
        uid,
        email,
        password,
        username: cleanUsername,
        displayName: displayName || cleanUsername,
        status: "online"
      });
      let accountRecord;
      try {
        accountRecord = await addAccount({
          ownerUid,
          userUid: uid,
          displayName: createdUser.displayName,
          email: createdUser.email,
          phoneNumber: createdUser.phoneNumber,
          photoUrl: createdUser.photoURL
        });
      } catch (addErr) {
        log2.warn({ err: addErr, ownerUid, uid }, "[ACCOUNTS] Failed to link account in DB");
        accountRecord = { id: 0, ownerUid, userUid: uid, displayName: createdUser.displayName, email: createdUser.email, phoneNumber: null, photoUrl: null, createdAt: /* @__PURE__ */ new Date() };
      }
      const userAgent = req.headers["user-agent"] || null;
      const ip = req.ip || req.socket?.remoteAddress || null;
      const { sessionUid } = await createSession({ userUid: uid, userAgent, ipAddress: ip });
      const token = signJwt(createdUser, sessionUid);
      const refreshToken = signRefreshJwt(createdUser, sessionUid);
      setRefreshTokenCookie2(res, refreshToken);
      log2.info({ ownerUid, newAccountUid: uid }, "[ACCOUNTS] New account added");
      res.json({
        token,
        user: createdUser,
        account: { ...accountRecord, isMain: false }
      });
    } catch (err) {
      log2.error({ err }, "[ACCOUNTS] Add error");
      res.status(500).json({ error: err.message || "Failed to add account." });
    }
  });
  app.post("/api/accounts/login", requireAuth, async (req, res) => {
    const log2 = ctx(req);
    try {
      const ownerUid = await resolveOwnerUid(req.user.uid);
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }
      const email = `${username.trim().toLowerCase()}@qwcroll.com`;
      const user = await verifyUserPassword(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      if (user.uid === ownerUid) {
        return res.status(400).json({ error: "Cannot add your own account." });
      }
      const alreadyLinked = await isAccountLinked(ownerUid, user.uid);
      if (alreadyLinked) {
        return res.status(409).json({ error: "Account is already linked." });
      }
      let accountRecord;
      try {
        accountRecord = await addAccount({
          ownerUid,
          userUid: user.uid,
          displayName: user.displayName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          photoUrl: user.photoURL
        });
      } catch (addErr) {
        log2.warn({ err: addErr, ownerUid, linkedUid: user.uid }, "[ACCOUNTS] Failed to link account in DB (may already be linked)");
        accountRecord = { id: 0, ownerUid, userUid: user.uid, displayName: user.displayName, email: user.email, phoneNumber: null, photoUrl: null, createdAt: /* @__PURE__ */ new Date() };
      }
      const userAgent = req.headers["user-agent"] || null;
      const ip = req.ip || req.socket?.remoteAddress || null;
      const { sessionUid } = await createSession({ userUid: user.uid, userAgent, ipAddress: ip });
      const token = signJwt(user, sessionUid);
      const refreshToken = signRefreshJwt(user, sessionUid);
      setRefreshTokenCookie2(res, refreshToken);
      log2.info({ ownerUid, linkedUid: user.uid }, "[ACCOUNTS] Existing account linked");
      res.json({
        token,
        user,
        account: { ...accountRecord, isMain: false }
      });
    } catch (err) {
      log2.error({ err }, "[ACCOUNTS] Login-link error");
      res.status(500).json({ error: err.message || "Failed to link account." });
    }
  });
  app.put("/api/accounts/:id/switch", requireAuth, async (req, res) => {
    const log2 = ctx(req);
    try {
      const ownerUid = await resolveOwnerUid(req.user.uid);
      const targetId = parseInt(req.params.id, 10);
      if (isNaN(targetId)) {
        return res.status(400).json({ error: "Invalid account id." });
      }
      if (targetId === 0) {
        const mainUser = await getUserByUid(ownerUid);
        if (!mainUser) {
          return res.status(404).json({ error: "Main account not found." });
        }
        const userAgent2 = req.headers["user-agent"] || null;
        const ip2 = req.ip || req.socket?.remoteAddress || null;
        const { sessionUid: sessionUid2 } = await createSession({ userUid: ownerUid, userAgent: userAgent2, ipAddress: ip2 });
        const token2 = signJwt(mainUser, sessionUid2);
        const refreshToken2 = signRefreshJwt(mainUser, sessionUid2);
        setRefreshTokenCookie2(res, refreshToken2);
        log2.info({ ownerUid }, "[ACCOUNTS] Switched to main account");
        res.json({ token: token2, user: mainUser });
        return;
      }
      const account = await getAccountByIdAndOwner(targetId, ownerUid);
      if (!account) {
        return res.status(404).json({ error: "Account not found." });
      }
      const targetUser = await getUserByUid(account.userUid);
      if (!targetUser) {
        return res.status(404).json({ error: "Linked user not found (may have been deleted)." });
      }
      const userAgent = req.headers["user-agent"] || null;
      const ip = req.ip || req.socket?.remoteAddress || null;
      const { sessionUid } = await createSession({ userUid: account.userUid, userAgent, ipAddress: ip });
      const token = signJwt(targetUser, sessionUid);
      const refreshToken = signRefreshJwt(targetUser, sessionUid);
      setRefreshTokenCookie2(res, refreshToken);
      log2.info({ ownerUid, switchToUid: account.userUid }, "[ACCOUNTS] Switched account");
      res.json({ token, user: targetUser });
    } catch (err) {
      log2.error({ err }, "[ACCOUNTS] Switch error");
      res.status(500).json({ error: err.message || "Failed to switch account." });
    }
  });
  app.delete("/api/accounts/:id", requireAuth, async (req, res) => {
    const log2 = ctx(req);
    try {
      const ownerUid = await resolveOwnerUid(req.user.uid);
      const targetId = parseInt(req.params.id, 10);
      if (isNaN(targetId)) {
        return res.status(400).json({ error: "Invalid account id." });
      }
      if (targetId === 0) {
        return res.status(400).json({ error: "Cannot delete the main account from here." });
      }
      const deleted = await removeAccount(targetId, ownerUid);
      if (!deleted) {
        return res.status(404).json({ error: "Account not found." });
      }
      log2.info({ ownerUid, removedId: targetId }, "[ACCOUNTS] Account unlinked");
      res.json({ success: true });
    } catch (err) {
      log2.error({ err }, "[ACCOUNTS] Delete error");
      res.status(500).json({ error: err.message || "Failed to delete account." });
    }
  });
}

// server/routes/music.ts
init_db();
init_schema();
init_jwtAuth();
init_logger();
import dns from "dns/promises";
import net from "net";
import http from "http";
import https from "https";
import { execFile as execFile2 } from "child_process";
import { promisify } from "util";
import { eq as eq9, and as and6, desc as desc4 } from "drizzle-orm";

// server/services/websocket.ts
init_auth();
init_logger();
await init_redis();
import { WebSocketServer, WebSocket } from "ws";
import { EventEmitter } from "events";
var wsClients = /* @__PURE__ */ new Map();
var clientMeta = /* @__PURE__ */ new WeakMap();
var HEARTBEAT_INTERVAL = 3e4;
var MAX_MISSED_PONGS = 3;
var PRESENCE_TTL = 60;
var RATE_LIMIT = 60;
var wsEvents = new EventEmitter();
wsEvents.setMaxListeners(100);
function authenticateWsRequest(req) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");
    if (!token) return null;
    const decoded = verifyJwt(token);
    return decoded.uid || null;
  } catch {
    return null;
  }
}
function broadcastStatusUpdate(targetUids, data) {
  const payload = JSON.stringify(data);
  for (const uid of targetUids) {
    const clients = wsClients.get(uid);
    if (clients) {
      for (const ws of clients) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      }
      logger.info(`[WS] Broadcast to ${uid}: ${clients.size} clients`);
    }
  }
  wsEvents.emit("broadcast", targetUids, data);
}
function broadcastAll(data) {
  const payload = JSON.stringify(data);
  wss?.clients?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
async function getPresenceForUidsAsync(uids) {
  const redis2 = getRedis();
  const results = [];
  for (const uid of uids) {
    try {
      const raw = await redis2.get(`presence:${uid}`);
      if (raw) results.push(JSON.parse(raw));
    } catch {
    }
  }
  return results;
}
async function setOnline(uid) {
  const redis2 = getRedis();
  const info = {
    uid,
    status: "online",
    lastSeen: Date.now(),
    offlineAt: void 0
  };
  try {
    await redis2.set(`presence:${uid}`, JSON.stringify(info), "EX", PRESENCE_TTL);
  } catch {
  }
  broadcastStatusUpdate([], {
    type: "presence_update",
    presence: [info]
  });
}
async function setOffline(uid) {
  const redis2 = getRedis();
  const info = {
    uid,
    status: "offline",
    lastSeen: Date.now(),
    offlineAt: Date.now()
  };
  try {
    await redis2.set(`presence:${uid}`, JSON.stringify(info), "EX", PRESENCE_TTL);
  } catch {
  }
  broadcastStatusUpdate([], {
    type: "presence_update",
    presence: [info]
  });
}
async function refreshPresenceTTL(uid) {
  const redis2 = getRedis();
  try {
    await redis2.expire(`presence:${uid}`, PRESENCE_TTL);
  } catch {
  }
}
async function handleTyping(uid, chatId, chatParticipants) {
  if (!chatId || !Array.isArray(chatParticipants)) return;
  const payload = JSON.stringify({
    type: "typing",
    uid,
    chatId,
    timestamp: Date.now()
  });
  for (const participantUid of chatParticipants) {
    if (participantUid === uid) continue;
    const clients = wsClients.get(participantUid);
    if (clients) {
      for (const ws of clients) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      }
    }
  }
}
var wss;
function closeAllWebSocketConnections() {
  return new Promise((resolve) => {
    if (!wss) {
      resolve();
      return;
    }
    let openCount = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close(1001, "Server shutting down");
        openCount++;
      }
    });
    logger.info(`[WS] Closed ${openCount} active connections`);
    const doClose = () => {
      wss.close(() => {
        logger.info("[WS] WebSocketServer closed");
        resolve();
      });
    };
    if (openCount === 0) {
      try {
        wss.close();
      } catch {
      }
      resolve();
    } else {
      setTimeout(doClose, 1e3);
    }
  });
}
function setupWebSocket(httpServer) {
  wss = new WebSocketServer({
    server: httpServer,
    path: "/ws",
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      threshold: 256,
      concurrencyLimit: 10,
      clientNoContextTakeover: true,
      serverNoContextTakeover: true
    }
  });
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const meta = clientMeta.get(ws);
      if (!meta) return;
      if (!meta.isAlive) {
        meta.missedPongs++;
        if (meta.missedPongs >= MAX_MISSED_PONGS) {
          logger.info(`[WS] Terminating unresponsive client: ${meta.uid} (missed ${meta.missedPongs} pongs)`);
          setOffline(meta.uid);
          ws.terminate();
          return;
        }
        logger.debug(`[WS] Client ${meta.uid} missed pong #${meta.missedPongs}/${MAX_MISSED_PONGS}`);
      }
      meta.isAlive = false;
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, HEARTBEAT_INTERVAL);
  heartbeatInterval.unref();
  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });
  wss.on("connection", (ws, req) => {
    const uid = authenticateWsRequest(req);
    if (!uid) {
      ws.close(4001, "Unauthorized");
      return;
    }
    logger.info(`[WS] Client connected: ${uid}`);
    if (!wsClients.has(uid)) wsClients.set(uid, /* @__PURE__ */ new Set());
    wsClients.get(uid).add(ws);
    clientMeta.set(ws, {
      uid,
      isAlive: true,
      missedPongs: 0,
      rateCount: 0,
      rateResetAt: Date.now() + 6e4
    });
    setOnline(uid);
    ws.on("pong", () => {
      const meta = clientMeta.get(ws);
      if (meta) {
        meta.isAlive = true;
        meta.missedPongs = 0;
        refreshPresenceTTL(uid);
      }
    });
    ws.on("close", () => {
      logger.info(`[WS] Client disconnected: ${uid}`);
      const clients = wsClients.get(uid);
      if (clients) {
        clients.delete(ws);
        if (clients.size === 0) {
          wsClients.delete(uid);
          setOffline(uid);
        }
      }
      clientMeta.delete(ws);
    });
    ws.on("error", (err) => {
      logger.warn({ err: err.message }, `[WS] Client error: ${uid}`);
    });
    ws.on("message", (data) => {
      const meta = clientMeta.get(ws);
      if (!meta) return;
      const now = Date.now();
      if (now > meta.rateResetAt) {
        meta.rateCount = 0;
        meta.rateResetAt = now + 6e4;
      }
      meta.rateCount++;
      if (meta.rateCount > RATE_LIMIT) {
        ws.close(4003, "Rate limit exceeded");
        return;
      }
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "typing" && msg.chatId) {
          const chatParticipants = msg.participants || [];
          handleTyping(uid, msg.chatId, chatParticipants);
          return;
        }
        if (msg.type === "get_presence" && msg.uids) {
          getPresenceForUidsAsync(msg.uids).then((presence) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "presence_update", presence }));
            }
          });
          return;
        }
        if (msg.type === "music_sync_broadcast") {
          broadcastAll({
            type: "user_music_status",
            uid,
            isPlaying: Boolean(msg.isPlaying),
            currentTrack: msg.currentTrack || null,
            playbackPosition: typeof msg.playbackPosition === "number" ? msg.playbackPosition : 0,
            updatedAt: Date.now()
          });
          return;
        }
        wsEvents.emit("message", { uid, ...msg });
        if (msg.type === "read_chat" && msg.chatId) {
          logger.info(`[WS] Read request from ${uid} for chat ${msg.chatId}`);
        }
      } catch {
      }
    });
    ws.send(JSON.stringify({
      type: "connected",
      uid,
      timestamp: Date.now()
    }));
  });
  return wss;
}

// server/routes/music.ts
var execFileAsync = promisify(execFile2);
var streamCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 2 * 60 * 60 * 1e3;
var coverCache = /* @__PURE__ */ new Map();
var COVER_CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
var searchCache = /* @__PURE__ */ new Map();
var SEARCH_CACHE_TTL_MS = 30 * 60 * 1e3;
var DEFAULT_COVER_DATA_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='16' fill='%23181824'/%3E%3Cpath d='M48 76a10 10 0 1 1-6-9.17V36a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v30.83A10 10 0 1 1 72 76V42H50v34a10 10 0 0 1-2 0z' fill='%237c5bf5'/%3E%3C/svg%3E";
var FALLBACK_SVG_BUFFER = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="16" fill="#181824"/><path d="M48 76a10 10 0 1 1-6-9.17V36a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v30.83A10 10 0 1 1 72 76V42H50v34a10 10 0 0 1-2 0z" fill="#7c5bf5"/></svg>`
);
async function extractYouTubeStreamWithYtDlp(videoId) {
  try {
    const { stdout } = await execFileAsync(
      "python",
      ["-m", "yt_dlp", "-g", "--format", "bestaudio[ext=m4a]/bestaudio/best", `https://www.youtube.com/watch?v=${videoId}`],
      { timeout: 12e3 }
    );
    const lines = stdout.trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const streamUrl = lines.find((l) => l.startsWith("http://") || l.startsWith("https://"));
    if (streamUrl) {
      return streamUrl;
    }
  } catch (err) {
    logger.warn(`[Music yt-dlp] Notice for ${videoId}: ${err?.message || err}`);
  }
  return null;
}
function isPrivateOrLoopbackIp(ip) {
  if (!ip) return true;
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;
    if (parts[0] === 0) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] >= 224) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
    return false;
  }
  return true;
}
async function validateUrlForSsrf(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, reason: "Invalid protocol: only http and https are allowed" };
    }
    const hostname = parsed.hostname;
    if (!hostname) {
      return { valid: false, reason: "Invalid hostname" };
    }
    if (hostname.toLowerCase() === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return { valid: false, reason: "Access to localhost is blocked" };
    }
    const lookup = await dns.lookup(hostname, { all: true });
    if (!lookup || lookup.length === 0) {
      return { valid: false, reason: "DNS resolution failed" };
    }
    for (const entry of lookup) {
      if (isPrivateOrLoopbackIp(entry.address)) {
        return { valid: false, reason: `Destination IP ${entry.address} is restricted (private/internal network)` };
      }
    }
    return { valid: true, parsedUrl: parsed };
  } catch (err) {
    return { valid: false, reason: err.message || "URL validation error" };
  }
}
var INVIDIOUS_INSTANCES = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://invidious.projectsegfau.lt",
  "https://invidious.private.coffee",
  "https://vid.puffyan.us",
  "https://invidious.drgns.space",
  "https://yewtu.be"
];
async function resolveYouTubeStreamUrl(videoId) {
  const now = Date.now();
  const cached = streamCache.get(videoId);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.url;
  }
  const ytDlpUrl = await extractYouTubeStreamWithYtDlp(videoId);
  if (ytDlpUrl) {
    streamCache.set(videoId, {
      url: ytDlpUrl,
      timestamp: now
    });
    return ytDlpUrl;
  }
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 4e3);
      const res = await fetch(`${instance}/api/v1/videos/${encodeURIComponent(videoId)}`, {
        signal: ctrl.signal,
        headers: { "User-Agent": "QWERcrool-Music/1.0" }
      });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        let streamUrl = null;
        if (Array.isArray(data.adaptiveFormats)) {
          const af = data.adaptiveFormats.find((f) => f.type && f.type.startsWith("audio/webm")) || data.adaptiveFormats.find((f) => f.type && f.type.startsWith("audio/mp4")) || data.adaptiveFormats.find((f) => f.type && f.type.startsWith("audio/"));
          if (af && af.url) streamUrl = af.url;
        }
        if (!streamUrl && Array.isArray(data.formatStreams)) {
          const fs6 = data.formatStreams.find((f) => f.url);
          if (fs6) streamUrl = fs6.url;
        }
        if (streamUrl) {
          streamCache.set(videoId, {
            url: streamUrl,
            title: data.title,
            duration: data.lengthSeconds,
            timestamp: now
          });
          return streamUrl;
        }
      }
    } catch {
    }
  }
  return null;
}
function parseDurationToSeconds(durStr) {
  if (!durStr || typeof durStr !== "string") return 200;
  const parts = durStr.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 200;
}
async function searchYouTube(query) {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3200);
    const res = await fetch("https://www.youtube.com/youtubei/v1/search", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7"
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
            hl: "ru",
            gl: "RU"
          }
        },
        query
      })
    });
    clearTimeout(tid);
    if (res.ok) {
      const json = await res.json();
      const contents = json?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      const results = [];
      for (const c of contents) {
        const items = c?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const v = item.videoRenderer;
          if (v && v.videoId) {
            const title = v.title?.runs?.[0]?.text || "Unknown Track";
            const artist = v.ownerText?.runs?.[0]?.text || "YouTube";
            const length = v.lengthText?.simpleText || "3:30";
            results.push({
              id: "yt_" + v.videoId,
              videoId: v.videoId,
              title,
              artist,
              album: `YouTube Full (${length})`,
              cover: `/api/music/cover?vid=${encodeURIComponent(v.videoId)}`,
              duration: length,
              durationSeconds: parseDurationToSeconds(length),
              source: "youtube"
            });
            if (results.length >= 25) break;
          }
        }
        if (results.length >= 25) break;
      }
      if (results.length > 0) return results;
    }
  } catch (err) {
    logger.warn(`[Music Search YouTube InnerTube] Notice: ${err?.message || err}`);
  }
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });
    clearTimeout(tid);
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
      if (match) {
        const ytData = JSON.parse(match[1]);
        const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
        const results = [];
        for (const c of contents) {
          const items = c?.itemSectionRenderer?.contents || [];
          for (const item of items) {
            const v = item.videoRenderer;
            if (v && v.videoId) {
              const title = v.title?.runs?.[0]?.text || "Unknown Track";
              const artist = v.ownerText?.runs?.[0]?.text || "YouTube";
              const length = v.lengthText?.simpleText || "3:30";
              results.push({
                id: "yt_" + v.videoId,
                videoId: v.videoId,
                title,
                artist,
                album: `YouTube Full (${length})`,
                cover: `/api/music/cover?vid=${encodeURIComponent(v.videoId)}`,
                duration: length,
                durationSeconds: parseDurationToSeconds(length),
                source: "youtube"
              });
              if (results.length >= 25) break;
            }
          }
          if (results.length >= 25) break;
        }
        if (results.length > 0) return results;
      }
    }
  } catch {
  }
  try {
    const invidiousTasks = INVIDIOUS_INSTANCES.slice(0, 3).map(async (instance) => {
      let tid = null;
      try {
        const ctrl = new AbortController();
        tid = setTimeout(() => ctrl.abort(), 2500);
        const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
          signal: ctrl.signal,
          headers: { "User-Agent": "QWERcrool-Music/1.0" }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data.slice(0, 25).map((item) => ({
              id: "yt_" + item.videoId,
              videoId: item.videoId,
              title: item.title,
              artist: item.author || "YouTube Artist",
              album: "YouTube Full",
              cover: `/api/music/cover?vid=${encodeURIComponent(item.videoId)}`,
              duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, "0")}` : "3:30",
              durationSeconds: item.lengthSeconds || 210,
              source: "youtube"
            }));
          }
        }
      } catch {
      } finally {
        if (tid) clearTimeout(tid);
      }
      return null;
    });
    const settled = await Promise.allSettled(invidiousTasks);
    for (const s of settled) {
      if (s.status === "fulfilled" && Array.isArray(s.value) && s.value.length > 0) {
        return s.value;
      }
    }
  } catch {
  }
  return [];
}
async function searchAudius(query) {
  let tid = null;
  try {
    const ctrl = new AbortController();
    tid = setTimeout(() => ctrl.abort(), 3e3);
    const res = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=QWERcrool`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "QWERcrool-Music/1.0" }
    });
    if (res.ok) {
      const json = await res.json();
      return (json.data || []).slice(0, 25).map((t) => {
        const artwork = t.artwork ? t.artwork["480x480"] || t.artwork["150x150"] : null;
        return {
          id: "audius_" + t.id,
          title: t.title || "Unknown Title",
          artist: t.user?.name || "Audius Artist",
          album: "Audius (320 kbps)",
          cover: artwork ? `/api/music/cover?url=${encodeURIComponent(artwork)}` : DEFAULT_COVER_DATA_URI,
          streamUrl: `https://discoveryprovider.audius.co/v1/tracks/${t.id}/stream?app_name=QWERcrool`,
          duration: t.duration ? `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, "0")}` : "3:30",
          durationSeconds: t.duration || 210,
          source: "audius"
        };
      });
    }
  } catch {
  } finally {
    if (tid) clearTimeout(tid);
  }
  return [];
}
async function searchArchive(query) {
  let tid = null;
  try {
    const searchQuery = `mediatype:(audio) AND (creator:(${query}) OR title:(${query}) OR (${query}))`;
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(searchQuery)}&fl[]=identifier,title,creator,year,downloads&sort[]=downloads+desc&rows=25&output=json`;
    const ctrl = new AbortController();
    tid = setTimeout(() => ctrl.abort(), 3e3);
    const res = await fetch(url, { signal: ctrl.signal });
    if (res.ok) {
      const data = await res.json();
      return (data.response?.docs || []).map((doc) => ({
        id: "archive_" + doc.identifier,
        archiveId: doc.identifier,
        title: doc.title || doc.identifier,
        artist: doc.creator || "Internet Archive",
        album: doc.year ? `Year ${doc.year}` : "Archive.org",
        cover: `/api/music/cover?url=${encodeURIComponent(`https://archive.org/services/img/${doc.identifier}`)}`,
        streamUrl: null,
        duration: "--:--",
        durationSeconds: 180,
        source: "archive"
      }));
    }
  } catch {
  } finally {
    if (tid) clearTimeout(tid);
  }
  return [];
}
async function searchRadio(query) {
  const radioMirrors = [
    "https://de1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
    "https://at1.api.radio-browser.info"
  ];
  try {
    const radioTasks = radioMirrors.map(async (mirror) => {
      let tid = null;
      try {
        const ctrl = new AbortController();
        tid = setTimeout(() => ctrl.abort(), 2500);
        const res = await fetch(`${mirror}/json/stations/byname/${encodeURIComponent(query)}?limit=25`, {
          signal: ctrl.signal,
          headers: { "User-Agent": "QWERcrool-Music/1.0" }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data.filter((s) => s.url_resolved || s.url).map((s) => {
              const fav = s.favicon && s.favicon.startsWith("http") ? s.favicon : null;
              return {
                id: "radio_" + (s.stationuuid || Math.random().toString(36).substr(2, 9)),
                title: s.name || "Radio Station",
                artist: s.tags ? s.tags.slice(0, 35) : "Live Radio 24/7",
                album: `${s.country || "Global"} \xB7 ${s.bitrate || 128}kbps`,
                cover: fav ? `/api/music/cover?url=${encodeURIComponent(fav)}` : DEFAULT_COVER_DATA_URI,
                streamUrl: s.url_resolved || s.url,
                duration: "LIVE",
                durationSeconds: 0,
                source: "radio"
              };
            });
          }
        }
      } catch {
      } finally {
        if (tid) clearTimeout(tid);
      }
      return null;
    });
    const settled = await Promise.allSettled(radioTasks);
    for (const s of settled) {
      if (s.status === "fulfilled" && Array.isArray(s.value) && s.value.length > 0) {
        return s.value;
      }
    }
  } catch {
  }
  return [];
}
function setupMusicRoutes(app) {
  app.get("/api/music/cover", async (req, res) => {
    try {
      let targetUrl = typeof req.query.url === "string" ? req.query.url.trim() : "";
      const vid = typeof req.query.vid === "string" ? req.query.vid.trim() : "";
      if (vid && /^[a-zA-Z0-9_-]{8,15}$/.test(vid)) {
        targetUrl = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
      }
      if (!targetUrl) {
        res.setHeader("Content-Type", "image/svg+xml");
        return res.send(FALLBACK_SVG_BUFFER);
      }
      const cacheKey = targetUrl;
      const cached = coverCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < COVER_CACHE_TTL_MS) {
        res.setHeader("Content-Type", cached.contentType);
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.send(cached.buffer);
      }
      const validation = await validateUrlForSsrf(targetUrl);
      if (!validation.valid || !validation.parsedUrl) {
        res.setHeader("Content-Type", "image/svg+xml");
        return res.send(FALLBACK_SVG_BUFFER);
      }
      const fetchCover = (urlToFetch, redirects = 0) => {
        if (redirects > 3) {
          res.setHeader("Content-Type", "image/svg+xml");
          return res.send(FALLBACK_SVG_BUFFER);
        }
        try {
          const currentParsed = new URL(urlToFetch);
          const currentTransport = currentParsed.protocol === "https:" ? https : http;
          const proxyReq = currentTransport.get(currentParsed, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
            },
            timeout: 8e3
          }, (proxyRes) => {
            const status = proxyRes.statusCode || 200;
            if ([301, 302, 303, 307, 308].includes(status) && proxyRes.headers.location) {
              proxyRes.resume();
              const nextLoc = new URL(proxyRes.headers.location, urlToFetch).toString();
              return fetchCover(nextLoc, redirects + 1);
            }
            if (status !== 200) {
              proxyRes.resume();
              if (!res.headersSent) {
                res.setHeader("Content-Type", "image/svg+xml");
                res.send(FALLBACK_SVG_BUFFER);
              }
              return;
            }
            const contentType = proxyRes.headers["content-type"] || "image/jpeg";
            const chunks = [];
            proxyRes.on("data", (c) => chunks.push(c));
            proxyRes.on("end", () => {
              const buffer = Buffer.concat(chunks);
              if (coverCache.size > 1e3) {
                const keys = Array.from(coverCache.keys());
                for (let i = 0; i < 200; i++) coverCache.delete(keys[i]);
              }
              coverCache.set(cacheKey, { buffer, contentType, timestamp: Date.now() });
              if (!res.headersSent) {
                res.setHeader("Content-Type", contentType);
                res.setHeader("Cache-Control", "public, max-age=604800, immutable");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.send(buffer);
              }
            });
          });
          proxyReq.on("error", () => {
            if (!res.headersSent) {
              res.setHeader("Content-Type", "image/svg+xml");
              res.send(FALLBACK_SVG_BUFFER);
            }
          });
          proxyReq.on("timeout", () => {
            proxyReq.destroy();
            if (!res.headersSent) {
              res.setHeader("Content-Type", "image/svg+xml");
              res.send(FALLBACK_SVG_BUFFER);
            }
          });
        } catch {
          if (!res.headersSent) {
            res.setHeader("Content-Type", "image/svg+xml");
            res.send(FALLBACK_SVG_BUFFER);
          }
        }
      };
      fetchCover(targetUrl);
    } catch {
      if (!res.headersSent) {
        res.setHeader("Content-Type", "image/svg+xml");
        res.send(FALLBACK_SVG_BUFFER);
      }
    }
  });
  app.get("/api/music/search", async (req, res) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 120) : "";
      const source = typeof req.query.source === "string" ? req.query.source : "all";
      if (!q) {
        return res.json({ success: true, results: [] });
      }
      const cacheKey = `${source}:${q.toLowerCase()}`;
      const now = Date.now();
      const cached = searchCache.get(cacheKey);
      if (cached && now - cached.timestamp < SEARCH_CACHE_TTL_MS) {
        return res.json({ success: true, results: cached.results, cached: true });
      }
      const tasks = [];
      if (source === "all" || source === "youtube") tasks.push(searchYouTube(q));
      if (source === "all" || source === "audius") tasks.push(searchAudius(q));
      if (source === "all" || source === "archive") tasks.push(searchArchive(q));
      if (source === "all" || source === "radio") tasks.push(searchRadio(q));
      const settled = await Promise.allSettled(tasks);
      let results = [];
      for (const s of settled) {
        if (s.status === "fulfilled" && Array.isArray(s.value)) {
          results = results.concat(s.value);
        }
      }
      if (searchCache.size > 500) {
        const oldestKey = searchCache.keys().next().value;
        if (oldestKey) searchCache.delete(oldestKey);
      }
      searchCache.set(cacheKey, { results, timestamp: now });
      res.json({ success: true, results });
    } catch (err) {
      logger.error({ err }, "[Music Search] Error");
      res.status(500).json({ success: false, error: "Music search failed" });
    }
  });
  app.get("/api/music/stream", async (req, res) => {
    try {
      let vid = typeof req.query.id === "string" ? req.query.id.trim() : "";
      if (vid.startsWith("yt_")) vid = vid.slice(3);
      if (!vid || !/^[a-zA-Z0-9_-]{8,15}$/.test(vid)) {
        return res.status(400).json({ success: false, error: "Invalid video ID format" });
      }
      const streamUrl = await resolveYouTubeStreamUrl(vid);
      if (streamUrl) {
        return res.json({
          success: true,
          directUrl: streamUrl,
          proxyUrl: `/api/music/proxy?url=${encodeURIComponent(streamUrl)}`
        });
      }
      res.status(404).json({ success: false, error: "Audio stream resolution failed" });
    } catch (err) {
      logger.error({ err }, "[Music Stream Resolver] Error");
      res.status(500).json({ success: false, error: "Stream resolution failed" });
    }
  });
  app.get("/api/music/archive-stream", async (req, res) => {
    try {
      let id = typeof req.query.id === "string" ? req.query.id.trim() : "";
      if (id.startsWith("archive_")) id = id.slice(8);
      if (!id) return res.status(400).json({ success: false, error: "Missing id" });
      const cached = streamCache.get("archive_" + id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.json({
          success: true,
          directUrl: cached.url,
          proxyUrl: `/api/music/proxy?url=${encodeURIComponent(cached.url)}`
        });
      }
      const metaRes = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}/files`, {
        headers: { "User-Agent": "QWERcrool-Music/1.0" },
        signal: AbortSignal.timeout(6e3)
      });
      if (metaRes.ok) {
        const data = await metaRes.json();
        const files = Array.isArray(data.result) ? data.result : [];
        const audioFile = files.find((f) => f.name && (f.name.endsWith(".mp3") || f.name.endsWith(".ogg") || f.name.endsWith(".flac") || f.name.endsWith(".m4a"))) || files.find((f) => f.format && (f.format.includes("VBR MP3") || f.format.includes("MP3") || f.format.includes("Audio")));
        if (audioFile && audioFile.name) {
          const streamUrl = `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(audioFile.name)}`;
          streamCache.set("archive_" + id, {
            url: streamUrl,
            timestamp: Date.now()
          });
          return res.json({
            success: true,
            directUrl: streamUrl,
            proxyUrl: `/api/music/proxy?url=${encodeURIComponent(streamUrl)}`
          });
        }
      }
      res.status(404).json({ success: false, error: "Archive audio file not found" });
    } catch (err) {
      logger.error({ err }, "[Archive Stream Resolver] Error");
      res.status(500).json({ success: false, error: "Archive stream resolution failed" });
    }
  });
  app.get("/api/music/proxy", async (req, res) => {
    try {
      const targetUrl = typeof req.query.url === "string" ? req.query.url.trim() : "";
      if (!targetUrl) {
        return res.status(400).json({ error: "Missing url parameter" });
      }
      const streamUrl = async (currentUrl, redirectCount = 0) => {
        if (redirectCount > 4) {
          if (!res.headersSent) res.status(502).json({ error: "Too many redirects from audio source" });
          return;
        }
        const validation = await validateUrlForSsrf(currentUrl);
        if (!validation.valid || !validation.parsedUrl) {
          logger.warn(`[Music Proxy SSRF Blocked] URL: ${currentUrl} Reason: ${validation.reason}`);
          if (!res.headersSent) res.status(403).json({ error: "Access to requested resource is forbidden by security policy" });
          return;
        }
        const parsed = validation.parsedUrl;
        const clientRange = req.headers.range;
        const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "*/*"
        };
        if (clientRange) {
          headers["Range"] = clientRange;
        }
        const transport = parsed.protocol === "https:" ? https : http;
        const proxyReq = transport.request(parsed, {
          method: "GET",
          headers,
          timeout: 25e3
        }, (proxyRes) => {
          const statusCode = proxyRes.statusCode || 200;
          if ([301, 302, 303, 307, 308].includes(statusCode) && proxyRes.headers.location) {
            proxyRes.resume();
            const nextUrl = new URL(proxyRes.headers.location, currentUrl).toString();
            return streamUrl(nextUrl, redirectCount + 1);
          }
          const forwardedHeaders = [
            "content-type",
            "content-length",
            "content-range",
            "accept-ranges",
            "cache-control",
            "last-modified",
            "etag"
          ];
          res.status(statusCode);
          for (const h of forwardedHeaders) {
            const val = proxyRes.headers[h];
            if (val) res.setHeader(h, val);
          }
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
          res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
          proxyRes.pipe(res);
        });
        proxyReq.on("error", (err) => {
          logger.error({ err: err.message }, "[Music Proxy Stream] Error");
          if (!res.headersSent) {
            res.status(502).json({ error: "Bad Gateway connecting to audio source" });
          }
        });
        proxyReq.on("timeout", () => {
          proxyReq.destroy();
          if (!res.headersSent) {
            res.status(504).json({ error: "Gateway Timeout fetching audio stream" });
          }
        });
        proxyReq.end();
      };
      await streamUrl(targetUrl);
    } catch (err) {
      logger.error({ err }, "[Music Proxy] Fatal error");
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal streaming proxy error" });
      }
    }
  });
  app.get("/api/music/status/:uid", async (req, res) => {
    try {
      const targetUid = req.params.uid;
      const requesterUid = req.user?.uid;
      const [statusRecord] = await db.select().from(userMusicStatus).where(eq9(userMusicStatus.userUid, targetUid)).limit(1);
      if (!statusRecord) {
        return res.json({ success: true, status: null });
      }
      if (requesterUid !== targetUid) {
        const privacy = statusRecord.privacy || "everyone";
        if (privacy === "nobody") {
          return res.json({ success: true, status: null });
        }
        if (privacy === "contacts") {
          if (!requesterUid) {
            return res.json({ success: true, status: null });
          }
          const contactCheck = await db.select().from(userContacts).where(and6(eq9(userContacts.ownerUid, targetUid), eq9(userContacts.contactUid, requesterUid))).limit(1);
          if (contactCheck.length === 0) {
            return res.json({ success: true, status: null });
          }
        }
      }
      if (statusRecord.broadcastEnabled && statusRecord.isPlaying && statusRecord.currentTrack) {
        return res.json({
          success: true,
          status: {
            mode: "now_playing",
            track: statusRecord.currentTrack,
            playbackPosition: statusRecord.playbackPosition,
            isPlaying: true,
            updatedAt: statusRecord.updatedAt,
            staticTrack: statusRecord.staticTrack
          }
        });
      }
      if (statusRecord.staticTrack) {
        return res.json({
          success: true,
          status: {
            mode: "static",
            track: statusRecord.staticTrack,
            playbackPosition: 0,
            isPlaying: false,
            updatedAt: statusRecord.updatedAt,
            staticTrack: statusRecord.staticTrack
          }
        });
      }
      res.json({ success: true, status: null });
    } catch (err) {
      logger.error({ err }, "[Get Music Status] Error");
      res.status(500).json({ success: false, error: "Failed to fetch music status" });
    }
  });
  app.post("/api/music/status", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { isPlaying, currentTrack, playbackPosition, broadcastEnabled } = req.body;
      const [existing] = await db.select().from(userMusicStatus).where(eq9(userMusicStatus.userUid, uid)).limit(1);
      const updateData = {
        isPlaying: Boolean(isPlaying),
        currentTrack: currentTrack || null,
        playbackPosition: typeof playbackPosition === "number" ? Math.max(0, Math.floor(playbackPosition)) : 0,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (typeof broadcastEnabled === "boolean") {
        updateData.broadcastEnabled = broadcastEnabled;
      }
      if (existing) {
        await db.update(userMusicStatus).set(updateData).where(eq9(userMusicStatus.userUid, uid));
      } else {
        await db.insert(userMusicStatus).values({
          userUid: uid,
          ...updateData,
          privacy: "everyone",
          broadcastEnabled: true
        });
      }
      broadcastAll({
        type: "user_music_status",
        uid,
        isPlaying: Boolean(isPlaying),
        currentTrack: currentTrack || null,
        playbackPosition: updateData.playbackPosition,
        updatedAt: Date.now()
      });
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "[Update Music Status] Error");
      res.status(500).json({ success: false, error: "Failed to update music status" });
    }
  });
  app.post("/api/music/static-track", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { staticTrack } = req.body;
      const [existing] = await db.select().from(userMusicStatus).where(eq9(userMusicStatus.userUid, uid)).limit(1);
      if (existing) {
        await db.update(userMusicStatus).set({ staticTrack: staticTrack || null, updatedAt: /* @__PURE__ */ new Date() }).where(eq9(userMusicStatus.userUid, uid));
      } else {
        await db.insert(userMusicStatus).values({
          userUid: uid,
          staticTrack: staticTrack || null,
          isPlaying: false,
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      res.json({ success: true, staticTrack: staticTrack || null });
    } catch (err) {
      logger.error({ err }, "[Set Static Track] Error");
      res.status(500).json({ success: false, error: "Failed to update static track" });
    }
  });
  app.put("/api/music/privacy", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { privacy, broadcastEnabled } = req.body;
      const updateData = { updatedAt: /* @__PURE__ */ new Date() };
      if (["everyone", "contacts", "nobody"].includes(privacy)) {
        updateData.privacy = privacy;
      }
      if (typeof broadcastEnabled === "boolean") {
        updateData.broadcastEnabled = broadcastEnabled;
      }
      const [existing] = await db.select().from(userMusicStatus).where(eq9(userMusicStatus.userUid, uid)).limit(1);
      if (existing) {
        await db.update(userMusicStatus).set(updateData).where(eq9(userMusicStatus.userUid, uid));
      } else {
        await db.insert(userMusicStatus).values({
          userUid: uid,
          ...updateData
        });
      }
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "[Update Music Privacy] Error");
      res.status(500).json({ success: false, error: "Failed to update privacy" });
    }
  });
  app.get("/api/music/favorites", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const favorites = await db.select().from(userMusicFavorites).where(eq9(userMusicFavorites.userUid, uid)).orderBy(desc4(userMusicFavorites.createdAt));
      res.json({ success: true, favorites: favorites.map((f) => f.trackData) });
    } catch (err) {
      logger.error({ err }, "[Get Favorites] Error");
      res.status(500).json({ success: false, error: "Failed to load favorites" });
    }
  });
  app.post("/api/music/favorites", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { track } = req.body;
      if (!track || !track.id) {
        return res.status(400).json({ success: false, error: "Invalid track data" });
      }
      const [existing] = await db.select().from(userMusicFavorites).where(and6(eq9(userMusicFavorites.userUid, uid), eq9(userMusicFavorites.trackId, track.id))).limit(1);
      if (!existing) {
        await db.insert(userMusicFavorites).values({
          userUid: uid,
          trackId: track.id,
          trackData: track,
          createdAt: /* @__PURE__ */ new Date()
        });
      }
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "[Add Favorite] Error");
      res.status(500).json({ success: false, error: "Failed to add favorite" });
    }
  });
  app.delete("/api/music/favorites/:trackId", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const trackId = req.params.trackId;
      await db.delete(userMusicFavorites).where(and6(eq9(userMusicFavorites.userUid, uid), eq9(userMusicFavorites.trackId, trackId)));
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "[Delete Favorite] Error");
      res.status(500).json({ success: false, error: "Failed to remove favorite" });
    }
  });
  app.get("/api/music/history", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const history = await db.select().from(userMusicHistory).where(eq9(userMusicHistory.userUid, uid)).orderBy(desc4(userMusicHistory.playedAt)).limit(60);
      res.json({ success: true, history: history.map((h) => h.trackData) });
    } catch (err) {
      logger.error({ err }, "[Get History] Error");
      res.status(500).json({ success: false, error: "Failed to load history" });
    }
  });
  app.post("/api/music/history", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      const { track } = req.body;
      if (!track || !track.id) {
        return res.status(400).json({ success: false, error: "Invalid track data" });
      }
      await db.delete(userMusicHistory).where(and6(eq9(userMusicHistory.userUid, uid), eq9(userMusicHistory.trackId, track.id)));
      await db.insert(userMusicHistory).values({
        userUid: uid,
        trackId: track.id,
        trackData: track,
        playedAt: /* @__PURE__ */ new Date()
      });
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "[Add History] Error");
      res.status(500).json({ success: false, error: "Failed to record history" });
    }
  });
  app.delete("/api/music/history", requireAuth, async (req, res) => {
    try {
      const uid = req.user.uid;
      await db.delete(userMusicHistory).where(eq9(userMusicHistory.userUid, uid));
      res.json({ success: true });
    } catch (err) {
      logger.error({ err }, "[Clear History] Error");
      res.status(500).json({ success: false, error: "Failed to clear history" });
    }
  });
}

// server/index.ts
init_logger();

// server/middleware/requestId.ts
init_logger();
import { randomUUID as randomUUID10 } from "crypto";
function requestIdMiddleware(req, _res, next) {
  const requestId = req.headers["x-request-id"] || randomUUID10();
  req.requestId = requestId;
  const ctx2 = { requestId };
  asyncLocalStorage.run(ctx2, () => {
    next();
  });
}

// server/middleware/errorHandler.ts
var AppError = class _AppError extends Error {
  constructor(message, statusCode = 500, code) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code || `ERR_${statusCode}`;
    Object.setPrototypeOf(this, new.target.prototype);
  }
  // Удобные статические фабрики
  static badRequest(message, code) {
    return new _AppError(message, 400, code || "BAD_REQUEST");
  }
  static unauthorized(message = "Unauthorized", code) {
    return new _AppError(message, 401, code || "UNAUTHORIZED");
  }
  static forbidden(message = "Forbidden", code) {
    return new _AppError(message, 403, code || "FORBIDDEN");
  }
  static notFound(message = "Not found", code) {
    return new _AppError(message, 404, code || "NOT_FOUND");
  }
  static conflict(message, code) {
    return new _AppError(message, 409, code || "CONFLICT");
  }
  static tooMany(message = "Too many requests", code) {
    return new _AppError(message, 429, code || "TOO_MANY_REQUESTS");
  }
};
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code
    });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({
      error: err.message || "Upload error",
      code: "UPLOAD_ERROR"
    });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON",
      code: "INVALID_JSON"
    });
  }
  console.error("[ErrorHandler] Unhandled error:", err);
  return res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    code: "INTERNAL_ERROR"
  });
}

// server/index.ts
async function startServer() {
  const app = express2();
  const scheduledTasks = [];
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  const isLanOrLocalhost = (originStr) => {
    return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(originStr);
  };
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin) || isLanOrLocalhost(origin)) {
        callback(null, true);
      } else {
        logger.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true
  }));
  app.use(securityHeaders);
  app.use(cookieParser(SESSION_SECRET));
  app.use(requestIdMiddleware);
  app.use(express2.json({ limit: "10mb" }));
  app.use("/api", defaultApiRateLimit);
  app.use("/api", (req, res, next) => {
    const requestPath = req.path;
    if (PUBLIC_API_PATHS.some((p) => requestPath.startsWith(p))) {
      return next();
    }
    const adminSecret = req.headers["x-admin-secret"];
    const expectedSecret = process.env.ADMIN_SECRET;
    if (adminSecret && expectedSecret) {
      const a = Buffer.from(String(adminSecret));
      const b = Buffer.from(expectedSecret);
      if (a.length === b.length && timingSafeEqual5(a, b)) {
        return next();
      }
    }
    authenticateToken(req, res, next);
  });
  if (!fs5.existsSync(UPLOADS_DIR)) {
    fs5.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use("/uploads", (req, res, next) => {
    const safeFilename = path6.basename(req.path);
    if (safeFilename !== req.path.slice(1)) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(safeFilename)}"`);
    express2.static(UPLOADS_DIR)(req, res, next);
  });
  try {
    await ensureDbReady();
    logger.info("[Server] DB ready and verified");
  } catch (err) {
    logger.error({ err }, "[Server] DB initialization failed");
    logger.error("[Server] Server continuing but DB may not work properly");
  }
  scheduledTasks.push(cron.schedule("0 * * * *", async () => {
    try {
      logger.info("[Cron] Cleaning sessions older than 7 days...");
      const { sessions: sessionsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const deleted = await db.delete(sessionsTable).where(
        and7(
          sql4`${sessionsTable.lastActive} < NOW() - INTERVAL '7 days'`,
          eq10(sessionsTable.revoked, false)
        )
      ).returning();
      if (deleted.length > 0) {
        logger.info(`[Cron] Removed ${deleted.length} expired sessions`);
      }
    } catch (err) {
      logger.error({ err }, "[Cron] Session cleanup error");
    }
  }));
  scheduledTasks.push(cron.schedule("0 3 * * *", async () => {
    try {
      logger.info("[Cron] Cleaning orphan files in uploads/...");
      const { messages: messagesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const rows = await db.select({ fileUrl: messagesTable.fileUrl }).from(messagesTable);
      const referencedFiles = /* @__PURE__ */ new Set();
      for (const row2 of rows) {
        if (row2.fileUrl) {
          const match = row2.fileUrl.match(/\/api\/download\/(.+)$/);
          if (match) {
            referencedFiles.add(match[1]);
          }
          const basename = path6.basename(row2.fileUrl);
          if (basename && basename !== row2.fileUrl) {
            referencedFiles.add(basename);
          }
        }
      }
      if (!fs5.existsSync(UPLOADS_DIR)) {
        return logger.info("[Cron] uploads/ directory does not exist, skipping");
      }
      const files = fs5.readdirSync(UPLOADS_DIR);
      let removedCount = 0;
      for (const file of files) {
        if (!referencedFiles.has(file)) {
          const filePath = path6.join(UPLOADS_DIR, file);
          try {
            if (file === "pgdata") continue;
            fs5.unlinkSync(filePath);
            removedCount++;
          } catch (err) {
            logger.warn(`[Cron] Failed to remove ${file}:`, err.message);
          }
        }
      }
      logger.info(`[Cron] Removed ${removedCount} orphan files (${files.length} total, ${referencedFiles.size} referenced)`);
    } catch (err) {
      logger.error({ err }, "[Cron] Orphan files cleanup error");
    }
  }));
  scheduledTasks.push(cron.schedule("0 4 * * *", async () => {
    try {
      logger.info("[Cron] Invalidating expired refresh sessions (> 30 days)...");
      const { sessions: sessionsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const deleted = await db.delete(sessionsTable).where(
        and7(
          sql4`${sessionsTable.createdAt} < NOW() - INTERVAL '30 days'`,
          eq10(sessionsTable.revoked, false)
        )
      ).returning();
      if (deleted.length > 0) {
        logger.info(`[Cron] Revoked ${deleted.length} expired refresh sessions`);
      }
    } catch (err) {
      logger.error({ err }, "[Cron] Refresh token invalidation error");
    }
  }));
  scheduledTasks.push(cron.schedule("0 2 * * 0", async () => {
    try {
      logger.info("[Cron] Cleaning audit_logs older than 30 days...");
      await db.execute(sql4`
        DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '30 days'
      `);
      logger.info("[Cron] Audit logs cleaned");
    } catch (err) {
      logger.error({ err }, "[Cron] Audit logs cleanup error");
    }
  }));
  logger.info("[Cron] Cron jobs scheduled:");
  logger.info("  - Sessions cleanup: every hour");
  logger.info("  - Orphan files cleanup: daily at 03:00");
  logger.info("  - Expired refresh sessions: daily at 04:00");
  logger.info("  - Audit logs cleanup: weekly (Sunday at 02:00)");
  await setupAuthRoutes(app);
  setupUserRoutes(app);
  setupChatRoutes(app);
  setupMessageRoutes(app);
  await setupUploadRoutes(app);
  await setupAdminRoutes(app);
  setupPushRoutes(app);
  setupCallRoutes(app);
  setupQrRoutes(app);
  setupSessionRoutes(app);
  setupBotRoutes(app);
  setupReportRoutes(app);
  setupThemeRoutes(app);
  setupGifRoutes(app);
  setupHealthRoutes(app);
  setupStickerRoutes(app);
  await setupAccountsRoutes(app);
  setupMusicRoutes(app);
  app.use(errorHandler);
  const isProd = process.env.NODE_ENV === "production" || process.env.PROD === "true";
  const distExists = fs5.existsSync(path6.resolve("dist", "index.html"));
  if (isProd && distExists) {
    const distPath = path6.resolve("dist");
    app.use(express2.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path6.join(distPath, "index.html"));
    });
    logger.info("[Server] Serving static production build from dist/");
  } else {
    const vite2 = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        allowedHosts: true,
        watch: {
          ignored: [
            "**/.tmp*/**",
            "**/uploads/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/.git/**",
            "**/*.sqlite*",
            "**/pgdata/**"
          ]
        }
      },
      appType: "spa"
    });
    app.use(vite2.middlewares);
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path6.resolve("index.html"));
    });
  }
  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`[Server] Server running on port ${PORT} (0.0.0.0:${PORT})`);
  });
  setupWebSocket(httpServer);
  globalThis.__broadcastStatusUpdate = broadcastStatusUpdate;
  globalThis.__broadcastPinnedMessagesUpdate = broadcastStatusUpdate;
  wsEvents.on("broadcast", (targetUids, data) => {
  });
  const SHUTDOWN_TIMEOUT = 1e4;
  let isShuttingDown = false;
  async function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);
    const forceExit = setTimeout(() => {
      logger.error(`[Shutdown] Forced exit after ${SHUTDOWN_TIMEOUT}ms timeout`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);
    forceExit.unref();
    try {
      logger.info("[Shutdown] Stopping cron tasks...");
      for (const task of scheduledTasks) {
        task.stop();
      }
      logger.info(`[Shutdown] Stopped ${scheduledTasks.length} cron tasks`);
      logger.info("[Shutdown] Closing WebSocket connections...");
      await closeAllWebSocketConnections();
      logger.info("[Shutdown] Closing HTTP server...");
      await new Promise((resolve, reject) => {
        httpServer.close((err) => {
          if (err) {
            logger.error({ err }, "[Shutdown] HTTP server close error");
            reject(err);
          } else {
            logger.info("[Shutdown] HTTP server closed");
            resolve();
          }
        });
      });
      logger.info("[Shutdown] Closing database connections...");
      try {
        const pgPool = db.$client?.pool || db.pool;
        if (pgPool && typeof pgPool.end === "function") {
          await pgPool.end();
          logger.info("[Shutdown] PostgreSQL pool closed");
        } else {
          logger.info("[Shutdown] No pool.end() available (PGlite embedded)");
        }
      } catch (dbErr) {
        logger.warn({ err: dbErr }, "[Shutdown] DB close warning (non-fatal)");
      }
      try {
        await vite.close();
        logger.info("[Shutdown] Vite dev server closed");
      } catch {
      }
      clearTimeout(forceExit);
      logger.info("[Shutdown] Graceful shutdown complete");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "[Shutdown] Error during shutdown");
      clearTimeout(forceExit);
      process.exit(1);
    }
  }
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
startServer().catch((err) => {
  logger.error({ err }, "[Server] Failed to start server");
  process.exit(1);
});
//# sourceMappingURL=server.mjs.map
