import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const cards=sqliteTable('cards',{slug:text('slug').primaryKey(),data:text('data').notNull(),updatedAt:integer('updated_at').notNull()});
export const notices=sqliteTable('notices',{id:text('id').primaryKey(),title:text('title').notNull(),body:text('body').notNull(),url:text('url').notNull(),createdAt:integer('created_at').notNull()});
export const events=sqliteTable('events',{id:text('id').primaryKey(),slug:text('slug').notNull(),kind:text('kind').notNull(),visitor:text('visitor').notNull(),createdAt:integer('created_at').notNull()},t=>[index('event_slug_time').on(t.slug,t.createdAt)]);
export const sessions=sqliteTable('sessions',{token:text('token').primaryKey(),role:text('role').notNull(),expires:integer('expires').notNull()});
export const attempts=sqliteTable('attempts',{key:text('key').primaryKey(),count:integer('count').notNull(),reset:integer('reset').notNull()});
