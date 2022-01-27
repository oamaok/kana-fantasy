const { SQL } = require('sql-template-strings')

exports.default = {
  async up(db) {
    await db.query(`


CREATE TABLE "team" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL,
  "logo" TEXT NOT NULL
);

ALTER TABLE "player"
  DROP COLUMN "team",
  ADD COLUMN "teamId" INTEGER NOT NULL,
  ADD CONSTRAINT fk_team FOREIGN KEY ("teamId") REFERENCES team(id);

ALTER TABLE "fantasyTeam"
  ADD COLUMN "bought" BOOLEAN NOT NULL DEFAULT FALSE;

    `)
  },

  async down(db) {
    await db.exec(`
    
    SELECT 1;
    
    `)
  },
}
