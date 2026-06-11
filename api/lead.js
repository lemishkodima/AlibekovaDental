const { handleLeadRequest } = require("../lib/lead-handler");

module.exports = async (req, res) => {
  return handleLeadRequest(req, res);
};
