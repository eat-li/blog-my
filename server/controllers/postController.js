const postService = require('../services/postService')

exports.list = async (req, res, next) => {
  try {
    const result = await postService.list(req.query)
    res.json(result)
  } catch (err) { next(err) }
}

exports.latest = async (req, res, next) => {
  try {
    const result = await postService.getLatest()
    res.json(result)
  } catch (err) { next(err) }
}

exports.heatmap = async (req, res, next) => {
  try {
    const result = await postService.getHeatmap()
    res.json(result)
  } catch (err) { next(err) }
}

exports.archive = async (req, res, next) => {
  try {
    const result = await postService.getArchive()
    res.json(result)
  } catch (err) { next(err) }
}

exports.detail = async (req, res, next) => {
  try {
    const post = await postService.getById(req.params.id)
    res.json({ post })
  } catch (err) { next(err) }
}

exports.view = async (req, res, next) => {
  try {
    const result = await postService.incrementViews(req.params.id)
    res.json(result)
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const post = await postService.create(req.body, req.userId)
    res.status(201).json({ post })
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const post = await postService.update(req.params.id, req.body)
    res.json({ post })
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    await postService.delete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (err) { next(err) }
}
