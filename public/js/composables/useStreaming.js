/**
 * SSE 流式读取组合式函数
 */

function useStreaming() {
  function parseSSE(buffer) {
    const lines = buffer.split('\n');
    const events = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;

      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') {
        events.push({ done: true });
        continue;
      }

      try {
        events.push({ done: false, data: JSON.parse(data) });
      } catch (e) {
        // ignore invalid json
      }
    }

    return events;
  }

  async function* streamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = parseSSE(buffer);
      buffer = '';

      for (const event of events) {
        yield event;
      }
    }
  }

  return {
    parseSSE,
    streamResponse
  };
}
