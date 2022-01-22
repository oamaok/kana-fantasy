const sql = require('sql-template-strings')

exports.default = {
  async up(db) {
    await db.query(`

CREATE TABLE season (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "lockDate" DATE NOT NULL
);

CREATE TABLE player (
  "steamId" TEXT,
  "username" TEXT NOT NULL,
  "avatar" TEXT NOT NULL,
  "team" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "seasonId" INTEGER NOT NULL,
  "division" TEXT NOT NULL,
  PRIMARY KEY ("steamId", "seasonId"),
  CONSTRAINT fk_season FOREIGN KEY ("seasonId") REFERENCES season(id)
);

CREATE TABLE "playerRole" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "targets" JSONB NOT NULL
);

CREATE TABLE "user" (
  "id" TEXT PRIMARY KEY,
  "username" TEXT UNIQUE NOT NULL,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "avatar" TEXT
);

CREATE TABLE "fantasyTeam" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "seasonId" INTEGER NOT NULL,
  "division" TEXT NOT NULL,

  UNIQUE("userId", "seasonId", "division"), 
  CONSTRAINT fk_season FOREIGN KEY ("seasonId") REFERENCES season(id),
  CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "user"(id)
);

CREATE TABLE "fantasyTeam_player" (
  "id" SERIAL PRIMARY KEY,
  "teamId" INTEGER NOT NULL,
  "playerId" TEXT NOT NULL,
  "roleId" INTEGER DEFAULT NULL,
  "seasonId" INTEGER NOT NULL,

  CONSTRAINT fk_team FOREIGN KEY ("teamId") REFERENCES "fantasyTeam"(id),
  CONSTRAINT fk_season FOREIGN KEY ("seasonId") REFERENCES "season"(id),
  CONSTRAINT fk_player FOREIGN KEY ("playerId", "seasonId") REFERENCES player("steamId", "seasonId"),
  CONSTRAINT fk_role FOREIGN KEY ("roleId") REFERENCES "playerRole"(id) 
);

    `)
  },

  async down(db) {
    await db.exec(`
    
    SELECT 1;
    
    `)
  },
}
