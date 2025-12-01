/**
 * A script to perform an initial bulk synchronization of data
 * from PostgreSQL to OpenSearch.
 */
// import productServices from "../services/productServices.js";

// Types
// import type postgres from "postgres";
// import osClient from "../config/opensearch-client.ts";

// const indexName = "products";

// async function syncData() {
//   try {
//     const products: postgres.RowList<postgres.Row[]> =
//       await productServices.getAllProduct();

//     console.log(products);

//     if (products.length === 0) {
//       console.log("No products to sync.");
//       return;
//     }

//     const formattedData = products.map((items) => {
//       const discountvalue: number =
//         (items.discount_percentage * items.price) / 100;
//       const final_price = items.price - discountvalue;
//       return { ...items, final_price };
//     }) as unknown as postgres.RowList<postgres.Row[]>;

//     console.log(
//       `Found ${formattedData.length} products. Preparing for bulk indexing...`
//     );

//     // Format data for OpenSearch bulk API
//     const body = formattedData.flatMap((doc) => [
//       { index: { _index: indexName, _id: doc.id } },
//       doc,
//     ]);

//     const { body: bulkResponse } = await osClient.bulk({ refresh: true, body });

//     if (bulkResponse.errors) {
//       console.error("Bulk indexing had errors:", bulkResponse.errors);
//     } else {
//       console.log("Successfully indexed all products!");
//     }
//   } catch (error) {
//     console.error("Synchronization failed:", error);
//   } finally {
//     return;
//   }
// }

// export default syncData;
