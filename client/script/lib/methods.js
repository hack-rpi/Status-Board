isValidURL = function(url) {
  if (/^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i
      .test(url)) {
    return true;
  } else {
    return false;
  }
}