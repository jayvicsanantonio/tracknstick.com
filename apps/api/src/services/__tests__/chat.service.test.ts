// Covers retrieveContext: the query's embedding from Workers AI, then the closest Atomic Habits passages.
// The AI binding is a stand-in that answers like Workers AI; Pinecone is mocked, so nothing leaves the test.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { retrieveContext } from '../chat.service.js';
import { takeConsole } from '../../tests/setup.js';

const query = vi.fn();

vi.mock('@pinecone-database/pinecone', () => ({
  Pinecone: class {
    index() {
      return { query };
    }
  },
}));

const EMBEDDING = [0.1, 0.2, 0.3];

/** An AI binding that answers an embedding request the way Workers AI does. */
function fakeAI() {
  const run = vi.fn(() =>
    Promise.resolve(
      Response.json({ shape: [1, EMBEDDING.length], data: [EMBEDDING] })
    )
  );
  return { binding: { run } as unknown as Ai, run };
}

describe('retrieveContext', () => {
  beforeEach(() => {
    query.mockReset();
  });

  it('embeds the query with bge-base-en-v1.5 on Workers AI', async () => {
    query.mockResolvedValue({ matches: [] });
    const ai = fakeAI();

    await retrieveContext(ai.binding, 'key', 'how do habits stick?');

    expect(ai.run).toHaveBeenCalledWith(
      '@cf/baai/bge-base-en-v1.5',
      { text: ['how do habits stick?'] },
      expect.anything()
    );
  });

  it('returns the closest passages, joined, for that embedding', async () => {
    query.mockResolvedValue({
      matches: [
        { metadata: { text: 'Make it obvious.' } },
        { metadata: { text: 'Make it easy.' } },
      ],
    });

    const context = await retrieveContext(fakeAI().binding, 'key', 'habits');

    expect(query).toHaveBeenCalledWith({
      vector: EMBEDDING,
      topK: 5,
      includeMetadata: true,
    });
    expect(context).toBe('Make it obvious.\n\n---\n\nMake it easy.');
  });

  it('returns no context, and asks nothing, for an empty query', async () => {
    const ai = fakeAI();

    expect(await retrieveContext(ai.binding, 'key', '')).toBe('');
    expect(ai.run).not.toHaveBeenCalled();
  });

  it('returns no context when Pinecone fails, and logs why', async () => {
    query.mockRejectedValue(new Error('index unavailable'));

    expect(await retrieveContext(fakeAI().binding, 'key', 'habits')).toBe('');
    expect(takeConsole('error')).toEqual([
      expect.stringContaining('index unavailable'),
    ]);
  });
});
