export default class ApiFeature {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
    this.page = 1;
    this.limit = 15;
    this.totalPages = 1;
  }

  async pagination() {
    let page = this.queryString.page ? parseInt(this.queryString.page) : 1;
    let limit = this.queryString.limit ? parseInt(this.queryString.limit) : 15;

    if (limit > 15) limit = 15; // Ensure max 15 items per page
    if (page < 1) page = 1; // Ensure page is at least 1

    let skip = (page - 1) * limit;

    // Count total documents
    const totalDocs = await this.mongooseQuery.model.countDocuments();
    this.totalPages = Math.ceil(totalDocs / limit);

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.page = page;

    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort.split(",").join(" ");
      this.mongooseQuery.sort(sortBy);
    }
    return this;
  }
  // search(filterType) {
  //   if (this.queryStr.keyword) {
  //     this.mongooseQuery.find(
  //         { filterType: { $regex: this.queryStr.keyword, $options: "i" } },
  //     );
  //   }
  //   return this;
  // }
}
