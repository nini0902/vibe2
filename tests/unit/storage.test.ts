// Unit tests for storage utilities
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LocalStorageAdapter } from '../../src/storage/LocalStorageAdapter.ts'
import { hexCrc32, serializeComponents, deserializeComponents } from '../../src/utils/json.ts'
import { createPlot, placeComponent, listComponents } from '../../src/game/GameState.ts'

describe('hexCrc32', () => {
  it('returns a hex string', () => {
    const result = hexCrc32('hello');
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  it('is deterministic', () => {
    expect(hexCrc32('test')).toBe(hexCrc32('test'));
  });

  it('differs for different inputs', () => {
    expect(hexCrc32('abc')).not.toBe(hexCrc32('xyz'));
  });
});

describe('serializeComponents / deserializeComponents', () => {
  it('round-trips components', () => {
    const plot = createPlot(20, 20);
    const { plot: p1 } = placeComponent(plot, 'wall', { x: 3, y: 4 });
    const components = listComponents(p1);
    const serialized = serializeComponents(components);
    const deserialized = deserializeComponents(serialized);
    expect(deserialized[0]?.type).toBe('wall');
    expect(deserialized[0]?.position).toEqual({ x: 3, y: 4 });
  });
});

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('saves and loads a design', () => {
    const saveResult = adapter.save({
      name: 'My House',
      plotWidth: 20,
      plotHeight: 20,
      components: [],
    });
    expect(saveResult.success).toBe(true);
    if (!saveResult.success) return;

    const loadResult = adapter.load(saveResult.design.id);
    expect(loadResult.success).toBe(true);
    if (loadResult.success) {
      expect(loadResult.design.name).toBe('My House');
    }
  });

  it('returns NOT_FOUND for missing id', () => {
    const result = adapter.load('nonexistent-id');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('NOT_FOUND');
  });

  it('returns INVALID_NAME for empty name', () => {
    const result = adapter.save({
      name: '',
      plotWidth: 20,
      plotHeight: 20,
      components: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('INVALID_NAME');
  });

  it('lists all designs', () => {
    adapter.save({ name: 'A', plotWidth: 20, plotHeight: 20, components: [] });
    adapter.save({ name: 'B', plotWidth: 20, plotHeight: 20, components: [] });
    const list = adapter.listAll();
    expect(list.length).toBe(2);
  });

  it('deletes a design', () => {
    const result = adapter.save({ name: 'X', plotWidth: 20, plotHeight: 20, components: [] });
    if (!result.success) return;
    const del = adapter.delete(result.design.id);
    expect(del.success).toBe(true);
    expect(adapter.listAll().length).toBe(0);
  });

  it('detects checksum mismatch (corrupted)', () => {
    const result = adapter.save({ name: 'Y', plotWidth: 20, plotHeight: 20, components: [] });
    if (!result.success) return;

    // Tamper with the data
    const raw = JSON.parse(localStorage.getItem('vibe_house_game_saves') ?? '[]');
    raw[0].checksum = 'deadbeef';
    localStorage.setItem('vibe_house_game_saves', JSON.stringify(raw));

    const loadResult = adapter.load(result.design.id);
    expect(loadResult.success).toBe(false);
    if (!loadResult.success) expect(loadResult.error).toBe('CORRUPTED');
  });
});
