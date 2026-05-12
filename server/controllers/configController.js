const configService = require('../services/configService')

exports.getPublic = async (req, res, next) => {
  try {
    const configs = await configService.getPublic()
    res.json(configs)
  } catch (err) { next(err) }
}

exports.getByKey = async (req, res, next) => {
  try {
    const config = await configService.getByKey(req.params.key)
    res.json(config)
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const config = await configService.update(req.params.key, req.body.value)
    res.json(config)
  } catch (err) { next(err) }
}
