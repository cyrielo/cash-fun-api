class HashTagHelper {

  static getHashTag(post) {
    const words = post.split(' ');
    const hashtags = words.filter((word) => {
      const regex = new RegExp(/(?:^|\s)(?:#)([a-zA-Z\d]+)/ig);
      if(regex.test(word)) {
        return word;
      }
    });
    return hashtags;
  }
}

export default HashTagHelper;
