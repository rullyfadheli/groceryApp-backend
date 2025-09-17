import { Client } from "@opensearch-project/opensearch";
import dotenv from "dotenv";
dotenv.config();

const osClient = new Client({
  node: process.env.OS_HOST || "http://localhost:9200",
});

export default osClient;
