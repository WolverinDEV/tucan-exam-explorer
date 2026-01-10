CREATE TABLE "exams" (
	"id" bigint PRIMARY KEY NOT NULL,
	"timestamp" date DEFAULT now() NOT NULL,
	"semesterName" varchar(32) NOT NULL,
	"moduleId" varchar(32) NOT NULL,
	"moduleName" varchar(128) NOT NULL,
	"examName" varchar(128) NOT NULL,
	"participationTotal" integer NOT NULL,
	"participationMissing" integer NOT NULL,
	"gradeOverview" json DEFAULT '{}'::json,
	"metadata" json DEFAULT '{}'::json
);
