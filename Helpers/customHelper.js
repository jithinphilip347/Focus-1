
const customHelper = (currentPage, pageNumber) => {
    if (currentPage === pageNumber) {
      return 'active';
    }
    return '';
  };

  module.exports =customHelper;
  