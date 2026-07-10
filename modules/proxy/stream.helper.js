/**
 * 流式响应辅助工具
 * 将上游 SSE 流透传给客户端
 */

function pipeStream(upstreamRes, clientRes) {
  clientRes.status(upstreamRes.status || 200);

  const headers = upstreamRes.headers || {};
  if (headers['content-type']) {
    clientRes.setHeader('Content-Type', headers['content-type']);
  }
  if (headers['cache-control']) {
    clientRes.setHeader('Cache-Control', headers['cache-control']);
  }
  if (headers['connection']) {
    clientRes.setHeader('Connection', headers['connection']);
  }

  upstreamRes.pipe(clientRes);

  upstreamRes.on('error', err => {
    console.error('Upstream stream error:', err.message);
    if (!clientRes.headersSent) {
      clientRes.status(502).end();
    } else {
      clientRes.end();
    }
  });
}

module.exports = {
  pipeStream
};
