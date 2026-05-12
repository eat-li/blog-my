const githubService = require('../services/githubService')

exports.repos = async (req, res, next) => {
  try {
    const repos = await githubService.getRepos()
    res.json({ repos })
  } catch (err) { next(err) }
}

exports.user = async (req, res, next) => {
  try {
    const user = await githubService.getUser()
    res.json({ user })
  } catch (err) { next(err) }
}
