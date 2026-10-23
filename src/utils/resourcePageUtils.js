export function settleLookups(keys, results) {
  const values = {};
  const errors = {};

  keys.forEach((key, index) => {
    const result = results[index];
    if (result?.status === "fulfilled") {
      values[key] = result.value;
    } else if (result?.status === "rejected") {
      errors[key] = result.reason;
    }
  });

  return { values, errors };
}

export function paginateRecords(records, requestedPage, requestedPageSize) {
  const pageSize = Math.max(1, Math.floor(requestedPageSize));
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(requestedPage)), pageCount);
  const startOffset = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageCount,
    items: records.slice(startOffset, startOffset + pageSize),
    startIndex: records.length ? startOffset + 1 : 0,
    endIndex: Math.min(startOffset + pageSize, records.length),
  };
}
