class QueryFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(allowedFields = []) {
    const queryObj = { ...this.queryString };

    ['page', 'sort', 'limit'].forEach((field) => delete queryObj[field]);

    if (allowedFields.length > 0) {
      Object.keys(queryObj).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete queryObj[key];
        }
      });
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  sort(defaultSort = '-createdAt') {
    const sortBy = this.queryString.sort ? this.queryString.sort.split(',').join(' ') : defaultSort;
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate() {
    const page = Number.parseInt(this.queryString.page, 10) || 1;
    const limit = Number.parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit, skip };
    return this;
  }
}

module.exports = QueryFeatures;
