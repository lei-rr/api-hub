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
    console.error('Upstream stream error:', err);
    if (!clientRes.headersSent) {
      clientRes.status(502).end();
    } else {
      clientRes.end();
    }
  });
}

function sendSSE(clientRes) {
  clientRes.setHeader('Content-Type', 'text/event-stream');
  clientRes.setHeader('Cache-Control', 'no-cache');
  clientRes.setHeader('Connection', 'keep-alive');
  clientRes.status(200);
}

function writeSSEChunk(clientRes, data) {
  clientRes.write(`data: ${JSON.stringify(data)}\n\n`);
}

function writeSSEDone(clientRes) {
  clientRes.write('data: [DONE]\n\n');
  clientRes.end();
}

module.exports = {
  pipeStream,
  sendSSE,
  writeSSEChunk,
  writeSSEDone
};
