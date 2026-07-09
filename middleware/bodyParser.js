/**
 * 自定义请求体解析中间件
 * 兼容 JSON 请求体，同时保留原始 rawBody 供流式转发使用
 */
function bodyParser(req, res, next) {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    return next();
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return next();
  }

  let chunks = [];

  req.on('data', chunk => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks);
    if (req.rawBody.length > 0) {
      try {
        req.body = JSON.parse(req.rawBody.toString('utf8'));
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    } else {
      req.body = {};
    }
    next();
  });

  req.on('error', err => {
    next(err);
  });
}

module.exports = bodyParser;
