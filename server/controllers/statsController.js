const statsService = require('../services/statsService')

exports.profile = async (req, res, next) => {
  try {
    const data = await statsService.getProfile()
    res.json(data)
  } catch (err) { next(err) }
}

exports.yearly = async (req, res, next) => {
  try {
    const data = await statsService.getYearly(req.query.year)
    res.json(data)
  } catch (err) { next(err) }
}
