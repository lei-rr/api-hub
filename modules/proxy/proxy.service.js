/**
 * 中转服务
 * 只负责把请求转发到已解析好的上游渠道
 * 上游地址、密钥、模型均来自 req.routeContext
 * 使用 axios 直接转发，避免 OpenAI SDK 额外头部被上游 WAF 拦截
 */

const axios = require('axios');
const streamHelper = require('./stream.helper');

function buildUpstreamUrl(baseUrl, pathname) {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = pathname.startsWith('/') ? pathname : '/' + pathname;
  return cleanBase + cleanPath;
}

function createHeaders(req) {
  return {
    'Content-Type': 'application/json',
    'Accept': req.headers['accept'] || 'application/json'
  };
}

function mapBody(body, upstreamModel) {
  if (!body || typeof body !== 'object') return body;
  return {
    ...body,
    model: upstreamModel
  };
}

async function forward(req, res, context) {
  const { channel, key, upstreamModel } = context;
  const upstreamUrl = buildUpstreamUrl(channel.baseUrl, req.path);
  const upstreamBody = mapBody(req.body, upstreamModel);

  const headers = createHeaders(req);
  headers['Authorization'] = `Bearer ${key.value}`;

  const isStream = upstreamBody.stream === true;

  try {
    if (isStream) {
      const response = await axios({
        method: req.method,
        url: upstreamUrl,
        headers,
        data: upstreamBody,
        responseType: 'stream',
        timeout: 120000,
        validateStatus: () => true
      });

      streamHelper.pipeStream(response.data, res);
    } else {
      const response = await axios({
        method: req.method,
        url: upstreamUrl,
        headers,
        data: upstreamBody,
        timeout: 120000,
        validateStatus: () => true
      });

      res.status(response.status).json(response.data);
    }
  } catch (err) {
    console.error('Proxy forward error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: {
          message: 'Upstream request failed',
          code: 'UPSTREAM_ERROR'
        }
      });
    }
  }
}

module.exports = {
  forward
};
