export default async function getShopByBrands(params, options) {
  return new Promise((resolve, reject) => {
    const { index,client, ...queryOptions} = options;
    let genderForQuery = "";
    if(params.gender) {
      if(params.gender === "kids") {
        genderForQuery = [[`gender:Boy`,`gender:Girl`]];
      } else 
      genderForQuery = [[`gender: ${params.gender}`]]
    }
    // Algolia have max 1000 hits per request : so to get 1000+ records created queries  
    // Query to get recods from Page 1
    const queryCopy = {
      params: {
        query: params.query,
        facetFilters: genderForQuery,
        page: 1,
        hitsPerPage: params.limit        
      },      
      indexName: options.index.indexName
    };
    let queries = [];
    // Query to get recods from Page 0, 
    queries.push({      
      params: {
        query: params.query,
        facetFilters: genderForQuery,
        page: 0,
        hitsPerPage: params.limit
      },      
      indexName: options.index.indexName
    });
    queries.push(queryCopy);
    // Passing queries[] to get all the recordes for page 0 & 1 
    client.search(queries, (err, response = {}) => {
      if (err) {
        return reject(err);
      }      
      return resolve(response.results);
    });
  });
}
