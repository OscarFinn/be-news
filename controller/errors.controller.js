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
    } else if (err.code === "42P01") {
        res.status(404).send({msg: "Table not found"})
    } else {
      next(err);
    }
  };
  