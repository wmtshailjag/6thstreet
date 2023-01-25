import algoliasearch from 'algoliasearch';

export default function init(appID, adminKey) {
  try {
    return algoliasearch(appID, adminKey);
  } catch (err) {
    //
  }
}
