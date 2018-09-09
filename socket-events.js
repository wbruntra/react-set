const guestAction = action => {
  return {
    type: action.type,
    payload: action.payload
  };
};

module.exports = {
  guestAction
};
