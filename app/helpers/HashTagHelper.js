class HashTagHelper {

  static getHashTag(post) {
    const words = post.split(' ');
    const hashtags = [];
    words.filter((word) => {
      const regex = new RegExp(/(?:^|\s)(?:#)([a-zA-Z\d]+)/ig);
      if(regex.test(word)) {
        hashtags.push(word.substring(1));
      }
    });
    return hashtags;
  }

  /**
    * @method compare
    * @param {Array} old
    * @param {Array} newer
    * @desc compare two set of hashtags, and return an object
    * @return {object} object literal with key obsolete and newer
  */
  static compare(old, newer) {
    let duplicate = old.filter((word) => {
      if(newer.indexOf(word) >= 0) {
        return word;
      }
    });
    duplicate.forEach((word) => {
      old.splice(old.indexOf(word), 1);
      newer.splice(newer.indexOf(word), 1);
    });
    return {
      obsolete: old,
      newer
    };
  }
}

export default HashTagHelper;
