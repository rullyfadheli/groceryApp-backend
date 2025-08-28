import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL as string;
const sql = postgres(connectionString, {
  /**
   * The maximum number of connections to allow in the pool.
   * A good starting point is the number of CPU cores available.
   * Default is 10.
   */
  max: 10,

  /**
   * The number of seconds a connection can be idle before it is closed.
   * This helps in releasing unused resources back to the database.
   */
  idle_timeout: 20, // 20 seconds

  /**
   * The maximum lifetime of a connection in seconds.
   * After this time, the connection will be closed, even if it's active.
   * Useful for cycling connections, load balancing, and preventing memory leaks.
   */
  max_lifetime: 60 * 30, // 30 minutes

  /**
   * The time in seconds to wait for a connection to be established.
   * Prevents the application from hanging if the database is unresponsive.
   */
  connect_timeout: 30, // 30 seconds
});

export default sql;
