exports.handleCustomErrors = (err, req, res, next) => {
  //console.log(err);
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handlePSQLErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request >:(" });
  }
  if (err.code === "42P01") {
    res.status(404).send({ msg: "Table not found" });
  }
  if (err.code === "23502") {
    res.status(400).send({ msg: "Bad request, missing values" });
  }
  if (err.code === "23503") {
    res.status(400).send({
      msg: "Bad request: one or more input values is of incorrect type",
    });
  }
  if (err.code === "23505") {
    res.status(400).send({
      msg: `Bad request: ${err.detail}`,
    });
  }
  next(err);
};
