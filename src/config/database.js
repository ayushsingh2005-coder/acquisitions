import 'dotenv/config';

import {neon} from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '#models/user.model.js';

// initialzing neon client
const sql = neon(process.env.DATABASE_URL);

// initialzing drizzle url
const db = drizzle(sql);

export {db , sql};