export class CustomEntityBucketItems {
  static parentId = null;
  static names() {
    return Object.getOwnPropertyNames(new this());
  }
  static getByValue(value) {
    return this.names().find((bucket) => new this()[bucket] === value);
  }
  static getVariation(key) {
    return new this()[key];
  }
}