const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createLookupObject = (data, key1, key2) => {
  const obj = {};
  data.forEach((item) => {
    obj[item[key1]] = item[key2]
  })
  return obj;
}



